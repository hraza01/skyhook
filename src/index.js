#!/usr/bin/env node

import chalk from "chalk"
import { cancel, log } from "@clack/prompts"
import {
    validateEnv,
    DAGS_DIR,
    verbose,
    showVersion,
    showHelp,
    skipGit,
} from "./config.js"
import {
    showVersionInfo,
    showHelpInfo,
    showIntro,
    createSpinner,
} from "./cli.js"
import { scanDags, selectDag } from "./dag_selection.js"
import { validateGit } from "./git_validation.js"
import { deployDag } from "./deploy.js"
import { fetchQuote } from "./quotes.js"
import { initLogger, logger } from "./logger.js"
import path from "path"

async function main() {
    try {
        initLogger(verbose)
        logger.info("INIT", "Skyhook started")

        // Handle --version flag
        if (showVersion) showVersionInfo()

        // Handle --help flag
        if (showHelp) showHelpInfo()

        validateEnv()
        showIntro()

        log.info("Looking for DAGs in:")
        console.log(`${chalk.gray("│")}  ${chalk.dim(DAGS_DIR)}`)
        log.warn(chalk.dim("Press Ctrl+C to exit at any time."))

        const s = createSpinner()

        const folders = scanDags(DAGS_DIR, s)

        const selectedFolder = await selectDag(folders)
        const sourcePath = path.join(DAGS_DIR, selectedFolder)

        if (skipGit) {
            logger.info("GIT", "Skipping Git validation (--no-git)")
        } else {
            await validateGit(sourcePath, s)
        }

        await deployDag(selectedFolder, sourcePath, s, verbose)

        const quote = await fetchQuote()
        if (quote) {
            console.log(chalk.italic.dim(`${quote}\n`))
        }
    } catch (error) {
        if (error.name === "UserCancellationError") {
            cancel(error.message)
            process.exit(0)
        } else if (error.name === "ValidationError") {
            cancel(chalk.red(error.message))
            process.exit(0)
        } else if (error.name === "ConfigError") {
            console.log(chalk.red("Configuration Error:"))
            console.log(chalk.yellow(error.message))
            process.exit(0)
        } else {
            throw error // Re-throw unexpected errors
        }
    }
}

main().catch((err) => {
    console.error(chalk.red("\nUnexpected Error:"))
    console.error(chalk.red(err.message || err))

    if (verbose) {
        console.error(chalk.dim(err.stack))
    }

    process.exit(1)
})
