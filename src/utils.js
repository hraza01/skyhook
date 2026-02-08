import fs from "fs"
import path from "path"

export function countFiles(dir) {
    let results = 0
    const list = fs.readdirSync(dir)
    list.forEach((file) => {
        file = path.resolve(dir, file)
        const stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
            if (
                !file.includes(".git") &&
                !file.includes("__pycache__") &&
                !file.includes("tests") &&
                !file.includes(".github")
            ) {
                results += countFiles(file)
            }
        } else {
            const filename = path.basename(file)
            const ignoredFiles = [
                "pyproject.toml",
                "README.md",
                "Makefile",
                ".gitignore",
                ".pre-commit-config.yaml",
            ]
            if (!ignoredFiles.includes(filename)) {
                results += 1
            }
        }
    })
    return results
}
