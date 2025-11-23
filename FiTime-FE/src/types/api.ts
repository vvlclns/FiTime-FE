export interface SolutionResponse {
  status: string;
  message: string;
  solutions: SolutionEntry[];
}

export interface SolutionEntry {
  day: number;
  start_hour: number;
  end_hour: number;
  rank: number;
  unavailableUsers: SolutionUserEntry[];
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
