import fs from "fs"
import path from "path"
import { ROOT_DIR } from "./config.js"

const LOG_FILE = path.join(ROOT_DIR, "skyhook.log")

let isVerbose = false

export function initLogger(verbose = false) {
    isVerbose = verbose
    if (isVerbose) {
        try {
            fs.writeFileSync(LOG_FILE, "")
        } catch (e) {
            // Warning: unable to write logs
        }
    }
}

export function log(step, level, message) {
    if (!isVerbose) return
    const timestamp = new Date().toISOString()
    const formattedMessage = `[${timestamp}][${step}][${level}] ${message}`

    try {
        fs.appendFileSync(LOG_FILE, formattedMessage + "\n")
    } catch (e) {
        // Fail silently if logging fails
    }
}

export const logger = {
    info: (step, message) => log(step, "INFO", message),
    warn: (step, message) => log(step, "WARN", message),
    error: (step, message) => log(step, "ERROR", message),
}
