import chalk from "chalk"
import { intro, spinner } from "@clack/prompts"

/**
 * Display version information
 */
export function showVersionInfo() {
    console.log("skyhook v1.0.0")
    process.exit(0)
}

/**
 * Display help information
 */
export function showHelpInfo() {
    console.log(
        chalk.cyan.bold("\nSkyhook - Cloud Composer DAG Deployment Utility\n"),
    )
    console.log("Usage:")
    console.log("  skyhook [options] [path]\n")
    console.log("Options:")
    console.log("  -h, --help     Show this help message")
    console.log("  --version      Show version number")
    console.log("  -v, --verbose  Enable verbose logging\n")
    console.log("Environment Variables (Required):")
    console.log("  GCS_BUCKET_NAME    Your Composer GCS bucket name")
    console.log("  COMPOSER_URL_BASE  Your Composer webserver base URL\n")
    console.log("For more information, visit:")
    console.log("  https://github.com/hraza01/skyhook\n")
    process.exit(0)
}

/**
 * Display the intro banner
 */
export function showIntro() {
    intro(
        chalk.bgCyan(
            chalk.black("  Skyhook / Cloud Composer Deployment Utility  "),
        ),
    )
}

/**
 * Create and return a configured spinner with cyan color
 */
export function createSpinner() {
    return spinner({
        frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map(
            (frame) => chalk.cyan(frame),
        ),
    })
}
