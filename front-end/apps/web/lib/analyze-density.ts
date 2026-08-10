import {
  HypersyncClient,
  JoinMode,
  type Query,
} from "@envio-dev/hypersync-client";

import { getActiveChain } from "@/lib/networks";
import type { AnalysisResult, AnalysisType } from "@/lib/types";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 20;
const TARGET_BUCKETS = 64;

interface CacheEntry {
  expiresAt: number;
  result: AnalysisResult;
}

const resultCache = new Map<string, CacheEntry>();

export class NoDataError extends Error {}

function getIntervalSize(snapshotHeight: number): number {
  const rawInterval = Math.max(5_000, snapshotHeight / TARGET_BUCKETS);
  const magnitude = 10 ** Math.floor(Math.log10(rawInterval));
  const normalized = rawInterval / magnitude;
  const niceMultiplier = [1, 2, 2.5, 5, 10].find(
    (candidate) => candidate >= normalized
  );

  return Math.max(5_000, (niceMultiplier ?? 10) * magnitude);
}

function getCachedResult(key: string): AnalysisResult | null {
  const entry = resultCache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    resultCache.delete(key);
    return null;
  }

  return { ...entry.result, cached: true };
}

function cacheResult(key: string, result: AnalysisResult) {
  if (resultCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = resultCache.keys().next().value;
    if (oldestKey) {
      resultCache.delete(oldestKey);
    }
  }

  resultCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    result,
  });
}

export async function analyzeDensity(input: {
  address: string;
  type: AnalysisType;
  network: string;
}): Promise<AnalysisResult> {
  const address = input.address.toLowerCase();
  const network = input.network.toLowerCase();
  const cacheKey = `${network}:${input.type}:${address}`;
  const cachedResult = getCachedResult(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const apiToken = process.env.ENVIO_API_TOKEN;
  if (!apiToken) {
    throw new Error("ENVIO_API_TOKEN is not configured");
  }

  const chain = await getActiveChain(network);
  if (!chain) {
    throw new Error(`Unsupported HyperSync network: ${network}`);
  }

  const startedAt = performance.now();
  const client = new HypersyncClient({
    url: chain.url,
    apiToken,
  });
  const snapshotHeight = await client.getHeight();
  const intervalSize = getIntervalSize(snapshotHeight);
  const counts = new Array(Math.ceil(snapshotHeight / intervalSize)).fill(
    0
  ) as number[];

  const query: Query = {
    fromBlock: 0,
    toBlock: snapshotHeight,
    fieldSelection:
      input.type === "event"
        ? { log: ["BlockNumber"] }
        : { transaction: ["BlockNumber"] },
    joinMode: JoinMode.JoinNothing,
    ...(input.type === "event"
      ? { logs: [{ address: [address] }] }
      : {
          transactions: [{ from: [address] }, { to: [address] }],
        }),
  };

  const stream = await client.stream(query, {
    concurrency: 10,
    maxBufferedBytes: 32 * 1024 * 1024,
  });
  let totalItems = 0;

  try {
    while (true) {
      const response = await stream.recv();
      if (response === null) {
        break;
      }

      const items =
        input.type === "event"
          ? response.data.logs
          : response.data.transactions;

      for (const item of items) {
        if (item.blockNumber === undefined) {
          continue;
        }

        const bucketIndex = Math.floor(item.blockNumber / intervalSize);
        if (counts[bucketIndex] !== undefined) {
          counts[bucketIndex] += 1;
          totalItems += 1;
        }
      }
    }
  } finally {
    await stream.close();
  }

  if (totalItems === 0) {
    const itemName = input.type === "event" ? "events" : "transactions";
    throw new NoDataError(
      `No ${itemName} found for ${address} on ${network}`
    );
  }

  let cumulativeCount = 0;
  const buckets = counts.map((count, index) => {
    cumulativeCount += count;
    return {
      start_block: index * intervalSize,
      end_block: Math.min(
        (index + 1) * intervalSize - 1,
        snapshotHeight - 1
      ),
      count,
      cumulative_count: cumulativeCount,
    };
  });

  const result: AnalysisResult = {
    request_type: input.type,
    address,
    network,
    snapshot_block: snapshotHeight,
    interval_size: intervalSize,
    total_blocks: snapshotHeight,
    total_items: totalItems,
    elapsed_time: (performance.now() - startedAt) / 1000,
    max_count: Math.max(...counts),
    cached: false,
    buckets,
  };

  cacheResult(cacheKey, result);
  return result;
}
