import { createApp } from "./app.js";
import { createAuthRuntime } from "./auth/createAuthRuntime.js";

const port = Number(process.env.PORT || 8787);
const authRuntime = createAuthRuntime();
await authRuntime.repository.init();
createApp({ authRuntime }).listen(port, "0.0.0.0", () => {
  console.log(`WISE TOUCH API listening on port ${port}`);
});
