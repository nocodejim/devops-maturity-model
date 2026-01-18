# DevOps Maturity Assessment - SpiraApp Widget User Guide

Version 1.0

## Table of Contents

1. [Introduction](#introduction)
2. [What is the SpiraApp Widget?](#what-is-the-spiraapp-widget)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Using the Widget](#using-the-widget)
6. [Understanding Your Results](#understanding-your-results)
7. [Custom Frameworks](#custom-frameworks)
8. [Troubleshooting](#troubleshooting)
9. [Frequently Asked Questions](#frequently-asked-questions)

---

## Introduction

The DevOps Maturity Assessment SpiraApp is a lightweight widget that runs directly inside **SpiraPlan**, **SpiraTeam**, or **SpiraTest** (collectively referred to as "Spira"). It provides teams with a quick way to assess their DevOps maturity without leaving their ALM environment.

### Key Features

- **Integrated Experience**: Runs natively within Spira's Product Dashboard
- **No External Dependencies**: Purely client-side, no backend server required
- **Assessment History**: Results stored per-product in Spira's database
- **Configurable Frameworks**: Use the default framework or upload custom assessments
- **Quick Assessment**: Default assessment takes approximately 15-20 minutes

### Comparison: SpiraApp vs. Standalone Platform

| Feature | SpiraApp Widget | Standalone Platform |
|---------|-----------------|---------------------|
| Deployment | Inside Spira | Docker containers |
| Questions | 20 (3 domains) | 25-40+ (5 domains) |
| Frameworks | Default + custom JSON | MVP, CALMS, DORA |
| User Management | Uses Spira auth | Dedicated auth system |
| Data Storage | Spira database | PostgreSQL |
| Best For | Quick team checks | Comprehensive assessments |

---

## What is the SpiraApp Widget?

The SpiraApp widget is a **Product Dashboard widget** that allows teams to:

1. **Start an Assessment**: Answer 20 questions about your DevOps practices
2. **View Results**: See your maturity score and breakdown by domain
3. **Track Progress**: View assessment history over time
4. **Compare Assessments**: See how scores change between assessments

### Assessment Domains (Default Framework)

The default assessment covers three core domains:

**Domain 1: Source Control & Development (35% weight)**
- Version control usage and branching strategy
- Code review practices
- Automated quality checks
- Test coverage and build speed

**Domain 2: Security & Compliance (30% weight)**
- Security scanning automation
- Vulnerability handling
- Secrets management
- Supply chain security and compliance

**Domain 3: CI/CD & Deployment (35% weight)**
- Build automation
- Deployment frequency and automation
- Infrastructure as code
- Zero-downtime deployments and rollback capability

---

## Installation

### Prerequisites

- SpiraPlan, SpiraTeam, or SpiraTest (version 7.0+)
- System Administrator access for installation
- Product Administrator access for activation

### Step 1: Build the SpiraApp Package

From the repository root directory:

```bash
./build_spiraapp.sh
```

This creates a `.spiraapp` package file in the `dist/` folder.

### Step 2: Install in Spira (System Admin)

1. Log into Spira as a **System Administrator**
2. Navigate to **System Administration > SpiraApps**
3. Click **Upload SpiraApp**
4. Select the `.spiraapp` file from the `dist/` folder
5. Click **Upload**
6. Once uploaded, click the **power button** (toggle) to enable the SpiraApp system-wide

### Step 3: Enable for a Product (Product Admin)

1. Navigate to the **Product** where you want to use the widget
2. Go to **Product Administration > General Settings > SpiraApps**
3. Find "DevOps Maturity Model Assessment" in the list
4. Click to **enable** it for this product
5. Click **Save**

### Step 4: Add the Widget to Dashboard

1. Go to the **Product Home** page (Dashboard)
2. Click **Add/Remove Items** (gear icon or "Customize" button)
3. Find "DevOps Maturity Model Assessment" in the widget list
4. Check the box to add it
5. Click **Add** or **Save**

The widget should now appear on your Product Dashboard.

---

## Configuration

### Default Configuration

The SpiraApp works out-of-the-box with no configuration required. It uses the built-in 20-question DevOps Maturity assessment.

### Custom Framework Upload

To use a different assessment framework:

1. Navigate to **Product Administration > SpiraApps**
2. Find "DevOps Maturity Model Assessment"
3. Click to configure
4. Use the **Custom Framework** option to upload a JSON file
5. Click **Save**

See [Custom Frameworks](#custom-frameworks) for details on creating custom assessments.

---

## Using the Widget

### Starting an Assessment

1. Navigate to the **Product Home** page
2. Locate the **DevOps Maturity** widget
3. Click **Start Assessment** (or **Start New Assessment** if you have previous results)

### Answering Questions

The assessment form displays all questions organized by domain:

1. **Read each question** carefully
2. **Select the option** that best matches your current state (scores range from 0-5)
3. Each option includes a point value to help calibrate your response
4. Continue through all questions in all domains

**Scoring Guide:**
- **0 points**: Practice not implemented
- **1 point**: Initial/ad-hoc implementation
- **2 points**: Basic implementation in place
- **3 points**: Standardized and documented
- **4 points**: Comprehensive automation
- **5 points**: Industry-leading practices

### Submitting the Assessment

1. Ensure all questions are answered
2. Click **Submit Assessment**
3. The widget will display a "Calculating..." message
4. Results appear automatically upon completion

### Viewing Previous Results

When you have assessment history:

1. The widget displays your **latest score** prominently
2. Shows the **assessment date**
3. Displays the **maturity level** (Initial through Optimizing)
4. Shows a count of **previous assessments**

---

## Understanding Your Results

### Results Display

After completing an assessment, you'll see:

1. **Overall Score**: Percentage (0-100%) reflecting your weighted average
2. **Maturity Level**: One of five levels based on your score
3. **Domain Breakdown**: Individual scores for each domain

### Maturity Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| Level 1: Initial | 0-20% | Ad-hoc, manual processes; success depends on individuals |
| Level 2: Developing | 21-40% | Some repeatable processes; basic automation |
| Level 3: Defined | 41-60% | Standardized processes; consistent application |
| Level 4: Managed | 61-80% | Measured and controlled; comprehensive automation |
| Level 5: Optimizing | 81-100% | Continuous improvement; industry-leading practices |

### Domain Scores

Each domain score shows:
- **Percentage**: Score out of maximum possible points
- **Domain Name**: Which area this measures

### Score Calculation

1. **Question Score**: Each question is worth 0-5 points
2. **Domain Score**: Sum of question scores / maximum possible, as percentage
3. **Overall Score**: Weighted average of domain scores
   - Source Control & Development: 35%
   - Security & Compliance: 30%
   - CI/CD & Deployment: 35%

---

## Custom Frameworks

### Overview

The SpiraApp supports custom assessment frameworks via JSON configuration. This allows you to:

- Create industry-specific assessments
- Add company-specific questions
- Adjust domain weights
- Support different assessment models (CALMS, DORA, etc.)

### JSON Framework Structure

```json
{
  "meta": {
    "name": "Your Framework Name",
    "description": "Description of your framework",
    "version": "1.0",
    "estimatedDuration": "90 minutes"
  },
  "domains": [
    {
      "id": "domain_id",
      "name": "Domain Name",
      "description": "What this domain measures",
      "weight": 0.25,
      "order": 1,
      "questions": [
        {
          "id": "Q1",
          "text": "The question text?",
          "guidance": "Score 0 = ... | Score 1 = ... | Score 5 = ...",
          "order": 1
        }
      ]
    }
  ]
}
```

### Key Requirements

1. **Domain weights must sum to 1.0** (e.g., 0.25 + 0.25 + 0.25 + 0.25 = 1.0)
2. **Question IDs must be unique** across the entire framework
3. **Each question needs options** (scores 0-5)
4. **Order fields** control display sequence

### Included Custom Frameworks

The repository includes ready-to-use frameworks:

**CALMS Framework** (`src/spiraapp-mvp/calms-framework.json`)
- 28 questions across 5 domains
- Focuses on organizational DevOps readiness
- Domains: Culture, Automation, Lean, Measurement, Sharing

**Example Framework** (`src/spiraapp-mvp/example-framework.json`)
- Sample template for creating custom frameworks

### Uploading a Custom Framework

1. Validate your JSON: `python -m json.tool your-framework.json`
2. Navigate to Product Admin > SpiraApps
3. Configure the DevOps Maturity widget
4. Upload your JSON file
5. Save and verify in the widget

---

## Troubleshooting

### Widget Not Appearing on Dashboard

**Symptoms**: Widget doesn't show up after installation

**Solutions**:
1. Verify the SpiraApp is **enabled system-wide** (System Admin > SpiraApps)
2. Verify the SpiraApp is **enabled for this product** (Product Admin > SpiraApps)
3. Add the widget via **Add/Remove Items** on the dashboard
4. Refresh the page (Ctrl+F5 for hard refresh)

### "Start Assessment" Button Not Working

**Symptoms**: Clicking the button does nothing

**Solutions**:
1. Check browser console for JavaScript errors (F12 > Console)
2. Ensure you have JavaScript enabled
3. Try a different browser
4. Check if ad-blockers are interfering

### Assessment Won't Submit

**Symptoms**: Clicking Submit doesn't save results

**Solutions**:
1. Ensure **all questions are answered** (all are required)
2. Check browser console for errors
3. Verify you have permission to modify product settings
4. Try refreshing and starting a new assessment

### Scores Look Wrong

**Symptoms**: Domain scores or overall score seem incorrect

**Solutions**:
1. Verify domain weights sum to 1.0 in custom frameworks
2. Check that question options have correct score values (0-5)
3. Review calculation: `(earned points / max points) * 100 * weight`

### Custom Framework Not Loading

**Symptoms**: Widget uses default instead of uploaded framework

**Solutions**:
1. Validate JSON syntax: `python -m json.tool framework.json`
2. Check file size (keep under 100KB)
3. Ensure all required fields are present
4. Check browser console for parsing errors

### Debug Mode

To investigate issues, check the debug log:

1. Open browser Developer Tools (F12)
2. Go to **Application** tab > **Local Storage**
3. Find `dmm_debug_log` entry
4. Review recent log entries for errors

---

## Frequently Asked Questions

### General Questions

**Q: How long does an assessment take?**

A: The default 20-question assessment takes approximately 15-20 minutes. Custom frameworks vary based on question count.

**Q: Can multiple team members complete the same assessment?**

A: Each assessment is stored per-product. Team members can discuss and complete one assessment together, or individuals can complete separate assessments over time.

**Q: Are results shared across products?**

A: No, assessment history is stored per-product. Each Spira product has its own assessment history.

**Q: Can I delete old assessments?**

A: Currently, assessment history is append-only. Contact your Spira administrator if you need to clear history.

### Technical Questions

**Q: What Spira versions are supported?**

A: SpiraPlan, SpiraTeam, and SpiraTest version 7.0 and later.

**Q: Does this require internet access?**

A: No, the SpiraApp runs entirely within Spira. No external connections are made.

**Q: Where is data stored?**

A: Assessment data is stored in Spira's database using the SpiraApp storage API. Data remains within your Spira instance.

**Q: Can I export assessment results?**

A: Currently, results are displayed in the widget. For export, consider using the standalone platform or contact your Spira administrator.

### Framework Questions

**Q: Can I use CALMS or DORA frameworks?**

A: Yes! Upload the included `calms-framework.json` as a custom framework. The DORA framework is available in the standalone platform.

**Q: Can I modify the default questions?**

A: Yes, create a custom framework JSON file with your modified questions and upload it.

**Q: What's the difference between this and the standalone platform?**

A: The SpiraApp is a lightweight, embedded widget for quick assessments. The standalone platform offers more features including multiple frameworks, user management, comprehensive analytics, and detailed reporting.

---

## Additional Resources

### Repository Files

- **SpiraApp Source**: `src/spiraapp-mvp/`
- **Build Script**: `build_spiraapp.sh`
- **CALMS Framework**: `src/spiraapp-mvp/calms-framework.json`
- **SpiraApp Documentation**: `docs/SpiraApp_Information/`

### Related Documentation

- [SpiraApp Overview](SpiraApp_Information/SpiraApps-Overview.md)
- [SpiraApp Tutorial](SpiraApp_Information/SpiraApps-Tutorial.md)
- [SpiraApp Manifest Reference](SpiraApp_Information/SpiraApps-Manifest.md)
- [Standalone Platform User Guide](USER-GUIDE.md)

### Support

For issues with:
- **SpiraApp functionality**: Check this guide's troubleshooting section
- **Spira platform**: Contact Inflectra support
- **Custom frameworks**: Review the JSON structure requirements

---

## Version History

**Version 1.0** (January 2026)
- Initial release
- 20-question default assessment
- Support for custom framework upload
- Product-level assessment storage
- Maturity level calculation

---

End of SpiraApp Widget User Guide
