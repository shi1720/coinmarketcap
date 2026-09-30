import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
// Builds actual source before publishing. Does not create projects, grant IAM,
// attach billing or overwrite another Hosting site.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const environmentFile = resolve(repository, ".env.firebase");
if (!existsSync(environmentFile))
  throw new Error(
    "Add public VITE_FIREBASE_* configuration to ignored .env.firebase first.",
  );
const firebaseConfig = JSON.parse(
  readFileSync(resolve(repository, "firebase.json"), "utf8"),
);
const project = JSON.parse(
  readFileSync(resolve(repository, ".firebaserc"), "utf8"),
).projects?.default;
const environment = {
  ...parseEnv(readFileSync(environmentFile, "utf8")),
  ...process.env,
};
for (const name of [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
]) {
  if (!environment[name]?.trim())
    throw new Error(`Missing public Firebase configuration: ${name}.`);
}
if (!project || environment.VITE_FIREBASE_PROJECT_ID !== project)
  throw new Error(
    "Firebase app project and .firebaserc destination must match before publishing.",
  );
if (
  !firebaseConfig.hosting?.site ||
  firebaseConfig.hosting.public !== "dist-firebase"
)
  throw new Error(
    "Expected an explicit Hosting site and dist-firebase output directory.",
  );
const commands = [
  ["npm", ["run", "typecheck"]],
  ["npm", ["test"]],
  ["npm", ["run", "test:rules"]],
  ["npm", ["run", "build:firebase"]],
  [
    "npx",
    [
      "--yes",
      "firebase-tools@15.32.0",
      "deploy",
      "--only",
      "hosting,firestore:rules",
      "--project",
      project,
      "--non-interactive",
    ],
  ],
];
if (process.argv.includes("--dry-run")) {
  console.log(
    `Validated Firebase project ${project}, Hosting site ${firebaseConfig.hosting.site}. No commands executed.`,
  );
  for (const [command, args] of commands)
    console.log([command, ...args].join(" "));
  process.exit(0);
}
for (const [command, args] of commands) {
  const run = spawnSync(command, args, {
    cwd: repository,
    stdio: "inherit",
    shell: false,
  });
  if (run.error) {
    console.error(`Could not start ${command}: ${run.error.message}`);
    process.exit(1);
  }
  if (run.status !== 0) process.exit(run.status ?? 1);
}
