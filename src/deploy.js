import { execa } from "execa"
import chalk from "chalk"
import path from "path"
import { cancel, outro } from "@clack/prompts"
import terminalLink from "terminal-link"
import { fileURLToPath } from "url"
import { countFiles } from "./utils.js"
import { logger } from "./logger.js"
import { BUCKET_URL, COMPOSER_URL_BASE } from "./config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function deployDag(selectedFolder, sourcePath, s, verbose) {
    s.start("Starting GCS Upload...")
    logger.info(
        "DEPLOY",
        `Starting deployment for ${selectedFolder} to ${BUCKET_URL}`,
    )

    try {
        const deployScriptPath = path.resolve(
            __dirname,
            "../shell/deploy_core.sh",
        )
        const destination = `${BUCKET_URL}/${selectedFolder}`
        const subprocess = execa(
            "bash",
            [deployScriptPath, sourcePath, destination],
            {
                all: true,
            },
        )

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
        ]

        subprocess.all.on("data", (chunk) => {
            const lines = chunk.toString().split("\n")
            for (const line of lines) {
                if (!line.trim()) continue

                const shouldIgnore = ignorePatterns.some((pattern) =>
                    line.includes(pattern),
                )
                if (shouldIgnore) continue

                if (line.includes("Uploading") && line.includes("files...")) {
                    s.message(line.trim())
                } else if (line.includes("Copying")) {
                    // Output looks like: "Copying file://.../dags/my_folder/sub/file.py [Content-Type=...]"
                    // We want to extract: "my_folder/sub/file.py"

                    // 1. Remove metadata suffix (e.g. [Content-Type...])
                    let cleanLine = line.split("[")[0].trim()

                    // 2. Find the index where 'selectedFolder' starts
                    const folderIndex = cleanLine.indexOf(selectedFolder)

                    if (folderIndex !== -1) {
                        // Extract substring starting from selectedFolder
                        const relativePath = cleanLine.substring(folderIndex)
                        s.message(`Syncing: ${relativePath}...`)
                        logger.info("SYNC", `Syncing: ${relativePath}`)
                    } else {
                        // Fallback if folder name not found (unlikely but safe)
                        const match = cleanLine.match(/([^/]+)$/) // Get filename
                        if (match && match[1]) {
                            s.message(`Syncing: ${match[1]}...`)
                            logger.info("SYNC", `Syncing: ${match[1]}`)
                        } else {
                            s.message(`Syncing...`)
                        }
                    }
                }
            }
        })

        await subprocess
        s.stop("GCS sync complete.")

        // Show Summary
        const fileCount = countFiles(sourcePath)

        // Simple padding helper
        const pad = (str, len) => str.padEnd(len)
        const labelWidth = 15

        const productionUrl = `${COMPOSER_URL_BASE}/dags/${selectedFolder}`
        const link = terminalLink(
            chalk.cyan.underline("Open in Cloud Console"),
            productionUrl,
        )

        console.log("")
        console.log(chalk.green("Deployment Summary"))
        console.log("")

        console.log(
            `${chalk.dim(pad("Source", labelWidth))} ${chalk.reset(
                `dags/${selectedFolder}`,
            )}`,
        )
        console.log(
            `${chalk.dim(pad("Destination", labelWidth))} ${chalk.reset(
                `${BUCKET_URL}/${selectedFolder}`,
            )}`,
        )
        console.log(
            `${chalk.dim(pad("Files Synced", labelWidth))} ${chalk.reset(
                `${fileCount} files`,
            )}`,
        )

        console.log("")
        console.log(
            chalk.white(
                `${chalk.bold(
                    selectedFolder,
                )} is now in sync with git + Cloud Composer.`,
            ),
        )
        console.log("")

        // Print URL in original location but single line
        console.log(chalk.dim(pad("Composer URL", labelWidth)) + link)
        console.log("")

        outro(chalk.green.bold("Deployment Successful!"))
        logger.info("DEPLOY", "Deployment steps completed successfully.")
    } catch (error) {
        logger.error("DEPLOY", `Deployment failed: ${error.message}`)
        s.stop("Deployment Failed ❌", 1)
        console.log(chalk.red("\nError Logs:"))
        if (error.all) {
            console.log(error.all)
        } else {
            console.log(error.message)
            console.log(error)
        }
        cancel("Correct the errors above and try again.")
        process.exit(1)
    }
}
