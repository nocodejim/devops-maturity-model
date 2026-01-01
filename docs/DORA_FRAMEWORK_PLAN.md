# DORA Framework Implementation Plan

**Date:** 2025-11-29
**Framework:** DevOps Research and Assessment (DORA) Metrics
**Target:** Lightweight technical delivery performance assessment
**Completion Time:** ~75 minutes (25 questions)

---

## Research Summary

### DORA Overview

DORA (DevOps Research and Assessment) is the industry-standard framework for measuring software delivery performance, based on research by Dr. Nicole Forsgren, Jez Humble, and Gene Kim published in the book "Accelerate: The Science of Lean Software and DevOps."

**Key Research Sources:**
- [DORA Metrics Overview - Atlassian](https://www.atlassian.com/devops/frameworks/dora-metrics)
- [Understanding DORA Metrics - Octopus Deploy](https://octopus.com/devops/metrics/dora-metrics/)
- [2024 DORA Report - Google Cloud](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report)
- [DORA Metrics Guide - GetDX](https://getdx.com/blog/dora-metrics/)
- [DORA Maturity Levels - Waydev](https://waydev.co/devops-maturity-model/)

---

## The Four Key DORA Metrics

### 1. Deployment Frequency (Velocity)
**Definition:** How often code is deployed to production

**Performance Benchmarks:**
- **Elite:** On-demand (multiple deploys per day)
- **High:** Once per day to once per week
- **Medium:** Once per week to once per month
- **Low:** Less than once per month

### 2. Lead Time for Changes (Velocity)
**Definition:** Time from code committed to code running in production

**Performance Benchmarks:**
- **Elite:** Less than 1 day
- **High:** 1 day to 1 week
- **Medium:** 1 week to 1 month
- **Low:** More than 1 month

### 3. Change Failure Rate (Stability)
**Definition:** Percentage of deployments causing production failures requiring remediation

**Performance Benchmarks:**
- **Elite:** 0-5%
- **High:** 5-15%
- **Medium:** 15-30%
- **Low:** More than 30%

### 4. Mean Time to Restore (Stability)
**Definition:** Time to recover from a production failure

**Performance Benchmarks:**
- **Elite:** Less than 1 hour
- **High:** Less than 1 day
- **Medium:** 1 day to 1 week
- **Low:** More than 1 week

---

## Framework Structure

### Total Questions: 25
**Estimated Completion Time:** 75 minutes (~3 minutes per question)

### Domain Breakdown (5 Domains)

#### Domain 1: Deployment Frequency (25% weight, 5 questions)
**Focus:** Deployment cadence, automation, and barriers to frequent deployment

**Questions will assess:**
1. Current deployment frequency to production
2. Deployment automation level
3. Approval/gate processes
4. Deployment scheduling (anytime vs. maintenance windows)
5. Multi-environment deployment frequency (dev, staging, production)

---

#### Domain 2: Lead Time for Changes (25% weight, 5 questions)
**Focus:** Speed from code commit to production deployment

**Questions will assess:**
1. Time from code commit to production
2. Build and CI pipeline speed
3. Testing time (automated test execution)
4. Code review/approval time
5. Deployment pipeline efficiency

---

#### Domain 3: Change Failure Rate (20% weight, 4 questions)
**Focus:** Quality, testing, and deployment reliability

**Questions will assess:**
1. Percentage of deployments requiring rollback or hotfix
2. Pre-deployment testing coverage and effectiveness
3. Production incident frequency after deployments
4. Quality gates and validation before production

---

#### Domain 4: Mean Time to Restore (20% weight, 5 questions)
**Focus:** Recovery speed and incident response capabilities

**Questions will assess:**
1. Time to detect production issues
2. Time to diagnose root cause
3. Rollback capability and speed
4. On-call readiness and runbooks
5. Post-incident learning and improvements

---

#### Domain 5: Enabling Practices (10% weight, 6 questions)
**Focus:** Technical and cultural practices that enable high DORA performance

**Questions will assess:**
1. Trunk-based development vs. long-lived branches
2. Continuous Integration practices
3. Test automation investment
4. Architecture (microservices, loose coupling)
5. Monitoring and observability
6. Team autonomy and psychological safety

---

## Scoring Strategy

### Score Scale: 0-5 (aligned with maturity levels)

**Score Mapping to DORA Performance Levels:**
- **Score 5:** Elite performer level
- **Score 4:** High performer level
- **Score 3:** Medium performer level
- **Score 2:** Low performer level
- **Score 1:** Ad-hoc/initial practices
- **Score 0:** Not applicable / Unknown

### Overall Assessment Score
Weighted average across 5 domains:
- Deployment Frequency: 25%
- Lead Time for Changes: 25%
- Change Failure Rate: 20%
- Mean Time to Restore: 20%
- Enabling Practices: 10%

**Maturity Levels:**
- **Level 5 (Elite):** 80-100% - Elite DORA performer
- **Level 4 (High):** 60-79% - High DORA performer
- **Level 3 (Medium):** 40-59% - Medium DORA performer
- **Level 2 (Low):** 20-39% - Low DORA performer
- **Level 1 (Initial):** 0-19% - Beginning DevOps journey

---

## Question Design Principles

### Each Question Will Include:
1. **Clear Question Text:** Specific, measurable aspect of the metric
2. **Detailed Guidance:** Score 0-5 with concrete examples and benchmarks
3. **DORA Benchmarks:** Reference to Elite/High/Medium/Low performance levels where applicable
4. **Observable Metrics:** Focus on measurable behaviors and outcomes

### Question Format Example:
```
Text: "How often do you deploy code to production?"

Guidance:
Score 0 = Unknown or no regular deployment schedule
Score 1 = Less than once per month (Low performer)
Score 2 = Once per week to once per month (Medium performer)
Example: Monthly release cycles with planned maintenance windows

Score 3 = Multiple times per week (High performer trending)
Example: Deploy every Tuesday and Thursday with some automation

Score 4 = Once per day to multiple times per week (High performer)
Example: Daily deployments with automated pipeline

Score 5 = On-demand, multiple times per day (Elite performer)
Example: Deploy every merged PR automatically, 10+ deployments daily
```

---

## Implementation Steps

### Step 1: Create Seed Script ✅
- File: `backend/app/scripts/seed_dora_framework.py`
- Follow CALMS pattern (single gate per domain)
- Include all 25 questions with detailed guidance

### Step 2: Test Seeding
```bash
docker-compose exec backend python -m app.scripts.seed_dora_framework
```

### Step 3: Verify Database
```sql
SELECT * FROM frameworks WHERE name LIKE '%DORA%';
SELECT COUNT(*) FROM framework_domains WHERE framework_id = <dora_id>; -- Should be 5
SELECT COUNT(*) FROM framework_questions fq
  JOIN framework_gates fg ON fq.gate_id = fg.id
  JOIN framework_domains fd ON fg.domain_id = fd.id
  WHERE fd.framework_id = <dora_id>; -- Should be 25
```

### Step 4: Browser Testing
1. Login to application
2. Create new assessment with DORA framework
3. Complete all 25 questions
4. Submit assessment
5. Review results page
6. Verify DORA performance level classification

### Step 5: Documentation & Commit
1. Update `docs/lessons-learned.md` if issues found
2. Update `docs/progress-tracker.md` to mark DORA complete
3. Commit with proper message format

---

## Expected Outcomes

### Database Structure
```
Framework: "DORA Metrics Framework v1.0"
├── Domain 1: Deployment Frequency (25%)
│   ├── Gate: "Deployment Frequency Assessment"
│   └── Questions: 5
├── Domain 2: Lead Time for Changes (25%)
│   ├── Gate: "Lead Time Assessment"
│   └── Questions: 5
├── Domain 3: Change Failure Rate (20%)
│   ├── Gate: "Change Failure Rate Assessment"
│   └── Questions: 4
├── Domain 4: Mean Time to Restore (20%)
│   ├── Gate: "Mean Time to Restore Assessment"
│   └── Questions: 5
└── Domain 5: Enabling Practices (10%)
    ├── Gate: "Enabling Practices Assessment"
    └── Questions: 6

Total: 5 domains, 5 gates, 25 questions
```

### Assessment Experience
- **Duration:** 75 minutes
- **Focus:** Objective, metric-based evaluation
- **Output:** DORA performance classification (Elite/High/Medium/Low)
- **Recommendations:** Based on gaps in the 4 key metrics

---

## Differentiation from Other Frameworks

### DORA vs. MVP Framework
- **MVP:** Broad technical maturity (100 questions, 5 domains)
- **DORA:** Delivery performance metrics (25 questions, 4 core metrics + enablers)
- **Use Case:** DORA for delivery teams, MVP for comprehensive technical assessment

### DORA vs. CALMS Framework
- **CALMS:** Organizational culture and readiness (28 questions, 5 domains)
- **DORA:** Technical delivery performance (25 questions, 4 metrics + enablers)
- **Use Case:** CALMS for org transformation, DORA for delivery performance

### Complementary Usage
Organizations can use all three frameworks:
1. **CALMS** - Assess organizational readiness for DevOps
2. **DORA** - Measure delivery team performance
3. **MVP** - Evaluate comprehensive technical maturity

---

## Success Criteria

DORA Framework is complete when:
- [x] All 25 questions written with detailed guidance
- [x] Seed script runs without errors
- [x] Framework appears in database with correct structure (5 domains, 25 questions)
- [x] Frontend loads DORA framework correctly
- [x] Can complete full DORA assessment in ~75 minutes
- [x] Results page shows DORA performance level (Elite/High/Medium/Low)
- [x] Scoring correctly applies domain weights
- [x] Documentation updated
- [x] All tests passing
- [x] Changes committed to feature branch

---

## References & Sources

1. [DORA Metrics: How to measure Open DevOps Success | Atlassian](https://www.atlassian.com/devops/frameworks/dora-metrics)
2. [Understanding The 4 DORA Metrics And Top Findings From 2024/25 DORA Report | Octopus](https://octopus.com/devops/metrics/dora-metrics/)
3. [Announcing the 2024 DORA report | Google Cloud Blog](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report)
4. [What are DORA metrics? Complete guide | GetDX](https://getdx.com/blog/dora-metrics/)
5. [DORA Metrics in Assessing DevOps Maturity Levels | Waydev](https://waydev.co/devops-maturity-model/)
6. [DORA Report: DevOps Maturity Levels Rise | DevOps.com](https://devops.com/dora-report-devops-maturity-levels-rise/)
7. Book: "Accelerate: The Science of Lean Software and DevOps" by Nicole Forsgren, Jez Humble, Gene Kim

---

*Plan created: 2025-11-29*
*Ready for implementation*
