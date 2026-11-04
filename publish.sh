#!/bin/zsh
# Publishes Garissa-Recruitment.Server (including the garissa-recruitment.client SPA build) to the Live folder.
# Exists because Rider's built-in "Publish to Folder" wizard does not reliably build the
# garissa-recruitment.client.esproj (Microsoft.VisualStudio.JavaScript.Sdk) project reference on macOS,
# which results in an empty output folder. Running dotnet publish directly does not have this problem.

set -e

SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"
OUTPUT_DIR="${1:-/Users/simongideon/Documents/confAlt/Live}"

dotnet publish "$SCRIPT_DIR/Garissa-Recruitment.Server/Garissa-Recruitment.Server.csproj" \
  -c Release -p:PublishProfile=Live -o "$OUTPUT_DIR"
