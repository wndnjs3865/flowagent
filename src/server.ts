import { createWorkflowRoutes } from "./routes/workflows";
import { createDefaultRunners } from "./runners";

const workflowsDir = process.env.FLOWAGENT_WORKFLOWS_DIR ?? "workflows";
const runsDir = process.env.FLOWAGENT_RUNS_DIR ?? "runs";
const pilotContactEmail = process.env.FLOWAGENT_PILOT_CONTACT_EMAIL;

export const app = createWorkflowRoutes({
  workflowsDir,
  runsDir,
  runners: createDefaultRunners(),
  pilotContactEmail,
});
