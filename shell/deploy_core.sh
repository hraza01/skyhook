#!/bin/bash
set -e

# Configuration
if [ -z "$GCS_BUCKET_NAME" ]; then
    echo "Error: GCS_BUCKET_NAME environment variable is not set."
    exit 1
fi

# Input arguments
SOURCE_PATH="$1"
DEST_PATH="$2"

if [ -z "$SOURCE_PATH" ] || [ -z "$DEST_PATH" ]; then
    echo "Error: Missing arguments. Usage: $0 <SOURCE_PATH> <DEST_PATH>"
    exit 1
fi

# Validation is handled by the calling Node.js script. We assume valid inputs here.
echo "Syncing $SOURCE_PATH to $DEST_PATH..."

# Calculate file count (informational)
FILE_COUNT=$(find "$SOURCE_PATH" -type f \
    -not -path '*/.git/*' \
    -not -path '*/__pycache__/*' \
    -not -path '*/tests/*' \
    -not -path '*/.github/*' \
    -not -name 'pyproject.toml' \
    -not -name 'README.md' \
    -not -name 'Makefile' \
    -not -name '.gitignore' \
    -not -name '.pre-commit-config.yaml' \
    | wc -l | tr -d ' ')
echo "Uploading $FILE_COUNT files..."

# Perform Sync
# Excludes: .git, __pycache__, tests, .github, and specific project files
EXCLUDE_REGEX="\.git/.*|__pycache__/.*|tests/.*|\.github/.*|pyproject\.toml$|README\.md$|Makefile$|\.gitignore$|\.pre-commit-config\.yaml$"
gsutil -m rsync -r -x "$EXCLUDE_REGEX" "$SOURCE_PATH" "$DEST_PATH"
