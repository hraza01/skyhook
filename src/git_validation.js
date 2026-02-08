import { execa } from "execa"
import chalk from "chalk"
import { ValidationError } from "./errors.js"
import { log } from "@clack/prompts"

export async function validateGit(sourcePath, s) {
    console.log(chalk.gray("│"))
    s.start("Validating Git status...")

    // A. Check if it is a connected git repo
    try {
        await execa("git", ["-C", sourcePath, "status"])
    } catch (e) {
        s.stop("Validation Failed", 1)
        throw new ValidationError("Directory is not a Git repository.")
    }

    // B. Check Branch Name
    let branch
    try {
        const { stdout } = await execa("git", [
            "-C",
            sourcePath,
            "rev-parse",
            "--abbrev-ref",
            "HEAD",
        ])
        branch = stdout.trim()
    } catch (e) {
        // Handle "ambiguous argument 'HEAD'" which happens in a fresh repo with no commits
        if (e.message.includes("ambiguous argument 'HEAD'")) {
            s.stop(
                "Validation Failed: No commits found. Please commit your changes.",
                1,
            )
            throw new ValidationError("Git repository has no commits.")
        }
        throw e
    }

    if (branch !== "main") {
        s.stop("Validation Failed", 1)
        throw new ValidationError(
            `You are on branch "${branch}". Please switch to "main".`,
        )
    }

    // C. Check for Uncommitted Changes
    const { stdout: statusOutput } = await execa("git", [
        "-C",
        sourcePath,
        "status",
        "--porcelain",
    ])
    if (statusOutput.trim() !== "") {
        s.stop("Validation Failed", 1)
        throw new ValidationError(
            "You have uncommitted changes. Please commit or stash them.",
        )
    }

    // D. Check Sync Status (Pull/Push)
    await execa("git", ["-C", sourcePath, "fetch", "origin", "main"])

    const { stdout: localHash } = await execa("git", [
        "-C",
        sourcePath,
        "rev-parse",
        "main",
    ])
    const { stdout: remoteHash } = await execa("git", [
        "-C",
        sourcePath,
        "rev-parse",
        "origin/main",
    ])

    if (localHash.trim() !== remoteHash.trim()) {
        s.stop()
        log.error("Validation Failed: Branch is out of sync with origin/main.")

        // Optional: Show ahead/behind info
        try {
            const { stdout: counts } = await execa("git", [
                "-C",
                sourcePath,
                "rev-list",
                "--left-right",
                "--count",
                "main...origin/main",
            ])
            const [ahead, behind] = counts.trim().split(/\s+/).map(Number)
            if (ahead > 0)
                console.log(chalk.yellow(`   - Ahead by ${ahead} commit(s)`))
            if (behind > 0)
                console.log(chalk.yellow(`   - Behind by ${behind} commit(s)`))
        } catch (ignored) {}

        throw new ValidationError("Please pull/push changes before deploying.")
    }

    s.clear()
    log.success("Git validation passed (main branch, in sync).")
}
