#!/bin/bash
# Build script for DevOps Maturity Model SpiraApp

# Ensure directories exist
mkdir -p dist

# Set paths
INPUT_DIR="$(pwd)/src/spiraapp-mvp"
OUTPUT_DIR="$(pwd)/dist"
GENERATOR_DIR="$(pwd)/tools/spiraapp-package-generator"

# Check if generator exists
if [ ! -d "$GENERATOR_DIR" ]; then
    echo "SpiraApp Generator not found. Cloning..."
    mkdir -p tools
    git clone https://github.com/Inflectra/spiraapp-package-generator.git "$GENERATOR_DIR"
    cd "$GENERATOR_DIR"
    npm install
    cd -
fi

echo "Building SpiraApp..."
echo "Input: $INPUT_DIR"
echo "Output: $OUTPUT_DIR"

# Run generator using env vars as confirmed working method
export npm_config_input="$INPUT_DIR"
export npm_config_output="$OUTPUT_DIR"

cd "$GENERATOR_DIR"
node index.js
cd -

echo "Build complete. Check dist/ folder."
