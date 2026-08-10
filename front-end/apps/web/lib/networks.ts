const CHAINS_URL =
  "https://chains.hyperquery.xyz/active_chains?ecosystem=evm";
const NETWORK_ALIASES: Record<string, string> = {
  ethereum: "eth",
  mainnet: "eth",
};

interface ChainResponse {
  name?: unknown;
  chain_id?: unknown;
}

export interface ActiveChain {
  name: string;
  chainId: number;
  url: string;
}

export async function getActiveChains(): Promise<ActiveChain[]> {
  const response = await fetch(CHAINS_URL, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Unable to load HyperSync networks (${response.status})`);
  }

  const payload = (await response.json()) as ChainResponse[];

  return payload
    .filter(
      (chain): chain is { name: string; chain_id: number } =>
        typeof chain.name === "string" &&
        /^[a-z0-9-]+$/.test(chain.name) &&
        typeof chain.chain_id === "number"
    )
    .map((chain) => ({
      name: chain.name,
      chainId: chain.chain_id,
      url: `https://${chain.name}.hypersync.xyz`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getActiveChain(name: string): Promise<ActiveChain | null> {
  const requestedName = name.toLowerCase();
  const normalizedName = NETWORK_ALIASES[requestedName] ?? requestedName;
  const chains = await getActiveChains();
  return chains.find((chain) => chain.name === normalizedName) ?? null;
}
