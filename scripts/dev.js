const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.join(__dirname, "..");
const expoCli = path.join(projectRoot, "node_modules", "expo", "bin", "cli");

const child = spawn(process.execPath, [expoCli, ...process.argv.slice(2)], {
  cwd: projectRoot,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
