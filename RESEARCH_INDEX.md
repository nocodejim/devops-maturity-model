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

**Read Time**: 45-60 minutes

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

**Read Time**: 10-15 minutes

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

**Read Time**: 20-30 minutes

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

**Read Time**: 15-20 minutes

---

## Quick Navigation by Role

### For Product Managers
1. **Start Here**: `RESEARCH_SUMMARY.txt` - Executive overview (5 min)
2. **Then Read**: Implementation Roadmap section of `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` (10 min)
3. **Reference**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 6-8 for approach comparison (10 min)

**Time to Understand**: ~25 minutes

---

### For Software Architects
1. **Start Here**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` Section 1-5 (20 min)
2. **Then Read**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` all sections (30 min)
3. **Deep Dive**: Implementation Approaches section (Section 8-13) (20 min)
4. **Reference**: Scoring & Technical Considerations sections (10 min)

**Time to Understand**: ~80 minutes

---

### For Front-End Developers
1. **Start Here**: `SPIRAAPP_QUICK_REFERENCE.md` sections: Current State, Key Data Files, Scoring Logic (10 min)
2. **Then Read**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` Sections 1, 6, 7, 11 (20 min)
3. **Reference**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Sections 1, 4, 5 (10 min)
4. **Technical**: File References appendix for code locations (5 min)

**Time to Understand**: ~45 minutes

---

### For Backend Developers
1. **Start Here**: `SPIRAAPP_CONFIGURABLE_ASSESSMENTS_RESEARCH.md` Section 2, 5 (10 min)
2. **Then Read**: `SPIRAAPP_QUICK_REFERENCE.md` Storage Mechanisms section (5 min)
3. **Architecture**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Sections 2, 6-8 (15 min)
4. **Integration**: Sections 8.2 and 8.3 of main research document (15 min)

**Time to Understand**: ~45 minutes

---

### For QA/Testers
1. **Start Here**: `SPIRAAPP_QUICK_REFERENCE.md` - How to Create Framework, Debugging Guide (10 min)
2. **Reference**: Error Handling Flow `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 9 (5 min)
3. **Test Cases**: Implementation Approaches section (10 min)
4. **Debugging**: Critical Code References in `RESEARCH_SUMMARY.txt` (10 min)

**Time to Understand**: ~35 minutes

---

### For Product Admins/Users
1. **Start Here**: `SPIRAAPP_QUICK_REFERENCE.md` - "How to Create a Custom Framework" (5 min)
2. **Reference**: `SPIRAAPP_ARCHITECTURE_DIAGRAMS.md` Section 3 - Settings Page Flow (5 min)
3. **Troubleshooting**: Debugging Guide in quick reference (5 min)

**Time to Understand**: ~15 minutes

---

## Key Findings Summary

### Current State
- ✅ Custom framework upload: Partially implemented
- ✅ Per-product storage: Working
- ✅ Dynamic form rendering: Working
- ✅ Custom scoring: Working (domain weights)
- ❌ Backend integration: Not implemented
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

## Critical Code Locations

All referenced with line numbers:

- **Widget Initialization**: widget.js lines 416-429
- **Custom Framework Loading**: widget.js lines 429-463
- **Form Rendering**: widget.js lines 631-704
- **Scoring Calculation**: widget.js lines 825-893
- **Settings Page**: settings.js lines 167-211
- **Framework Validation**: settings.js lines 362-419
- **Storage API Calls**: widget.js lines 535-561, 922-970

See `RESEARCH_SUMMARY.txt` "Critical Code References" section for complete details.

---

## Implementation Roadmap

### Phase 1: Validate Current MVP (Week 1)
- Test custom framework upload
- Verify scoring calculations
- Test offline functionality
- Verify framework switching

### Phase 2: Enhance Validation (Week 2-3)
- Improve error messages
- Add dry-run preview
- Support custom score ranges
- Add assessment export

### Phase 3: Backend Integration (Week 4-5)
- Add product setting for framework selection
- Fetch from backend API with fallback
- Implement offline caching
- Graceful error handling

### Phase 4: Advanced Features (Week 6-8)
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
├── settings.js
├── assessment-template.json
└── widget.css

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
- Custom JSON framework upload
- Per-product storage & configuration
- Dynamic form rendering with Mustache
- Custom domain weights for scoring
- Assessment history persistence
- Fully offline operation

### Gap Areas (What's Missing)
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

**Q: How much effort to implement Approach B?**
A: ~2 weeks for basic integration, ~4-5 weeks for production-ready. See Phase 3 of roadmap.

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

4. **Validation**
   - Cross-referenced all findings
   - Verified code locations and line numbers
   - Confirmed API signatures
   - Checked for inconsistencies

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

