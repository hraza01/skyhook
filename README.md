# Sky Hook 🪂

**Sky Hook** is a robust, interactive CLI tool for deploying Airflow DAGs to Google Cloud Composer. It replaces legacy bash scripts with a modern Node.js interface featuring Git validation, synchronized spinners, and a professional UI.

## Features

- **🛡️ Safety First**: Automatically validates that your DAG folder is a Git repository, is on the `main` branch, and is fully synced with remote.
- **✨ Modern UI**: Built with `@clack/prompts` for a minimal, clean aesthetic.
- **🚀 Live Feedback**: Shows real-time file upload progress from `gsutil`.
- **🔌 Cross-Platform**: Works seamlessly on macOS, Linux, and Windows (WSL).

## Prerequisites

- **Node.js**: v20.5.0 or higher
- **Google Cloud SDK**: `gsutil` must be installed and authenticated.
- **Git**: Must be installed and available in the PATH.

## Installation

1.  Clone this repository (or navigate to it):
    ```bash
    cd scripts/sky-hook
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Sky Hook requires two environment variables to function. It will **exit** if these are not provided.

| Variable            | Description                                    |
| :------------------ | :--------------------------------------------- |
| `GCS_BUCKET_NAME`   | The name of your Composer GCS bucket.          |
| `COMPOSER_URL_BASE` | The base URL for your environment's webserver. |

## Usage

### Option 1: VS Code Task (Recommended)

1.  Copy the example task configuration from `vscode-example/tasks.json` to your project's `.vscode/tasks.json`.
2.  Update the `env` variables in `tasks.json` with your actual bucket and URL.
3.  Run the task:
    - Press `Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux
    - Select **Tasks: Run Task**
    - Choose **Deploy DAG to Cloud Composer**

### Option 2: Manual Execution

You can run the script manually, but you must export the variables first:

```bash
export GCS_BUCKET_NAME="<your-bucket-name>"
export COMPOSER_URL_BASE="<your-composer-webserver-url-base>"

# Run from the project root (recommended)
node scripts/sky-hook/deploy.js
```

## Project Structure

- `deploy.js`: The main Node.js entry point (handles UI and validation).
- `deploy_core.sh`: Minimal shell wrapper for `gsutil rsync`.
- `vscode-example/`: Contains template configuration files.
