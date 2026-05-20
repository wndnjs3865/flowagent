import { createWorkflowRoutes } from "./routes/workflows";
import { createDefaultRunners } from "./runners";

const workflowsDir = process.env.FLOWAGENT_WORKFLOWS_DIR ?? "workflows";
const runsDir = process.env.FLOWAGENT_RUNS_DIR ?? "runs";
const pilotContactEmail = process.env.FLOWAGENT_PILOT_CONTACT_EMAIL;
// Optional — only set this if the user wants to share dashboard results
// to a phone via signed URLs. If unset, the share UI is hidden and the
// /share/* routes return 503 with an instruction page.
const shareSecret = process.env.FLOWAGENT_SHARE_SECRET;
// Optional — used to build user-facing share URLs behind a reverse proxy.
// See WorkflowRoutesDeps.publicOrigin for the full precedence rules.
const publicOrigin = process.env.FLOWAGENT_PUBLIC_ORIGIN;

export const app = createWorkflowRoutes({
  workflowsDir,
  runsDir,
  runners: createDefaultRunners(),
  pilotContactEmail,
  shareSecret,
  publicOrigin,
});
