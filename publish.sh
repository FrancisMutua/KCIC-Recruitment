#!/bin/zsh
# Publishes Recruitment.Server (including the recruitment.client SPA build) to the Live folder.
# Exists because Rider's built-in "Publish to Folder" wizard does not reliably build the
# recruitment.client.esproj (Microsoft.VisualStudio.JavaScript.Sdk) project reference on macOS,
# which results in an empty output folder. Running dotnet publish directly does not have this problem.

set -e

SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"
OUTPUT_DIR="${1:-/Users/simongideon/Documents/confAlt/Live}"

dotnet publish "$SCRIPT_DIR/Recruitment.Server/Recruitment.Server.csproj" -c Release -o "$OUTPUT_DIR"
