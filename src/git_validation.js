import { execa } from "execa"
import chalk from "chalk"
import { ValidationError } from "./errors.js"

export async function validateGit(sourcePath, s) {
    s.start("Validating Git status...")

    // A. Check if valid git repo
    try {
        await execa("git", [
            "-C",
            sourcePath,
            "rev-parse",
            "--is-inside-work-tree",
        ])
    } catch (e) {
        s.stop("Validation Failed: Not a git repository.", 1)
        throw new ValidationError("The DAG folder must be version controlled.")
    }

    // B. Check Branch Name
    const { stdout: branch } = await execa("git", [
        "-C",
        sourcePath,
        "rev-parse",
        "--abbrev-ref",
        "HEAD",
    ])
    if (branch.trim() !== "main") {
        s.stop(`Validation Failed: You are on branch '${branch.trim()}'.`, 1)
        throw new ValidationError("You must be on the 'main' branch to deploy.")
    }

    // C. Check Sync Status
    s.message("Checking remote sync status...")
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
        s.stop("Validation Failed: Branch is out of sync with origin/main.", 1)

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

    s.stop("Git validation passed (main branch, in sync).")
}
