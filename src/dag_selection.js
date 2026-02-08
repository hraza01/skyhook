import fs from "fs"
import path from "path"
import { select, isCancel, log } from "@clack/prompts"
import { logger } from "./logger.js"
import { UserCancellationError } from "./errors.js"
import chalk from "chalk"

export function scanDags(dagsDir, s) {
    s.start("Scanning for DAGs...")

    if (!fs.existsSync(dagsDir)) {
        s.stop("No DAGs directory found.", 1)
        throw new Error(`DAGs directory not found: ${dagsDir}`)
    }

    const items = fs.readdirSync(dagsDir)
    const folders = items.filter((item) => {
        const fullPath = path.join(dagsDir, item)
        return (
            fs.statSync(fullPath).isDirectory() &&
            !item.startsWith(".") &&
            !item.startsWith("__")
        )
    })

    if (folders.length === 0) {
        s.stop("No DAG folders found.", 1)
        throw new Error("No DAG folders found in dags/ directory.")
    }

    s.clear() // Stop spinner and clear line
    log.success(`Found ${folders.length} Airflow DAGs.`)

    return folders
}

export async function selectDag(folders) {
    const selectedFolder = await select({
        message: "Select an Airflow DAG to deploy:",
        options: folders.map((f) => ({ label: f, value: f })),
    })

    if (isCancel(selectedFolder)) {
        logger.warn("SELECT", "User cancelled selection.")
        throw new UserCancellationError("Deployment cancelled.")
    }

    logger.info("SELECT", `User selected: ${selectedFolder}`)
    return selectedFolder
}
