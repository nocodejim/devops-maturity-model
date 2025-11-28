# CALMS Framework Analysis & Implementation Plan

**Date:** 2025-11-26
**Purpose:** Research and map CALMS framework to the multi-framework architecture

## Executive Summary

The CALMS framework is an excellent fit for the new multi-framework architecture. It provides a **simpler, more business-focused** assessment compared to the technical MVP framework, making it ideal for organizations starting their DevOps journey.

**Key Characteristics:**
- **5 Domains** (vs. 5 in MVP) - Culture, Automation, Lean, Measurement, Sharing
- **Principle-based** rather than technology-specific
- **People & process focused** rather than tool-focused
- **Complements MVP framework** - use CALMS for organizational readiness, MVP for technical maturity

---

## What is CALMS?

CALMS is a DevOps framework created by **Jez Humble** (co-author of "The DevOps Handbook") to assess an organization's ability to adopt DevOps processes and measure success during transformation.

### The 5 Pillars

| Pillar | Focus | Key Question |
|--------|-------|--------------|
| **C**ulture | Collaboration, blameless culture | Do teams swarm on problems together? |
| **A**utomation | CI/CD, IaC, testing | Are manual tasks automated? |
| **L**ean | Continuous improvement, experimentation | Do we embrace failure as learning? |
| **M**easurement | Metrics, data-driven decisions | Can we measure what matters? |
| **S**haring | Knowledge transfer, transparency | Do teams share learnings openly? |

---

## CALMS vs. MVP Framework Comparison

| Aspect | CALMS Framework | MVP Framework (Current) |
|--------|----------------|-------------------------|
| **Focus** | Organizational readiness | Technical implementation |
| **Audience** | Executives, managers, culture change leaders | Engineers, DevOps practitioners |
| **Questions** | "Are we ready for DevOps?" | "How well do we do DevOps?" |
| **Domains** | 5 principle-based | 5 practice-based |
| **Complexity** | Beginner-friendly | Intermediate to advanced |
| **Assessment Tone** | Cultural & behavioral | Technical & process |
| **Use Case** | Pre-transformation, leadership buy-in | Ongoing maturity tracking |

**Recommendation:** Offer BOTH frameworks. Let users choose based on their assessment goals.

---

## Mapping CALMS to Framework Structure

### Framework Metadata
```
Name: "CALMS DevOps Framework"
Description: "Organizational readiness assessment for DevOps transformation based on Jez Humble's CALMS model"
Version: "1.0"
```

### Domain Structure (5 Domains)

Each domain has equal weight (0.20 = 20%) since CALMS doesn't prescribe relative importance.

#### Domain 1: Culture (20%)

**Description:** Assesses collaboration, blameless culture, and organizational mindset for DevOps adoption.

**Suggested Gates (4):**
1. **Cross-Functional Collaboration**
   - Do Dev and Ops work together or in silos?
   - Are teams product-oriented vs. function-oriented?
   - Is there shared accountability for outcomes?

2. **Blameless Culture**
   - How are failures handled? (blame vs. learning)
   - Are post-mortems focused on process improvement?
   - Do teams feel safe experimenting?

3. **Communication & Transparency**
   - Do teams share information openly?
   - Are decisions made transparently?
   - Do different functions attend each other's meetings?

4. **Organizational Support**
   - Does leadership support DevOps initiatives?
   - Are teams empowered to make decisions?
   - Is there budget/time for improvement work?

---

#### Domain 2: Automation (20%)

**Description:** Evaluates automation maturity in build, test, deploy, and infrastructure provisioning.

**Suggested Gates (4):**
1. **Build & Integration Automation**
   - Is code built automatically on commit?
   - Are builds consistent and repeatable?
   - How long does a build take?

2. **Test Automation**
   - What percentage of tests are automated?
   - Are tests run in CI pipeline?
   - Is there automated regression testing?

3. **Deployment Automation**
   - Can you deploy with a button click?
   - Are deployments to all environments automated?
   - How frequent are deployments?

4. **Infrastructure Automation**
   - Is infrastructure defined as code?
   - Are environments provisioned automatically?
   - Can you recreate environments consistently?

---

#### Domain 3: Lean (20%)

**Description:** Measures continuous improvement mindset, experimentation, and waste reduction.

**Suggested Gates (4):**
1. **Continuous Improvement**
   - Are retrospectives held regularly?
   - Are improvement actions tracked and implemented?
   - Is there a culture of kaizen (small improvements)?

2. **Experimentation & Learning**
   - Does the organization encourage experimentation?
   - Is failure viewed as a learning opportunity?
   - Are A/B tests or proof-of-concepts common?

3. **Waste Reduction**
   - Are bottlenecks identified and addressed?
   - Is work-in-progress limited?
   - Are handoffs minimized?

4. **Value Stream Optimization**
   - Is work visualized (e.g., Kanban boards)?
   - Are lead times measured and improved?
   - Is customer value prioritized over output?

---

#### Domain 4: Measurement (20%)

**Description:** Assesses data collection, metrics usage, and data-driven decision making.

**Suggested Gates (4):**
1. **Deployment Metrics**
   - Deployment frequency tracked?
   - Lead time for changes measured?
   - Change failure rate monitored?
   - Mean time to recovery (MTTR) known?

2. **System Health Metrics**
   - Uptime/availability measured?
   - Performance metrics collected?
   - Error rates tracked?
   - Resource utilization monitored?

3. **Business Metrics**
   - User engagement tracked?
   - Feature adoption measured?
   - Customer satisfaction monitored?
   - Business value of changes quantified?

4. **Data-Driven Decisions**
   - Are metrics visible to teams?
   - Are decisions based on data?
   - Is there a feedback loop from metrics to action?
   - Are metrics reviewed regularly?

---

#### Domain 5: Sharing (20%)

**Description:** Evaluates knowledge sharing, collaboration tools, and organizational learning.

**Suggested Gates (4):**
1. **Knowledge Management**
   - Is documentation maintained and accessible?
   - Are lessons learned captured?
   - Is tribal knowledge reduced?
   - Are runbooks/playbooks shared?

2. **Cross-Team Collaboration**
   - Do teams share tools and practices?
   - Are inner-source practices used?
   - Is there cross-team code review?
   - Are communities of practice active?

3. **Transparency & Visibility**
   - Are roadmaps shared across teams?
   - Is progress visible to all stakeholders?
   - Are incidents/outages communicated openly?
   - Is work status transparent?

4. **Learning & Development**
   - Do teams participate in training?
   - Is learning time allocated?
   - Are conferences/meetups encouraged?
   - Is knowledge sharing rewarded?

---

## Detailed Question Examples

### Sample Questions for "Cross-Functional Collaboration" Gate

1. **Team Structure & Organization**
   - *Question:* "How are your teams organized?"
   - *Guidance:*
     - 0 = Strict functional silos (Dev, QA, Ops separate)
     - 3 = Teams have representatives from different functions
     - 5 = Fully cross-functional product teams with end-to-end ownership

2. **Problem-Solving Approach**
   - *Question:* "When a production issue occurs, how is it handled?"
   - *Guidance:*
     - 0 = Ops fixes it alone, Dev uninvolved
     - 3 = Dev and Ops communicate via tickets/handoffs
     - 5 = Cross-functional team swarms on the problem together

3. **Meeting Participation**
   - *Question:* "Do developers attend operations team meetings (and vice versa)?"
   - *Guidance:*
     - 0 = Never, teams don't attend each other's meetings
     - 3 = Occasionally for critical incidents
     - 5 = Regular participation in standups, planning, retrospectives

4. **Shared Accountability**
   - *Question:* "Who is accountable for production uptime and customer satisfaction?"
   - *Guidance:*
     - 0 = Operations only ("not our problem" from Dev)
     - 3 = Shared accountability defined but not practiced
     - 5 = "You build it, you run it" - full shared ownership

5. **Incident Response**
   - *Question:* "How are incident post-mortems conducted?"
   - *Guidance:*
     - 0 = Blame is assigned, individuals held responsible
     - 3 = Process-focused but still some finger-pointing
     - 5 = Blameless, focuses on systemic improvements

### Sample Questions for "Deployment Automation" Gate

1. **Deployment Frequency**
   - *Question:* "How often does your team deploy to production?"
   - *Guidance:*
     - 0 = Quarterly or less frequent
     - 2 = Monthly
     - 3 = Weekly
     - 4 = Daily
     - 5 = Multiple times per day (on-demand)

2. **Deployment Process**
   - *Question:* "What is required to deploy a change to production?"
   - *Guidance:*
     - 0 = Manual steps, multiple approvals, scheduled maintenance window
     - 3 = Semi-automated with some manual steps
     - 5 = Fully automated, single-click/automated trigger

3. **Environment Parity**
   - *Question:* "How similar are your dev, test, and production environments?"
   - *Guidance:*
     - 0 = Completely different configurations
     - 3 = Similar but with manual setup differences
     - 5 = Identically provisioned from the same automation

4. **Rollback Capability**
   - *Question:* "Can you rollback a deployment if issues are discovered?"
   - *Guidance:*
     - 0 = No rollback capability, must fix forward
     - 3 = Manual rollback possible but complex
     - 5 = Automated one-click rollback

5. **Deployment Confidence**
   - *Question:* "How confident is the team when deploying to production?"
   - *Guidance:*
     - 0 = High anxiety, deployments often fail
     - 3 = Moderate confidence, occasional issues
     - 5 = Routine, boring, reliable deployments

---

## Question Count Estimation

**Total Questions:** 100 (5 domains × 4 gates × 5 questions)

This matches your existing MVP framework structure (20 gates × 5 questions = 100 total).

**Domain Distribution:**
- Culture: 20 questions
- Automation: 20 questions
- Lean: 20 questions
- Measurement: 20 questions
- Sharing: 20 questions

---

## Implementation Differences from MVP

### Similarities ✅
- Same structure: Framework → Domain → Gate → Question
- Same scoring: 0-5 scale per question
- Same domain count: 5 domains
- Same gate count: 4 gates per domain (20 total)
- Same question count: ~5 questions per gate (100 total)

### Differences 🔄

| Aspect | CALMS | MVP Framework |
|--------|-------|---------------|
| **Domain Weights** | Equal (0.20 each) | Varied (Security 25%, CI/CD 25%, etc.) |
| **Question Type** | Behavioral/Organizational | Technical/Implementation |
| **Complexity** | Simpler, higher-level | More detailed, technical |
| **Target Audience** | Business + Technical | Technical teams |
| **Assessment Duration** | 30-45 minutes | 60-90 minutes |

---

## Recommended Weighting Strategy

### Option 1: Equal Weights (Recommended for MVP)
All domains = 20% each

**Rationale:** CALMS pillars are interdependent; all are equally important.

### Option 2: Weighted Based on Organizational Priority
Example for organizations prioritizing culture:
- Culture: 30%
- Automation: 25%
- Measurement: 20%
- Lean: 15%
- Sharing: 10%

**Recommendation:** Start with Option 1 (equal weights) for simplicity and alignment with CALMS philosophy.

---

## Integration with Existing System

### Database Changes Required
✅ **NONE!** The framework architecture supports CALMS out-of-the-box.

### What's Needed
1. **Seed Script:** `backend/app/scripts/seed_calms_framework.py`
2. **Gate/Question Content:** Detailed questions for all 20 gates
3. **Documentation:** Update README to mention CALMS option

### Seed Script Outline
```python
def seed_calms_framework():
    """Seed CALMS DevOps Framework"""

    framework = Framework(
        name="CALMS DevOps Framework",
        description="Organizational readiness assessment for DevOps transformation (Culture, Automation, Lean, Measurement, Sharing)",
        version="1.0"
    )

    # 5 Domains with equal weight
    domains = [
        {
            "name": "Culture",
            "description": "Collaboration, blameless culture, and organizational mindset",
            "weight": 0.20,
            "gates": [...]
        },
        # ... 4 more domains
    ]

    # Create 4 gates per domain (20 total)
    # Create ~5 questions per gate (100 total)
```

---

## User Experience Considerations

### Framework Selection
When creating a new assessment, users should choose:
- **"DevOps Maturity MVP"** → Technical maturity assessment
- **"CALMS DevOps Framework"** → Organizational readiness assessment

### Assessment Experience
- **CALMS assessments** will feel more conversational and culture-focused
- **MVP assessments** will feel more technical and tool-focused

### Reporting Differences
- **CALMS reports** emphasize organizational capabilities
- **MVP reports** emphasize technical implementation maturity

---

## Next Steps to Implement CALMS

### Phase 1: Content Development (4-6 hours)
1. ✅ Research CALMS framework (DONE)
2. ⬜ Define 20 gates (4 per domain)
3. ⬜ Write 100 assessment questions (5 per gate)
4. ⬜ Write guidance text for each question
5. ⬜ Review questions for clarity and relevance

### Phase 2: Technical Implementation (2-3 hours)
1. ⬜ Create `seed_calms_framework.py` script
2. ⬜ Test seeding on local database
3. ⬜ Verify framework appears in frontend dropdown
4. ⬜ Complete sample CALMS assessment end-to-end
5. ⬜ Generate CALMS assessment report

### Phase 3: Documentation (1 hour)
1. ⬜ Update README with CALMS framework info
2. ⬜ Document when to use CALMS vs. MVP
3. ⬜ Add CALMS to lessons-learned if issues found

### Phase 4: Testing & Validation (2 hours)
1. ⬜ Test with real team using CALMS framework
2. ⬜ Validate scoring makes sense
3. ⬜ Ensure report output is meaningful
4. ⬜ Gather feedback on questions

**Total Estimated Time:** 9-12 hours for complete CALMS implementation

---

## Recommended Gate & Question Structure

### Quick Reference Template

```
Domain: Culture (20%)
├── Gate 1: Cross-Functional Collaboration
│   ├── Q1: Team organization structure
│   ├── Q2: Problem-solving approach
│   ├── Q3: Meeting participation
│   ├── Q4: Shared accountability
│   └── Q5: Incident response culture
├── Gate 2: Blameless Culture
│   ├── Q1: Failure handling
│   ├── Q2: Post-mortem practices
│   ├── Q3: Psychological safety
│   ├── Q4: Experimentation encouragement
│   └── Q5: Learning from mistakes
├── Gate 3: Communication & Transparency
│   ├── Q1: Information sharing
│   ├── Q2: Decision-making transparency
│   ├── Q3: Cross-team communication
│   ├── Q4: Tool/channel accessibility
│   └── Q5: Status visibility
└── Gate 4: Organizational Support
    ├── Q1: Leadership buy-in
    ├── Q2: Resource allocation
    ├── Q3: Team empowerment
    ├── Q4: Change management
    └── Q5: Incentive alignment

[Repeat for Automation, Lean, Measurement, Sharing domains...]
```

---

## Resources & References

### Primary Sources
- [CALMS Framework - Atlassian](https://www.atlassian.com/devops/frameworks/calms-framework)
- [Using CALMS to Assess an Organization's DevOps - DevOps.com](https://devops.com/using-calms-to-assess-organizations-devops/)
- [What is CALMS for DevOps? - TechTarget](https://www.techtarget.com/whatis/definition/CALMS)
- [CALMS Framework for DevOps Transformation - XenonStack](https://www.xenonstack.com/insights/calms-in-devops)

### Additional Reading
- "The DevOps Handbook" by Jez Humble, Gene Kim, Patrick Debois, and John Willis
- [The CALMS Model: Assessing Your Readiness for a DevOps Transformation - LinkedIn](https://www.linkedin.com/pulse/calms-model-assessing-your-readiness-devops-stefana-muller)
- [CALMS Framework Templates - SlideTeam](https://www.slideteam.net/blog/top-10-devops-maturity-assessment-templates-with-examples-and-samples)

### Complementary Frameworks
- **DORA Metrics** (for measuring DevOps performance)
- **SPACE Framework** (for developer productivity)
- **Team Topologies** (for organizational structure)

---

## Decision Matrix: When to Use Which Framework?

| Scenario | Recommended Framework | Why |
|----------|----------------------|-----|
| Starting DevOps journey | CALMS | Assesses organizational readiness first |
| Leadership buy-in needed | CALMS | Focuses on culture and business impact |
| Already doing DevOps | MVP Framework | Measures technical implementation depth |
| Technical team self-assessment | MVP Framework | Detailed technical capabilities |
| Pre-transformation baseline | CALMS | Identifies cultural/organizational gaps |
| Post-transformation validation | MVP Framework | Validates technical practices adopted |
| Executive-level reporting | CALMS | High-level organizational capabilities |
| Engineering team improvement | MVP Framework | Specific technical areas to improve |

**Best Practice:** Use BOTH frameworks for comprehensive assessment:
1. Start with CALMS (organizational readiness)
2. Follow with MVP (technical implementation)
3. Compare results to identify gaps

---

## Conclusion

The CALMS framework is an **excellent complement** to the existing MVP framework:

✅ **Fits perfectly** into the multi-framework architecture
✅ **No code changes** required - just content/data
✅ **Addresses different audience** (business vs. technical)
✅ **Provides value** for organizations at all DevOps maturity levels
✅ **Industry standard** - widely recognized framework by Jez Humble

**Recommendation:** Implement CALMS framework as second framework option, giving users choice based on their assessment goals.

The multi-framework architecture proves its value immediately by supporting both technical (MVP) and organizational (CALMS) assessments without any code changes!
