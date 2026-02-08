import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import chalk from "chalk"
import { intro } from "@clack/prompts"
import ora from "ora"
import terminalLink from "terminal-link"
import figlet from "figlet"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
)
const { version } = packageJson
const authorName = "@hraza01"

const gitLink = terminalLink(
    chalk.dim(authorName),
    `https://github.com/${authorName.replace("@", "")}/skyhook`,
)

/**
 * Display version information
 */
export function showVersionInfo() {
    console.log(`skyhook v${version}`)
    process.exit(0)
}

/**
 * Display help information
 */
export function showHelpInfo() {
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
        chalk.bold.cyan(
            figlet.textSync("Skyhook", {
                font: "Slant",
                horizontalLayout: "default",
                verticalLayout: "default",
            }),
        ),
    )

    const title = " Cloud Composer DAG Deployment Utility "
    const titleLength = title.length + 3
    const versionLength = `v${version}`.length
    const authorLength = `by ${authorName}`.length
    const padding = " ".repeat(
        Math.max(0, titleLength - authorLength - versionLength),
    )

    console.log(chalk.dim.blackBright(`by ${gitLink}${padding}v${version}`))
    console.log("")
    intro(chalk.bgCyan.black(title))
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
