# DevOps Maturity Model - SpiraApp MVP

This folder contains the source code for the Client-Side SpiraApp implementation of the DevOps Maturity Model.

## Contents
- **manifest.yaml**: Defines the SpiraApp configuration, including the dashboard widget.
- **widget.js**: Contains the entire application logic (Questions, Templates, Scoring, Storage).
- **widget.css**: Styles for the widget (Note: these are also embedded in `widget.js` for easier injection).

## How to Build & Deploy

1. **Build**:
   Run the provided build script in the root of the repository:
   ```bash
   ./build_spiraapp.sh
   ```
   This will auto-configure the generator and create the package in the `dist/` folder.

2. **Install**:
   - Log into SpiraPlan as System Admin.
   - Go to **System Admin > SpiraApps**.
   - Upload the generated `.spiraapp` file.
   - Enable the "DevOps Maturity Model Assessment" app.

4. **Activate**:
   - Go to a **Product**.
   - Go to **Product Admin > General Settings > SpiraApps**.
   - Enable "DevOps Maturity Model Assessment" for that product.
   - Go to the **Product Home** dashboard.
   - Click "Add/Remove Items" and add the "DevOps Maturity" widget.

## Architecture
- **Pure Client-Side**: No external backend (Python/FastAPI) is required.
- **Storage**: using `spiraAppManager.storage*Product` API to save assessment history JSON blobs directly to the Spira database.
- **UI**: Rendered using `Mustache` templates (built-in to SpiraApp environment).
