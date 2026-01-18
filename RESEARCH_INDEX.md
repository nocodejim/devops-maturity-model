# SpiraApp MVP: Configurable Assessments Research - Complete Index

## Overview

This directory contains comprehensive research and documentation on how the SpiraApp MVP currently handles assessments and approaches for making them configurable and project-specific.

**Total Documentation**: 2,904 lines across 4 files
**Research Completed**: January 17, 2026
**Status**: Complete and ready for implementation planning

---

## Document Guide

### 1. Main Research Document
**File**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` (37 KB, 1,129 lines)

**Purpose**: Comprehensive analysis of current architecture and future approaches

**Contains**:
- Current Assessment Code Location & Structure (Section 1)
- DevOps Maturity Model Implementation (Section 2)
- SpiraApp Capabilities & Limitations (Section 3)
- Frontend Integration (Section 4)
- Backend Framework Import Pattern (Section 5)
- Assessment Template & Schema (Section 6)
- Scoring & Results Calculation (Section 7)
- Potential Approaches for Project-Specific Assessments (Section 8)
  - Approach A: Local Custom Upload (Current MVP)
  - Approach B: Backend-Driven Framework Selection
  - Approach C: Hybrid (Recommended)
- Data Flow Architecture (Section 9)
- Technical Considerations & Constraints (Section 10)
- Scoring Logic for Custom Frameworks (Section 11)
- UI Considerations (Section 12)
- Implementation Roadmap (Section 13)
- Example: Mobile App Framework (Section 14)
- Comparison: SpiraApp vs Backend Platform (Section 15)
- Recommendations (Section 16)
- Appendix with File References (Section 18)

**Best For**: Deep understanding of architecture, decision-making, technical planning

---

### 2. Quick Reference Guide
**File**: `SPIRAAPP_QUICK_REFERENCE.md` (12 KB, 372 lines)

**Purpose**: Fast lookup for common questions and tasks

**Contains**:
- Current State Summary Table
- Architecture Overview Diagram
- Key Data Files Reference
- Critical Lessons Learned
- How to Create a Custom Framework (Step-by-step)
- Scoring Logic Explanation
- Storage Keys Reference
- Implementation Approaches Comparison
- File Checklist for Deployment
- API Endpoints Reference
- Resources & Links
- Next Steps Checklist

**Best For**: Quick answers, implementation tasks, troubleshooting

---

### 3. Architecture Diagrams
**File**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` (41 KB, 942 lines)

**Purpose**: Visual representation of flows and architectures

**Contains**:
1. Current Assessment Flow Diagram
2. Storage & Persistence Architecture
3. Product Admin Settings Configuration Flow
4. Assessment Framework Data Model
5. Response Collection & Scoring Flow
6. Approach A: Local Custom Framework
7. Approach B: Backend-Driven Selection
8. Approach C: Hybrid (Recommended)
9. Multi-Tenant Organization Structure
10. State Machine: Widget Lifecycle
11. Error Handling Flow
12. Network & Offline Considerations

**Best For**: Visual learners, presentations, understanding relationships

---

### 4. Research Summary
**File**: `RESEARCH_SUMMARY.txt` (17 KB, 461 lines)

**Purpose**: Executive summary and quick overview

**Contains**:
- Deliverables Overview
- Key Findings Summary
- Storage Mechanisms Explained
- Implementation Approaches Comparison Table
- Scoring Algorithm Explanation
- Validation Schema
- Project-Specific Scenarios
- File Structure Reference
- Implementation Roadmap (4 phases)
- Critical Code References (Line numbers)
- Risks & Mitigations
- Document Locations
- Contact & Support

**Best For**: Project managers, executives, getting started

---

## Quick Navigation by Role

### For Product Managers
1. **Start Here**: `RESEARCH_SUMMARY.txt` - Executive overview
2. **Then Read**: Implementation Roadmap section of `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md`
3. **Reference**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 6-8 for approach comparison

---

### For Software Architects
1. **Start Here**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` Section 1-5
2. **Then Read**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` all sections
3. **Deep Dive**: Implementation Approaches section (Section 8-13)
4. **Reference**: Scoring & Technical Considerations sections

---

### For Front-End Developers
1. **Start Here**: `SPIRAAPP_QUICK_REFERENCE.md` sections: Current State, Key Data Files, Scoring Logic
2. **Then Read**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` Sections 1, 6, 7, 11
3. **Reference**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Sections 1, 4, 5
4. **Technical**: File References appendix for code locations

---

### For Backend Developers
1. **Start Here**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` Section 2, 5
2. **Then Read**: `SPIRAAPP_QUICK_REFERENCE.md` Storage Mechanisms section
3. **Architecture**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Sections 2, 6-8
4. **Integration**: Sections 8.2 and 8.3 of main research document

---

### For QA/Testers
1. **Start Here**: `SPIRAAPP_QUICK_REFERENCE.md` - How to Create Framework, Debugging Guide
2. **Reference**: Error Handling Flow `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 9
3. **Test Cases**: Implementation Approaches section
4. **Debugging**: Critical Code References in `RESEARCH_SUMMARY.txt`

---

### For Product Admins/Users
1. **Start Here**: `SPIRAAPP_QUICK_REFERENCE.md` - "How to Create a Custom Framework"
2. **Reference**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 3 - Settings Page Flow
3. **Troubleshooting**: Debugging Guide in quick reference

---

## Key Findings Summary

### Current State
- ❌ Custom framework upload: NOT IMPLEMENTED (settings.js doesn't exist)
- ❌ Framework validation: NOT IMPLEMENTED
- ✅ Per-product storage: Pattern established in widget.js
- ✅ Dynamic form rendering: Works (with hardcoded DMM_QUESTIONS)
- ✅ Scoring logic: Works (needs parameterization)
- ❌ Backend integration: NOT IMPLEMENTED
- ❌ Custom score ranges: Hardcoded to 0-5

### Architecture
- **Pure client-side** JavaScript (IIFE wrapped)
- **No external APIs** callable (security sandboxed)
- **Per-product storage** via SpiraApp API
- **Fully offline-capable** in current form
- **No dependencies** allowed (no npm, no CDN)

### Three Implementation Approaches

| Aspect | Approach A (Local) | Approach B (Backend) | Approach C (Hybrid) |
|--------|-------------------|-------------------|-------------------|
| **Offline** | ✅ | ❌ | ✅ |
| **Sharing** | ❌ | ✅ | ✅ |
| **Centralized** | ❌ | ✅ | ✅ |
| **Complex** | ❌ | ✅ | ⚠️ |
| **Recommended** | - | - | ✅ |

---

## Critical Code Locations (widget.js - actual line numbers)

- **Widget Initialization**: widget.js lines 412-418
- **Data Loading**: widget.js lines 435-518
- **Form Rendering**: widget.js lines 587-626
- **Scoring Calculation**: widget.js lines 702-747
- **Storage API Calls**: widget.js lines 760-821
- **Templates**: widget.js lines 307-397
- **Settings Page**: settings.js - DOES NOT EXIST (needs to be created)

See `RESEARCH_SUMMARY.txt` "Critical Code References" section for complete details.

---

## Implementation Roadmap

### Phase 1: Build Custom Framework Foundation
- Create settings.js with admin UI
- Update manifest.yaml for settings page
- Add framework loading to widget.js
- Add fallback to DMM_QUESTIONS

### Phase 2: Enhance Validation + Testing
- Improve error messages
- Add dry-run preview
- Support custom score ranges
- Add assessment export

### Phase 3: Backend Integration
- Add manifest settings for backend URL/API key
- Add product setting for framework selection
- Fetch from backend API via executeRest with fallback
- Implement offline caching

### Phase 4: Advanced Features
- Organization-level templates
- Per-product customization
- Assessment history export
- Comparison dashboard
- Framework versioning

---

## File Structure

```
/home/jim/projects/devops-maturity-model/
├── SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md  ← Main research
├── SPIRAAPP_QUICK_REFERENCE.md                    ← Quick lookup
├── SPIRAAPP_ARCHITECTURE_DIAGRAMS.md              ← Visual diagrams
├── RESEARCH_SUMMARY.txt                           ← Executive summary
└── RESEARCH_INDEX.md                              ← This file

src/spiraapp-mvp/                                  ← SpiraApp source
├── manifest.yaml
├── widget.js
├── widget.css
├── README.md
└── [settings.js - NEEDS TO BE CREATED]

backend/app/                                       ← Backend code
├── models.py
├── api/frameworks.py
├── api/assessments.py
└── scripts/seed_*.py

docs/SpiraApp_Information/                         ← API documentation
├── SpiraApps-Overview.md
├── SpiraApps-Manifest.md
├── SpiraApps-Reference.md
├── SpiraApps-Manager.md
└── SpiraRestAPI-v7.0-OpenAPI.json
```

---

## How to Use This Research

### For Initial Learning
1. Read `RESEARCH_SUMMARY.txt` for 15 min overview
2. Skim `SPIRAAPP_QUICK_REFERENCE.md` for structure
3. Review appropriate sections based on your role (see above)

### For Implementation Planning
1. Deep read `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md`
2. Study `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` for all flows
3. Review Implementation Roadmap and Recommendations
4. Reference code locations in `RESEARCH_SUMMARY.txt`

### For Debugging/Troubleshooting
1. Check `SPIRAAPP_QUICK_REFERENCE.md` Debugging Guide
2. Review `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 9 (Error Handling)
3. Consult error handling flows and common issues
4. Check `docs/spiraapp-lessons-learned.md` for known gotchas

### For Day-to-Day Development
1. Use `SPIRAAPP_QUICK_REFERENCE.md` as primary reference
2. Bookmark code location line numbers from `RESEARCH_SUMMARY.txt`
3. Refer to specific architecture diagrams when needed
4. Keep main research document available for detailed questions

---

## Key Insights

### SpiraApp Constraints (Non-Negotiable)
- Pure client-side JavaScript only
- No external imports or dependencies
- No direct backend API calls (must use spiraAppManager proxy)
- Storage limited to per-product key/value pairs
- Single JS file per page (IIFE wrapped)

### Current Capabilities (What Works)
- Per-product storage pattern (established in widget.js)
- Dynamic form rendering with Mustache
- Domain weights for scoring (hardcoded currently)
- Assessment history persistence
- Fully offline operation
- IIFE-wrapped JavaScript pattern

### Gap Areas (What's Missing)
- settings.js for custom framework upload
- Custom framework loading in widget.js
- Backend framework selection
- Custom score ranges (hardcoded 0-5)
- Framework versioning
- Multi-tenant organization support
- Advanced analytics/reporting

### Recommended Path Forward
**Approach C (Hybrid)** - combines best of A and B:
- Keep local upload working (offline capability)
- Add backend framework selection (centralized management)
- Implement fallback chain (graceful degradation)
- No breaking changes (backward compatible)

---

## Questions Answered by This Research

**Q: How are assessments currently stored?**
A: Per-product in SpiraApp storage as JSON blobs. See Section 3.1 of main research.

**Q: Can we make assessments project-specific?**
A: Yes, three approaches documented. Approach C (hybrid) recommended. See Section 8.

**Q: What's preventing backend integration?**
A: SpiraApp security sandbox. Must use executeApi() or executeRest(). See Section 3.2.

**Q: How does scoring work?**
A: Weighted domain scores averaged. See Section 7 and Scoring Algorithm in Quick Reference.

**Q: What are the critical SpiraApp API gotchas?**
A: 6 documented in lessons-learned.md, summarized in Quick Reference. Must include pluginName!

**Q: What's needed to implement Approach B?**
A: Manifest settings for API credentials, executeRest calls, fallback chain, caching. See Phase 3 of roadmap.

**Q: Can this work offline?**
A: Yes, completely. Approach A and C support offline. Approach B needs caching. See Network Considerations.

**Q: How do we support custom score ranges?**
A: Add scoreRange to framework metadata, modify calculateScores(). See Section 11.1.

---

## Research Methodology

This research was conducted by:

1. **Code Analysis**
   - Examined all SpiraApp source files (manifest, widget, settings)
   - Reviewed backend models and seeding scripts
   - Traced data flows and API calls
   - Documented all critical code locations

2. **Documentation Review**
   - Analyzed SpiraApp API documentation
   - Reviewed lessons-learned notes
   - Studied backend framework structure
   - Examined storage mechanisms

3. **Architecture Design**
   - Designed three implementation approaches
   - Analyzed tradeoffs and constraints
   - Created comprehensive flow diagrams
   - Documented data models and relationships

4. **Validation** (Updated 2026-01-17)
   - Cross-referenced all findings
   - Corrected code locations and line numbers
   - Confirmed API signatures
   - Fixed inaccuracies (settings.js noted as not existing)

---

## Contact & Questions

For detailed answers to specific questions:

- **Architecture**: See main research document Section 3-5
- **Implementation**: See Section 8-13 and Roadmap
- **Debugging**: See Quick Reference Debugging Guide
- **API Details**: See docs/SpiraApp_Information/ directory
- **Code Details**: See Research Summary Critical Code References section

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial complete research |
| 1.1 | 2026-01-17 | Fixed accuracy: settings.js doesn't exist, corrected line numbers, removed time estimates |

---

## Appendix: File Sizes

| Document | Size | Lines |
|----------|------|-------|
| Main Research | 37 KB | 1,129 |
| Quick Reference | 12 KB | 372 |
| Architecture Diagrams | 41 KB | 942 |
| Research Summary | 17 KB | 461 |
| Research Index | (this file) | ~400 |
| **TOTAL** | **~107 KB** | **~3,300** |

---

**Research Completed**: January 17, 2026
**Ready for**: Implementation planning, architecture decisions, developer onboarding
**Next Steps**: Review recommendations in Section 16 of main research document

