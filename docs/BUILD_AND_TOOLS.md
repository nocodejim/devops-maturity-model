# Build Process & Tools

## SpiraApp Package Generator
The SpiraApp package generator is located in:
`tools/spiraapp-package-generator/`

This tool is responsible for bundling the `manifest.yaml` and source code (e.g., `widget.js`) into a `.spiraapp` file.

## Build Script
To build the application, run the shell script in the root directory:
```bash
./build_spiraapp.sh
```

### How it Works
The script:
1.  Sets the **Input Directory** to `src/spiraapp-mvp`.
2.  Sets the **Output Directory** to `dist/`.
3.  Checks if the generator exists in `tools/`; if not, it clones it from GitHub.
4.  Runs `npm install` if needed.
5.  Executes `node index.js` within the generator directory, passing input/output paths via environment variables (`npm_config_input`, `npm_config_output`).

### Output
The built package is saved to the `dist/` folder with a filename corresponding to the App GUID (e.g., `4B8D9721-6A99-4786-903D-9346739A0673.spiraapp`).
