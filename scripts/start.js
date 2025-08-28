import { execSync } from "child_process";

const target = process.env.DEPLOY_MODE || "develop";

if (target === "frontend") {
  console.log("Starting Next.js frontend...");
  execSync("next start", { stdio: "inherit" });
} else if (target === "backend") {
  console.log("Starting Express backend...");
  execSync("node server.js", { stdio: "inherit" });
} else {
  console.log("Starting local dev server...");
  execSync('concurrently "npm run dev:next" "npm run dev:node"', {
    stdio: "inherit",
  });
}
