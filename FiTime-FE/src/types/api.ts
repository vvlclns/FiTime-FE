export interface SolutionResponse {
  status: string;
  message: string;
  solution: SolutionEntry[];
}

export interface SolutionEntry {
  day: number;
  start_hour: number;
  end_hour: number;
  rank: number;
  unavailable_users: SolutionUserEntry[];
}

export interface SolutionUserEntry {
  username: string;
}

export interface HeatmapResponse {
  status: string;
  message: string;
  num_users: number;
  num_available: number[][];
}
