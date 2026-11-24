#!/bin/zsh
# Publishes KCIC-Recruitment.Server (including the kcic-recruitment.client SPA build) to the Live folder.
# Exists because Rider's built-in "Publish to Folder" wizard does not reliably build the
# kcic-recruitment.client.esproj (Microsoft.VisualStudio.JavaScript.Sdk) project reference on macOS,
# which results in an empty output folder. Running dotnet publish directly does not have this problem.

set -e

SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"
OUTPUT_DIR="${1:-/Users/simongideon/Documents/confAlt/Live}"

dotnet publish "$SCRIPT_DIR/KCIC-Recruitment.Server/KCIC-Recruitment.Server.csproj" \
  -c Release -p:PublishProfile=Live -o "$OUTPUT_DIR"
