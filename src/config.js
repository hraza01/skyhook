import { parseArgs } from "util"
import path from "path"
import { ConfigError } from "./errors.js"

const { values, positionals } = parseArgs({
    options: {
        verbose: {
            type: "boolean",
        },
        version: {
            type: "boolean",
            short: "v",
        },
        help: {
            type: "boolean",
            short: "h",
        },
        "no-git": {
            type: "boolean",
        },
    },
    allowPositionals: true,
})

export const verbose = values.verbose
export const showVersion = values.version
export const showHelp = values.help
export const skipGit = values["no-git"]

// Helper to get root dir based on arg or CWD
export const ROOT_DIR = positionals[0]
    ? path.resolve(positionals[0])
    : process.cwd()
export const DAGS_DIR = path.join(ROOT_DIR, "dags")

export function validateEnv() {
    // Skip validation if we are just showing help or version
    if (showVersion || showHelp) return

    if (!process.env.GCS_BUCKET_NAME || !process.env.COMPOSER_URL_BASE) {
        throw new ConfigError(
            "Missing GCS_BUCKET_NAME or COMPOSER_URL_BASE environment variables.",
        )
    }
}

export const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME
export const COMPOSER_URL_BASE = process.env.COMPOSER_URL_BASE
export const BUCKET_URL = `gs://${GCS_BUCKET_NAME}/dags`
