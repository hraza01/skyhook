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
FILE_COUNT=$(find "$SOURCE_PATH" -type f -not -path '*/.git/*' -not -path '*/__pycache__/*' | wc -l | tr -d ' ')
echo "Uploading $FILE_COUNT files..."

# Perform Sync
gsutil -m rsync -r -x "\.git/.*|__pycache__/.*" "$SOURCE_PATH" "$DEST_PATH"
