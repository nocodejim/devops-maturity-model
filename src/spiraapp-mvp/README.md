# DevOps Maturity Model - SpiraApp v1.0

A configurable DevOps maturity assessment widget for SpiraPlan. Evaluate your team's practices across multiple domains, visualize results with SVG charts, track improvement over time, and publish assessment reports as Spira Documents.

## Features

- **Domain-by-domain assessment form** with tab navigation, progress bar, and per-question guidance
- **Configurable frameworks** -- built-in 20-question assessment or upload custom JSON frameworks (CALMS, etc.)
- **SVG visualizations** -- score gauge, radar/spider chart, domain bar charts, trend sparklines
- **Assessment history** with trend tracking across multiple assessments
- **Publish to Spira** -- save assessment results as Documents with custom properties via the REST API
- **Settings page** for product admins to upload/manage custom frameworks
- **Standalone demo** for local testing without a Spira instance

## File Structure

| File | Purpose |
|------|---------|
| `manifest.yaml` | SpiraApp metadata, dashboard widget definition, settings page registration |
| `widget.js` | Main widget: questions, templates, SVG generators, scoring, storage, publish |
| `widget.css` | Design system: gauge, radar, tabs, progress bar, domain bars, responsive |
| `settings.js` | Product admin page: custom framework upload, validation, management |
| `settings.css` | Settings page styles |
| `calms-framework.json` | CALMS framework (5 domains, 28 questions) |
| `example-framework.json` | Minimal test framework (2 domains, 4 questions) |
| `demo.html` | Standalone demo with mock spiraAppManager (localStorage-backed) |

## How to Build & Deploy

### Build

```bash
./build_spiraapp.sh
```

This clones the SpiraApp Package Generator (if needed), processes `file://` references, and outputs the package to `dist/`.

### Install

1. Log into SpiraPlan as **System Admin**
2. Go to **System Admin > SpiraApps**
3. Upload the `.spiraapp` file from `dist/`
4. Click the power button to enable the app system-wide

### Activate per Product

1. Go to **Product Admin > General Settings > SpiraApps**
2. Enable "DevOps Maturity Model Assessment"
3. Go to **Product Home** dashboard
4. Click "Add/Remove Items" and add the "DevOps Maturity Model Assessment" widget

### Custom Properties (for Publish feature)

To use the "Publish to Spira" feature, create these custom properties on the **Document** artifact type in your product template:

| Custom Property | Type | Purpose |
|----------------|------|---------|
| `Custom_01` | Integer | Overall maturity score (0-100) |
| `Custom_02` | Text | Maturity level name (Initial/Developing/Defined/Managed/Optimizing) |

## Architecture

### Runtime Environment

The SpiraApp runtime provides these globals to dashboard widgets:

- `WIDGET_ELEMENT` -- HTMLElement container for the widget
- `APP_GUID` -- SpiraApp identifier string
- `spiraAppManager` -- API for storage, notifications, events, REST calls
- `Mustache` -- Template engine (dashboard pages only)

### CSS Injection

CSS is kept in a separate `widget.css` file for development. During packaging, `file://widget.css` in `widget.js` is replaced with the file contents (base64-encoded). At runtime, `injectStyles()` decodes it with `atob()` and injects a `<style>` element.

### Framework Normalization

The widget supports both the built-in question set and custom JSON frameworks through a single code path:

1. On init, check storage for a custom framework (`custom_framework` key)
2. If none found, `convertBuiltInToFramework()` wraps the 20 built-in questions into the same JSON format
3. All downstream code (form rendering, scoring, results) operates on the framework object

Custom frameworks without explicit `options` arrays on questions get a standard 0-5 scale generated automatically via `getQuestionOptions()`.

### Storage

- **App storage** (`storageGetProduct` / `storageUpdateProduct` / `storageInsertProduct`): Persists assessment history and custom frameworks as JSON blobs in Spira's key-value store, scoped per product
- **Document API** (`executeApi` POST): Publishes assessment reports as HTML Documents with custom property metadata

### Scoring

1. Each question scores 0-5
2. Domain score = (total points / max possible) * 100
3. Overall score = weighted sum of domain scores (weights defined in framework)
4. Maturity level mapped from overall score: Initial (<20), Developing (20-39), Defined (40-59), Managed (60-79), Optimizing (80+)

### Views

| View | Description |
|------|-------------|
| **Summary** | Score gauge with latest result, Start/History buttons |
| **Assessment Form** | Domain tabs, progress bar, question cards with radio options |
| **Results** | Score gauge, domain bar charts, radar chart, Publish button |
| **History** | Trend sparkline, chronological assessment list |

## Local Development & Testing

### Demo Mode

```bash
cd src/spiraapp-mvp
python3 -m http.server 8000
# Open http://localhost:8000/demo.html
```

The demo provides:
- Mock `spiraAppManager` backed by localStorage
- Framework selector (built-in / CALMS / example)
- Reset button to clear all data
- Toast notifications for success/error feedback
- Simulated `executeApi` for publish testing

### Build Gotchas

- **Manifest version**: Must be decimal (`1.0`), not semver (`1.0.0`)
- **`file://` references**: The package generator regex-matches ALL `file://` occurrences. Never use the literal string `file://` in code except for the actual file reference assignment.
- **CSS base64 encoding**: The generator base64-encodes CSS embedded in JS. Use `atob()` at runtime to decode.
- **Storage API signatures**: Get = 6 params, Update = 7 params, Insert = 8 params. Always include `pluginName` as the second argument.

## Custom Framework Format

```json
{
  "meta": {
    "name": "My Framework",
    "description": "What this framework assesses",
    "version": "1.0"
  },
  "domains": [
    {
      "id": "domain-id",
      "name": "Domain Name",
      "description": "What this domain measures",
      "weight": 0.5,
      "order": 1,
      "questions": [
        {
          "id": "Q1",
          "text": "Question text?",
          "guidance": "Score 0 = ... | Score 5 = ...",
          "order": 1,
          "options": [
            { "score": 0, "text": "Option A" },
            { "score": 5, "text": "Option B" }
          ]
        }
      ]
    }
  ]
}
```

- Domain weights must sum to 1.0
- `options` array is optional; if omitted, a standard 0-5 scale is generated
- `guidance` is optional; if present, displayed as a collapsible hint below the question
- Upload via Product Admin > SpiraApps > DevOps Maturity Model settings page
