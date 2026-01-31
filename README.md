# Skyhook 🪂

**Skyhook** is a robust, interactive CLI tool for deploying Airflow DAGs to Google Cloud Composer. It replaces legacy bash scripts with a modern Node.js interface featuring Git validation, synchronized spinners, and a professional UI.

## About

> **Use Case**: Skyhook is optimized for development environments and teams where a full CI/CD pipeline is not yet established. While automated CI/CD remains the industry standard for production deployments, this utility provides a safe, structured, and efficient alternative for manual deployments, helping smaller teams iterate faster without sacrificing validation or safety.

## Features

- **🛡️ Safety First**: Automatically validates that your DAG folder is a Git repository, is on the `main` branch, and is fully synced with remote.
- **✨ Modern UI**: Built with `@clack/prompts` for a minimal, clean aesthetic.
- **🚀 Live Feedback**: Shows real-time file upload progress from `gsutil`.
- **🔌 Cross-Platform**: Works seamlessly on macOS, Linux, and Windows (WSL).

## Prerequisites

- **Node.js**: v20.5.0 or higher
- **Google Cloud SDK**: `gsutil` must be installed and **authenticated**.
- **Git**: Must be installed and available in the PATH.
- **Environment**: You must be inside your Composer's local Airflow development environment (project root) to run this tool.

## Installation

Install globally via NPM:

```console
$ npm install -g @hraza01/skyhook
```

## Updating

To update to the latest version:

```console
$ npm update -g @hraza01/skyhook
```

## Configuration

Skyhook requires two environment variables to function. It will **exit** if these are not provided.

| Variable            | Description                                    |
| :------------------ | :--------------------------------------------- |
| `GCS_BUCKET_NAME`   | The name of your Composer GCS bucket.          |
| `COMPOSER_URL_BASE` | The base URL for your environment's webserver. |

## Usage

### Option 1: VS Code Task (Recommended)

1.  Copy the example task configuration from `vscode-example/tasks.json` to your project's `.vscode/tasks.json`.
2.  Update the `env` variables in `tasks.json`.
3.  Run the task **"Deploy DAG to Cloud Composer"**.

### Option 2: CLI (Manual)

Navigate to your Airflow project root (where the `dags/` folder is) and run:

```console
$ export GCS_BUCKET_NAME="<your-bucket-name>"
$ export COMPOSER_URL_BASE="<your-composer-webserver-url-base>"

$ skyhook
```

## Project Structure

For a detailed overview of the project structure and module descriptions, see:

📄 **[Project Structure Documentation](https://github.com/hraza01/skyhook/blob/main/docs/project-structure.md)**

## Thank You

Thank you for your attention and for taking the time to read the documentation! We hope this tool helps streamline your workflow.
