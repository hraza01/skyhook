import fs from "fs"
import path from "path"
import { select, isCancel } from "@clack/prompts"
import { logger } from "./logger.js"
import { UserCancellationError } from "./errors.js"

export function scanDags(dagsDir, s) {
    logger.info("SCAN", `Scanning directory: ${dagsDir}`)
    s.start(`Looking for DAGs in: ${path.relative(process.cwd(), dagsDir)}`)

    if (!fs.existsSync(dagsDir)) {
        s.stop(`Directory '${dagsDir}' not found.`, 1)
        throw new UserCancellationError("Operation cancelled.")
    }

    const folders = fs.readdirSync(dagsDir).filter((file) => {
        return (
            fs.statSync(path.join(dagsDir, file)).isDirectory() &&
            !file.startsWith(".")
        )
    })

    if (folders.length === 0) {
        s.stop(`No folders found in ${dagsDir}`, 1)
        throw new UserCancellationError("Operation cancelled.")
    }

    s.stop(`Found ${folders.length} Airflow DAGs.`)
    logger.info("SCAN", `Found ${folders.length} valid DAG folders.`)
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
