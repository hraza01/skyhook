import chalk from "chalk"
import { intro } from "@clack/prompts"
import ora from "ora"
import terminalLink from "terminal-link"
import figlet from "figlet"

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
    const gitLink = terminalLink(
        chalk.cyan.underline("@hraza01/skyhook"),
        "https://github.com/hraza01/skyhook",
    )

    console.clear()
    console.log(
        chalk.cyan.bold("\nSkyhook - Cloud Composer DAG Deployment Utility\n"),
    )
    console.log("Usage:")
    console.log("  skyhook [options] [path]\n")
    console.log("Options:")
    console.log("  -h, --help     Show this help message")
    console.log("  -v, --version  Show version number")
    console.log("  --verbose      Enable verbose logging\n")
    console.log("Environment Variables (Required):")
    console.log(
        `  ${chalk.red("GCS_BUCKET_NAME")}    Your Composer GCS bucket name`,
    )
    console.log(
        `  ${chalk.red("COMPOSER_URL_BASE")}  Your Composer webserver base URL\n`,
    )
    console.log(`For more information, visit: ${gitLink}`)
    process.exit(0)
}

/**
 * Display the intro banner
 */
export function showIntro() {
    console.clear()
    console.log(
        chalk.cyan(
            figlet.textSync("Skyhook", {
                font: "Slant",
                horizontalLayout: "default",
                verticalLayout: "default",
            }),
        ),
    )
    console.log("")
    intro(chalk.bgCyan.black(" Cloud Composer DAG Deployment Utility "))
}

/**
 * Create and return a configured spinner using ora
 * Wraps ora to match the interface used by the rest of the app:
 * - start(msg)
 * - stop(msg, code)
 * - message(msg)
 */
export function createSpinner() {
    const spinner = ora({
        color: "cyan",
        spinner: "dots",
    })

    return {
        start(msg) {
            spinner.start(` ${msg}`)
        },
        stop(msg, code = 0) {
            if (code === 0) {
                spinner.succeed(` ${msg}`)
            } else {
                spinner.fail(` ${msg}`)
            }
        },
        message(msg) {
            spinner.text = ` ${msg}`
        },
        clear() {
            spinner.stop()
        },
    }
}
