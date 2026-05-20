import { createWorkflowRoutes } from "./routes/workflows";
import { createDefaultRunners } from "./runners";

const workflowsDir = process.env.FLOWAGENT_WORKFLOWS_DIR ?? "workflows";
const runsDir = process.env.FLOWAGENT_RUNS_DIR ?? "runs";
const pilotContactEmail = process.env.FLOWAGENT_PILOT_CONTACT_EMAIL;
// Optional — only set this if the user wants to share dashboard results
// to a phone via signed URLs. If unset, the share UI is hidden and the
// /share/* routes return 503 with an instruction page.
const shareSecret = process.env.FLOWAGENT_SHARE_SECRET;

export const app = createWorkflowRoutes({
  workflowsDir,
  runsDir,
  runners: createDefaultRunners(),
  pilotContactEmail,
  shareSecret,
});
