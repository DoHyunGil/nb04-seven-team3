import { execSync } from "child_process";

const target = process.env.DEPLOY_MODE || "develop";

if (target === "frontend") {
  console.log("Building Next.js frontend...");
  execSync("next build", { stdio: "inherit" });
} else if (target === "backend") {
} else {
  console.log("Building Next.js frontend...");
  execSync("next build", { stdio: "inherit" });
}
