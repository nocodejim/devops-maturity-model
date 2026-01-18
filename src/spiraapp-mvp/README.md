# DevOps Maturity Model - SpiraApp Widget

A lightweight client-side widget for assessing DevOps maturity directly within SpiraPlan, SpiraTeam, or SpiraTest.

## Overview

This SpiraApp provides a Product Dashboard widget that allows teams to:
- Complete DevOps maturity assessments (20 questions, ~15-20 minutes)
- View assessment results with maturity level and domain breakdown
- Track assessment history over time
- Use custom assessment frameworks via JSON upload

## Contents

```
src/spiraapp-mvp/
├── manifest.yaml          # SpiraApp configuration
├── widget.js              # Main widget application (questions, scoring, UI)
├── widget.css             # Widget styles (also embedded in widget.js)
├── settings.js            # Product settings page code
├── calms-framework.json   # CALMS assessment framework (28 questions)
├── example-framework.json # Template for custom frameworks
└── docs/                  # Additional documentation
```

## Quick Start

### Build

```bash
# From repository root
./build_spiraapp.sh
```

Output: `dist/DevOpsMaturityAssessment.spiraapp`

### Install

1. **System Admin** > SpiraApps > Upload the `.spiraapp` file
2. Enable the SpiraApp system-wide (toggle power button)
3. **Product Admin** > SpiraApps > Enable for specific products
4. **Product Home** > Add/Remove Items > Add "DevOps Maturity" widget

## Default Assessment

### Domains (3)

| Domain | Weight | Questions |
|--------|--------|-----------|
| Source Control & Development | 35% | Q1-Q7 |
| Security & Compliance | 30% | Q8-Q13 |
| CI/CD & Deployment | 35% | Q14-Q20 |

### Questions (20 total)

**Domain 1: Source Control & Development**
- Version control system usage
- Branch management strategy
- Code review practices
- Automated quality checks
- Test coverage and automation
- Build cycle time
- Developer feedback speed

**Domain 2: Security & Compliance**
- Security scanning automation
- Vulnerability handling
- Secrets management
- Dependency tracking
- Production access control
- Audit and compliance

**Domain 3: CI/CD & Deployment**
- Build automation
- Deployment frequency
- Deployment automation
- Infrastructure management
- Zero-downtime deployments
- Rollback capability
- Feature release control

## Custom Frameworks

Upload custom assessment frameworks as JSON files.

### JSON Structure

```json
{
  "meta": {
    "name": "Framework Name",
    "description": "Description",
    "version": "1.0",
    "estimatedDuration": "90 minutes"
  },
  "domains": [
    {
      "id": "domain_id",
      "name": "Domain Name",
      "weight": 0.25,
      "order": 1,
      "questions": [
        {
          "id": "Q1",
          "text": "Question text?",
          "guidance": "Score 0 = ... | Score 5 = ...",
          "order": 1
        }
      ]
    }
  ]
}
```

### Requirements

- Domain weights must sum to 1.0
- Question IDs must be unique across all domains
- Each question scored 0-5

### Included Frameworks

**CALMS Framework** (`calms-framework.json`)
- 28 questions, 5 domains
- Focus: Organizational DevOps readiness
- Domains: Culture (25%), Automation (25%), Lean (15%), Measurement (20%), Sharing (15%)

## Architecture

### Technology

- **Pure Client-Side**: No external backend required
- **Storage**: Spira's `spiraAppManager.storage*Product` API
- **Templating**: Mustache.js (built into SpiraApp environment)
- **Styling**: Embedded CSS with SpiraApp class scoping

### Data Flow

1. Widget loads → Checks for custom framework in storage
2. Falls back to default DMM_QUESTIONS if no custom framework
3. User completes assessment → Scores calculated
4. Results saved to Spira storage per-product
5. History displayed on subsequent loads

### Scoring

```
Domain Score = (Total Points Earned / Max Possible Points) × 100
Overall Score = Σ(Domain Score × Domain Weight)
```

### Maturity Levels

| Score | Level |
|-------|-------|
| 0-20% | Initial |
| 21-40% | Developing |
| 41-60% | Defined |
| 61-80% | Managed |
| 81-100% | Optimizing |

## Development

### Prerequisites

- Node.js (for SpiraApp package generator)
- Access to a Spira instance with developer mode enabled

### Modify and Test

1. Edit `widget.js`, `manifest.yaml`, etc.
2. Build: `./build_spiraapp.sh`
3. Upload to Spira (System Admin > SpiraApps)
4. Enable for a product and test

### Debug Logging

The widget writes debug logs to `localStorage.dmm_debug_log`. Check browser Developer Tools > Application > Local Storage.

### Key Files

| File | Purpose |
|------|---------|
| `manifest.yaml` | SpiraApp metadata and page registration |
| `widget.js` | All application logic (questions, templates, scoring) |
| `settings.js` | Product admin settings page |

## Related Documentation

- [SpiraApp User Guide](../../docs/USER-GUIDE-SPIRAAPP.md) - End-user documentation
- [SpiraApps Overview](../../docs/SpiraApp_Information/SpiraApps-Overview.md) - Development guide
- [SpiraApps Tutorial](../../docs/SpiraApp_Information/SpiraApps-Tutorial.md) - Tutorial
- [Main README](../../README.md) - Project overview

## Version History

| Version | Changes |
|---------|---------|
| 0.4 | Added custom framework support, CALMS framework |
| 0.3 | Improved storage API calls, debug logging |
| 0.2 | Added settings page, form validation |
| 0.1 | Initial widget with default questions |
