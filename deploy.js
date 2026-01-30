#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  intro,
  outro,
  spinner,
  select,
  isCancel,
  cancel,
} from "@clack/prompts";
import { execa } from "execa";
import chalk from "chalk";
import terminalLink from "terminal-link";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../..");
const DAGS_DIR = path.join(ROOT_DIR, "dags");

// Check Environment Variables
if (!process.env.GCS_BUCKET_NAME || !process.env.COMPOSER_URL_BASE) {
  console.log(chalk.red("Error: Missing Configuration"));
  console.log(
    chalk.yellow(
      "Please set GCS_BUCKET_NAME and COMPOSER_URL_BASE environment variables.",
    ),
  );
  console.log(
    chalk.dim(
      "If using VS Code, add them to .vscode/tasks.json in the 'options.env' block.",
    ),
  );
  process.exit(0);
}

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const COMPOSER_URL_BASE = process.env.COMPOSER_URL_BASE;
const BUCKET_URL = `gs://${GCS_BUCKET_NAME}/dags`;

// Helper to recursively count files
function countFiles(dir) {
  let results = 0;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes(".git") && !file.includes("__pycache__")) {
        results += countFiles(file);
      }
    } else {
      results += 1;
    }
  });
  return results;
}

async function main() {
  console.clear();

  intro(chalk.bgCyan(chalk.black(" Cloud Composer Deployment ")));

  const s = spinner();

  // 1. Scan for DAG folders
  s.start(`Looking for DAGs in: ${path.relative(process.cwd(), DAGS_DIR)}`);

  if (!fs.existsSync(DAGS_DIR)) {
    s.stop(`Directory '${DAGS_DIR}' not found.`, 1);
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const folders = fs.readdirSync(DAGS_DIR).filter((file) => {
    return (
      fs.statSync(path.join(DAGS_DIR, file)).isDirectory() &&
      !file.startsWith(".")
    );
  });

  if (folders.length === 0) {
    s.stop(`No folders found in ${DAGS_DIR}`, 1);
    cancel("Operation cancelled.");
    process.exit(0);
  }

  s.stop(`Found ${folders.length} Airflow DAGs.`);

  // 2. Interactive Selection
  const selectedFolder = await select({
    message: "Select an Airflow DAG to deploy:",
    options: folders.map((f) => ({ label: f, value: f })),
  });

  if (isCancel(selectedFolder)) {
    cancel("Deployment cancelled.");
    process.exit(0);
  }

  const sourcePath = path.join(DAGS_DIR, selectedFolder);

  // 3. Validation Logic
  s.start("Validating Git status...");

  try {
    // A. Check if valid git repo
    try {
      await execa("git", [
        "-C",
        sourcePath,
        "rev-parse",
        "--is-inside-work-tree",
      ]);
    } catch (e) {
      s.stop(
        `Validation Failed: ${selectedFolder} is not a git repository.`,
        1,
      );
      cancel("The DAG folder must be version controlled.");
      process.exit(0);
    }

    // B. Check Branch Name
    const { stdout: branch } = await execa("git", [
      "-C",
      sourcePath,
      "rev-parse",
      "--abbrev-ref",
      "HEAD",
    ]);
    if (branch.trim() !== "main") {
      s.stop(`Validation Failed: You are on branch '${branch.trim()}'.`, 1);
      cancel("You must be on the 'main' branch to deploy.");
      process.exit(0);
    }

    // C. Check Sync Status
    s.message("Checking remote sync status...");
    await execa("git", ["-C", sourcePath, "fetch", "origin", "main"]);

    const { stdout: localHash } = await execa("git", [
      "-C",
      sourcePath,
      "rev-parse",
      "main",
    ]);
    const { stdout: remoteHash } = await execa("git", [
      "-C",
      sourcePath,
      "rev-parse",
      "origin/main",
    ]);

    if (localHash.trim() !== remoteHash.trim()) {
      s.stop("Validation Failed: Branch is out of sync with origin/main.", 1);

      // Optional: Show ahead/behind info
      try {
        const { stdout: counts } = await execa("git", [
          "-C",
          sourcePath,
          "rev-list",
          "--left-right",
          "--count",
          "main...origin/main",
        ]);
        const [ahead, behind] = counts.trim().split(/\s+/).map(Number);
        if (ahead > 0)
          console.log(chalk.yellow(`   - Ahead by ${ahead} commit(s)`));
        if (behind > 0)
          console.log(chalk.yellow(`   - Behind by ${behind} commit(s)`));
      } catch (ignored) {}

      cancel("Please pull/push changes before deploying.");
      process.exit(0);
    }

    s.stop("Git validation passed (main branch, in sync).");
  } catch (error) {
    s.stop("Unexpected error during validation.", 1);
    console.error(error);
    process.exit(0);
  }

  // 4. Deployment
  s.start("Starting GCS Upload...");

  try {
    const deployScriptPath = path.join(__dirname, "deploy_core.sh");
    const subprocess = execa(deployScriptPath, [selectedFolder], {
      all: true,
    });

    const ignorePatterns = [
      "WARNING: gsutil rsync uses hashes",
      "module's C extension",
      "checksumming will run very slowly",
      "gsutil help crcmod",
      "Building synchronization state...",
      "problems with multiprocessing",
      "python.org/issue33725",
      "parallel_process_count",
      "multithreading is still available",
    ];

    subprocess.all.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;

        const shouldIgnore = ignorePatterns.some((pattern) =>
          line.includes(pattern),
        );
        if (shouldIgnore) continue;

        if (line.includes("Uploading") && line.includes("files...")) {
          s.message(line.trim());
        } else if (line.includes("Copying")) {
          const match = line.match(/Copying file:.*\/([^/]+?)(\s|\[|$)/);
          if (match && match[1]) {
            s.message(`Syncing: ${match[1]}...`);
          } else {
            s.message(`Syncing...`);
          }
        }
      }
    });

    await subprocess;
    s.stop("GCS sync complete.");

    // Show Summary
    const fileCount = countFiles(sourcePath);

    // Simple padding helper
    const pad = (str, len) => str.padEnd(len);
    const labelWidth = 15;

    const productionUrl = `${COMPOSER_URL_BASE}/dags/${selectedFolder}`;
    const link = terminalLink(
      chalk.cyan.underline("Open in Cloud Console"),
      productionUrl,
    );

    console.log("");
    console.log(chalk.green("Deployment Information"));
    console.log("");

    console.log(
      `${chalk.dim(pad("Source", labelWidth))} ${chalk.reset(`dags/${selectedFolder}`)}`,
    );
    console.log(
      `${chalk.dim(pad("Destination", labelWidth))} ${chalk.reset(`${BUCKET_URL}/${selectedFolder}`)}`,
    );
    console.log(
      `${chalk.dim(pad("Files Synced", labelWidth))} ${chalk.reset(`${fileCount} files`)}`,
    );

    console.log("");
    console.log(
      chalk.white(
        `${chalk.bold(selectedFolder)} is now in sync with git + Cloud Composer.`,
      ),
    );
    console.log("");

    // Print URL in original location but single line
    console.log(chalk.dim(pad("Composer URL", labelWidth)) + link);
    console.log("");

    outro(chalk.green.bold("Deployment Successful!"));
  } catch (error) {
    s.stop("Deployment Failed ❌", 1);
    console.log(chalk.red("\n--- Error Logs ---"));
    if (error.all) {
      console.log(error.all);
    }
    cancel("Correct the errors above and try again.");
    process.exit(0);
  }
}

main().catch(console.error);
