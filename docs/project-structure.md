# Project Structure

This document provides a detailed overview of the Skyhook project structure and organization.

## Directory Layout

```
skyhook/
├── src/               # Source code modules
│   ├── cli.js        # CLI presentation logic (version, help, intro, spinner)
│   ├── config.js     # Configuration and environment validation
│   ├── dag_selection.js  # Logic for scanning and selecting DAGs
│   ├── deploy.js     # Orchestrates deployment and logs
│   ├── errors.js     # Custom error classes
│   ├── git_validation.js  # Git validation logic
│   ├── index.js      # Main entry point
│   ├── logger.js     # Structured logging module
│   ├── quotes.js     # Random quote fetching
│   └── utils.js      # Helper functions (e.g., file counting)
├── docs/             # Project documentation
│   └── project-structure.md  # Detailed project structure guide
├── shell/            # Shell scripts
│   └── deploy_core.sh  # Minimal shell wrapper for gsutil rsync
├── vscode-example/   # VS Code configuration templates
│   └── tasks.json    # Example VS Code task configuration
├── .npmignore        # Files to exclude from npm package
├── package.json      # Package metadata and dependencies
└── README.md         # Main documentation
```

## Module Descriptions

### Core Modules

#### `index.js`

Main entry point for the CLI application. Orchestrates the entire deployment workflow:

- Handles CLI flags (version, help, verbose)
- Initializes logging
- Coordinates DAG scanning, selection, validation, and deployment

#### `cli.js`

CLI presentation layer containing:

- `showVersionInfo()` - Displays version number
- `showHelpInfo()` - Shows help and usage information
- `showIntro()` - Displays intro banner
- `createSpinner()` - Creates configured spinner instance

#### `config.js`

Configuration management:

- Parses command-line arguments
- Validates required environment variables
- Exports configuration constants (paths, bucket URLs, etc.)

### Feature Modules

#### `dag_selection.js`

DAG discovery and selection:

- Scans the `dags/` directory for DAG folders
- Provides interactive prompt for DAG selection
- Validates DAG folder structure

#### `git_validation.js`

Git repository validation:

- Ensures DAG folder is a Git repository
- Verifies current branch is `main`
- Checks for uncommitted changes
- Validates sync status with remote

#### `deploy.js`

Deployment orchestration:

- Builds deployment confirmation table
- Executes `gsutil rsync` via shell script
- Parses and displays upload progress
- Generates Airflow webserver URL

### Utility Modules

#### `logger.js`

Structured logging:

- Configurable logger with different log levels
- Color-coded output
- Supports verbose mode for debugging

#### `errors.js`

Custom error classes:

- `ConfigError` - Configuration/environment issues
- `ValidationError` - Validation failures (Git, DAG structure)
- `UserCancellationError` - User-initiated cancellation

#### `utils.js`

Helper functions:

- `countFiles()` - Recursively counts files in a directory (excludes `.git`, `__pycache__`)

#### `quotes.js`

Post-deployment polish:

- Fetches random inspirational quotes from API
- Displays quote after successful deployment

### Shell Scripts

#### `deploy_core.sh`

Minimal Bash wrapper for `gsutil rsync`:

- Accepts source path and GCS bucket as arguments
- Executes synchronization with delete flag
- Returns exit code for error handling

## Configuration Files

### `.npmignore`

Specifies files to exclude from the published npm package:

- `node_modules/`
- `.git/`
- Development files (`.prettierrc`, etc.)
- Example configurations

### `package.json`

Package metadata:

- Name: `@hraza01/skyhook`
- Dependencies: `@clack/prompts`, `chalk`, `execa`, `terminal-link`
- Bin configuration for global CLI usage
- Node engine requirement: `>=20.5.0`

## Design Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **User Experience**: Clean CLI interface with spinners, colors, and progress indicators
3. **Safety First**: Multiple validation layers before deployment
4. **Developer Friendly**: Comprehensive logging and error messages
