# SpiraPlan Testing Agent: Overview

## Purpose
This documentation defines the architecture and operational procedures for an **Automated UI Testing Agent** designed to verify SpiraApps (widgets) within a live SpiraPlan environment. The agent emulates a user to perform end-to-end (E2E) testing, ensuring that applications like the **DevOps Maturity Model** function correctly in a real-world setting.

## Architecture
The Testing Agent is designed as a **Browser-Native Agent** that interacts with SpiraPlan exclusively through the web interface. This ignores internal API calls for app management (as none exist for uploading apps) and relies on visual verification.

### Core Capabilities
1.  **Authentication**: Handles login to SpiraService using standard credentials.
2.  **Navigation**: Direct access to Project Dashboards where widgets reside.
3.  **Interaction**: DOM-level manipulation to click buttons (Start, Submit), fill forms, and select dropdowns.
4.  **Verification**:
    *   **Visual**: Checking for specific text (e.g., "Assessment Complete").
    *   **Console**: Monitoring `DMM DEBUG` logs and catching `500` errors.
    *   **Data**: Verifying that widgets change state after interaction.

## Prerequisites
To deploy this agent, the following information and access levels are required:

| Requirement | Description | Example |
| :--- | :--- | :--- |
| **Target URL** | The full URL to the Project Dashboard. | `https://jimballic.spiraservice.net/29/General.aspx` |
| **Credentials** | Username/Password with access to the project. | `auser` / `*******` |
| **Project ID** | The numerical ID of the project. | `29` |
| **App Manifest** | The `manifest.yaml` of the app under test. | `src/spiraapp-mvp/manifest.yaml` |

## Directory Structure
*   **`AGENT_PROMPT.md`**: The comprehensive system instructions to use when initializing the agent.
*   **`WORKFLOWS.md`**: Step-by-step standard operating procedures for common testing tasks.
*   **`TEST_STRATEGY.md`**: A guide for analyzing a SpiraApp's `manifest.yaml` to generate test cases.
