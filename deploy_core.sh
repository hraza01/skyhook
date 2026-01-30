#!/bin/bash
set -e

# Configuration
if [ -z "$GCS_BUCKET_NAME" ]; then
    echo "Error: GCS_BUCKET_NAME environment variable is not set."
    exit 1
fi

BUCKET="gs://${GCS_BUCKET_NAME}/dags"
DAGS_DIR="dags"

# Input arguments
FOLDER_NAME="$1"

if [ -z "$FOLDER_NAME" ]; then
    echo "Error: No folder specified."
    exit 1
fi

SOURCE_PATH="$DAGS_DIR/$FOLDER_NAME"
DEST_PATH="$BUCKET/$FOLDER_NAME"

# Colors
green="\033[0;32m"
reset="\033[0m"

# 1. Deployment Logic
# Validation is handled by the calling Node.js script. We assume valid inputs here.

echo "Syncing $FOLDER_NAME to $DEST_PATH..."

# Calculate file count (informational)
FILE_COUNT=$(find "$SOURCE_PATH" -type f -not -path '*/.git/*' -not -path '*/__pycache__/*' | wc -l | tr -d ' ')
echo "Uploading $FILE_COUNT files..."

# Perform Sync
gsutil -m rsync -r -x "\.git/.*|__pycache__/.*" "$SOURCE_PATH" "$DEST_PATH"

echo -e "${green}Deployment complete!${reset}"
