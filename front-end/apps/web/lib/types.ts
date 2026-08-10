export type AnalysisType = "event" | "transaction";

export interface DensityBucket {
  start_block: number;
  end_block: number;
  count: number;
  cumulative_count: number;
}

export interface AnalysisResult {
  request_type: AnalysisType;
  address: string;
  network: string;
  snapshot_block: number;
  interval_size: number;
  total_blocks: number;
  total_items: number;
  elapsed_time: number;
  max_count: number;
  cached: boolean;
  buckets: DensityBucket[];
}
