export type Result = {
  workflowName: string;
  runId: string;
  /** ISO-8601 UTC string. Lexicographically comparable. */
  startedAt: string;
  lastOutput: string;
};

export function getLatest(_runsDir: string, _workflow: string): Result | null {
  return null;
}
