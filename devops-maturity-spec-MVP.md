# DevOps Maturity Assessment Platform
## Technical Specification Document v2.0 - MVP Edition

---

## 1. Executive Summary

### 1.1 Purpose
Internal tool for assessing team DevOps maturity and readiness, focusing on the highest-impact practices that directly affect software delivery quality and velocity.

### 1.2 Vision
Lightweight, focused assessment tool that quickly identifies critical gaps and provides actionable roadmaps for improvement.

### 1.3 MVP Goals
- **20 highest-impact questions** covering core DevOps practices
- Simple internal authentication (no multi-tenant complexity)
- Fast assessment completion (~15-20 minutes)
- Clear scoring and actionable recommendations
- Track progress over time

### 1.4 Scope
**MVP Focus**: Domains 1-3 only (Source Control, Security, CI/CD)  
**Future Phases**: Infrastructure & Observability domains

---

## 2. MVP DevOps Maturity Framework

### 2.1 Maturity Levels
- **Level 1: Initial** (0-20%) - Ad-hoc, manual processes
- **Level 2: Developing** (21-40%) - Some automation, inconsistent
- **Level 3: Defined** (41-60%) - Standardized, documented
- **Level 4: Managed** (61-80%) - Metrics-driven, comprehensive automation
- **Level 5: Optimizing** (81-100%) - Industry-leading, continuous improvement

### 2.2 MVP Assessment Framework (20 Questions)

The MVP focuses on **3 core domains** with **20 highest-impact questions**:

---

#### **Domain 1: Source Control & Development Practices** (7 questions)

**Critical Success Factor**: Code quality and developer velocity

**Q1: Version Control System**
What version control system do you use?
- No version control (0)
- Centralized VCS (SVN, etc.) (1)
- Git with basic usage (2)
- Git with defined strategy (3)
- Git with trunk-based or optimized flow (4)
- Git with automated enforcement (5)

**Q2: Branching Strategy**
How do you manage code branches?
- No defined strategy, ad-hoc (0)
- Long-lived feature branches (1)
- GitFlow with manual merges (2)
- Trunk-based with feature flags (4)
- Trunk-based with automated CI checks (5)

**Q3: Code Review Process**
How are code changes reviewed?
- No formal review (0)
- Manual/email review (1)
- Pull requests, no automation (2)
- PR with required approvals (3)
- PR with automated checks + approvals (4)
- PR with checks + 2+ reviewers + protected branches (5)

**Q4: Automated Code Quality**
What automated code quality checks run on every commit?
- None (0)
- Linting only (2)
- Linting + basic static analysis (3)
- SAST + linting + complexity checks (4)
- Comprehensive analysis + security + coverage gates (5)

**Q5: Test Coverage**
What is your test coverage and automation level?
- No automated tests (0)
- <40% coverage, manual tests (1)
- 40-60% coverage, some automation (2)
- 60-80% coverage, mostly automated (3)
- >80% coverage, fully automated (4)
- >80% + integration tests + test pyramid (5)

**Q6: Build Speed**
How long does a typical build + test cycle take?
- >60 minutes (0)
- 30-60 minutes (1)
- 15-30 minutes (2)
- 5-15 minutes (3)
- <5 minutes with caching/parallelization (5)

**Q7: Developer Feedback Loop**
How quickly do developers get feedback on code changes?
- Hours or next day (0)
- 30-60 minutes (1)
- 10-30 minutes (2)
- 5-10 minutes (3)
- <5 minutes with local pre-commit checks (5)

---

#### **Domain 2: Security & Compliance** (6 questions)

**Critical Success Factor**: Security integrated into delivery pipeline

**Q8: Security Scanning**
What security scans run automatically in your pipeline?
- None (0)
- Manual security reviews only (1)
- Dependency scanning only (2)
- SAST + dependency scanning (3)
- SAST + DAST + dependency + container scanning (4)
- Full scan suite + secret detection + IaC scanning (5)

**Q9: Vulnerability Management**
How do you handle security vulnerabilities?
- No process (0)
- Manual tracking when found (1)
- Automated detection, manual remediation (2)
- Automated detection + SLA tracking (3)
- Automated detection + blocking + SLA (4)
- Automated detection + auto-remediation + SLA (5)

**Q10: Secrets Management**
How are secrets and credentials managed?
- Hardcoded in code/configs (0)
- Environment variables (1)
- Encrypted config files (2)
- Secrets management tool (HashiCorp Vault, etc.) (4)
- Centralized secrets + rotation + audit (5)

**Q11: Supply Chain Security**
Do you track your software dependencies and supply chain?
- No tracking (0)
- Manual dependency list (1)
- Automated dependency scanning (3)
- SBOM generation + license compliance (4)
- SBOM + provenance + signing + SLSA (5)

**Q12: Access Control**
How is access to production systems managed?
- Shared credentials (0)
- Individual accounts, no MFA (1)
- Individual accounts + MFA (2)
- SSO + MFA + role-based access (4)
- Zero-trust + just-in-time access + audit logs (5)

**Q13: Compliance Automation**
How do you handle audit and compliance requirements?
- Manual processes and documentation (0)
- Partially automated documentation (1)
- Automated compliance checks in pipeline (3)
- Policy as code + automated audits (4)
- Continuous compliance + automated evidence (5)

---

#### **Domain 3: CI/CD & Deployment** (7 questions)

**Critical Success Factor**: Fast, reliable, automated deployments

**Q14: Continuous Integration**
How automated is your build process?
- Manual builds (0)
- Semi-automated, triggered manually (1)
- Automated on commit to main branch (2)
- Automated on every commit/PR (3)
- Automated + parallel execution (4)
- Automated + parallel + optimized (<15 min) (5)

**Q15: Deployment Frequency**
How often do you deploy to production?
- Monthly or less (0)
- Every 2-4 weeks (1)
- Weekly (2)
- Multiple times per week (3)
- Daily (4)
- On-demand/continuous (multiple per day) (5)

**Q16: Deployment Automation**
How automated is your deployment process?
- Manual deployments (0)
- Scripted but manual trigger (1)
- Automated to staging, manual to prod (2)
- Automated to all environments (3)
- Automated + approval gates (4)
- Fully automated + GitOps + rollback (5)

**Q17: Infrastructure as Code**
How is your infrastructure managed?
- Manual/ClickOps (0)
- Documentation only (1)
- Scripts for some infrastructure (2)
- IaC for most infrastructure (Terraform, etc.) (3)
- IaC for all infrastructure + version control (4)
- IaC + automated testing + drift detection (5)

**Q18: Zero-Downtime Deployments**
Can you deploy without user-facing downtime?
- Always requires downtime (0)
- Usually requires maintenance window (1)
- Sometimes zero-downtime (2)
- Usually zero-downtime (blue-green/canary) (3)
- Always zero-downtime + automated verification (5)

**Q19: Rollback Capability**
How quickly can you rollback a bad deployment?
- >1 hour, manual process (0)
- 30-60 minutes, semi-automated (1)
- 10-30 minutes, mostly automated (2)
- <10 minutes, automated rollback (4)
- Instant automated rollback on failure detection (5)

**Q20: Feature Management**
How do you control feature releases?
- Features tied to deployments (0)
- Manual configuration changes (1)
- Basic feature flags (2)
- Feature flag system with targeting (3)
- Advanced feature flags + A/B testing (4)
- Progressive rollout + automated metrics (5)

---

### 2.3 Domain Weights (MVP)
- Source Control & Development: 35%
- Security & Compliance: 30%
- CI/CD & Deployment: 35%

---

## 3. Application Architecture

### 3.1 System Architecture (Simplified for Internal Use)

```
┌─────────────────────────────────────────┐
│         Frontend (React + TS)           │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │ Assessment  │  │  Results &       │ │
│  │   Form      │  │  Dashboard       │ │
│  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      FastAPI Backend (Python)           │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │ Assessment  │  │     Scoring      │ │
│  │    API      │  │     Engine       │ │
│  ├─────────────┤  ├──────────────────┤ │
│  │  Auth API   │  │   Report Gen     │ │
│  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│  (Users, Assessments, Responses)        │
└─────────────────────────────────────────┘
```

### 3.2 Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Query for data fetching
- React Hook Form + Zod validation
- Recharts for visualizations

**Backend:**
- Python 3.11+
- FastAPI framework
- SQLAlchemy ORM
- Pydantic for validation
- Alembic for migrations
- JWT authentication (python-jose)

**Database:**
- PostgreSQL 15+

**Infrastructure:**
- Docker + Docker Compose for local dev
- Dockerfile for containerization
- Optional: Kubernetes for production OR simple cloud PaaS

**Development:**
- Poetry for Python dependency management
- Black + Ruff for Python linting
- Pre-commit hooks
- pytest for backend testing
- Vitest for frontend testing

---

## 4. Data Models

### 4.1 Core Entities (Simplified)

```python
# models.py

class User(Base):
    id: UUID (primary key)
    email: str (unique, indexed)
    full_name: str
    hashed_password: str
    is_active: bool (default: True)
    is_admin: bool (default: False)
    created_at: datetime
    updated_at: datetime

class Assessment(Base):
    id: UUID (primary key)
    team_name: str
    assessor_id: UUID (foreign key -> User)
    status: Enum["draft", "in_progress", "completed"]
    
    # Scores
    overall_score: float (0-100)
    maturity_level: int (1-5)
    domain1_score: float
    domain2_score: float
    domain3_score: float
    
    # Metadata
    started_at: datetime
    completed_at: datetime (nullable)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    responses: List[Response]

class Response(Base):
    id: UUID (primary key)
    assessment_id: UUID (foreign key -> Assessment)
    question_number: int (1-20)
    domain: Enum["domain1", "domain2", "domain3"]
    score: int (0-5)
    notes: str (optional)
    created_at: datetime
    updated_at: datetime
```

### 4.2 Relationships
- User → Assessment (one-to-many, as assessor)
- Assessment → Response (one-to-many)

---

## 5. API Specification

### 5.1 Core Endpoints

```python
# Authentication
POST   /api/auth/login          # Login with email/password
POST   /api/auth/register       # Register new user (admin only)
POST   /api/auth/refresh        # Refresh JWT token
GET    /api/auth/me             # Get current user

# Assessments
GET    /api/assessments                    # List all assessments
POST   /api/assessments                    # Create new assessment
GET    /api/assessments/{id}               # Get specific assessment
PUT    /api/assessments/{id}               # Update assessment
DELETE /api/assessments/{id}               # Delete assessment
POST   /api/assessments/{id}/submit        # Submit and score assessment

# Responses
POST   /api/assessments/{id}/responses     # Save/update responses
GET    /api/assessments/{id}/responses     # Get all responses

# Reports
GET    /api/assessments/{id}/report        # Generate report data
GET    /api/assessments/{id}/report/pdf    # Download PDF report

# Analytics (simple)
GET    /api/analytics/summary              # Overall stats
GET    /api/analytics/trends               # Score trends over time
```

### 5.2 Request/Response Examples

**Create Assessment:**
```json
POST /api/assessments
{
  "team_name": "Platform Engineering Team"
}

Response:
{
  "id": "uuid-here",
  "team_name": "Platform Engineering Team",
  "status": "draft",
  "assessor_id": "user-uuid",
  "created_at": "2025-10-06T10:00:00Z"
}
```

**Save Responses:**
```json
POST /api/assessments/{id}/responses
{
  "responses": [
    {
      "question_number": 1,
      "domain": "domain1",
      "score": 4,
      "notes": "Using GitLab with protected branches"
    },
    {
      "question_number": 2,
      "domain": "domain1",
      "score": 5,
      "notes": "Trunk-based development with CI checks"
    }
  ]
}
```

**Submit Assessment:**
```json
POST /api/assessments/{id}/submit

Response:
{
  "id": "uuid-here",
  "status": "completed",
  "overall_score": 72.5,
  "maturity_level": 4,
  "domain1_score": 78.5,
  "domain2_score": 65.0,
  "domain3_score": 75.0,
  "completed_at": "2025-10-06T10:30:00Z"
}
```

---

## 6. Scoring Logic

### 6.1 Question Score
Each question is scored 0-5 points based on the selected answer.

### 6.2 Domain Score Calculation
```python
def calculate_domain_score(responses: List[Response], domain: str) -> float:
    """
    Calculate average score for a domain.
    """
    domain_responses = [r for r in responses if r.domain == domain]
    total_score = sum(r.score for r in domain_responses)
    max_possible = len(domain_responses) * 5
    return (total_score / max_possible) * 100

# Example:
# Domain 1 (7 questions): scores = [4, 5, 3, 4, 2, 3, 4]
# Total = 25, Max = 35
# Score = (25/35) * 100 = 71.43%
```

### 6.3 Overall Score Calculation
```python
def calculate_overall_score(domain_scores: dict) -> float:
    """
    Calculate weighted average of domain scores.
    """
    weights = {
        'domain1': 0.35,  # Source Control
        'domain2': 0.30,  # Security
        'domain3': 0.35   # CI/CD
    }
    
    overall = sum(domain_scores[d] * weights[d] for d in weights)
    return round(overall, 2)

# Example:
# Domain 1: 71.43% * 0.35 = 25.00
# Domain 2: 65.00% * 0.30 = 19.50
# Domain 3: 75.00% * 0.35 = 26.25
# Overall: 70.75%
```

### 6.4 Maturity Level Mapping
```python
def get_maturity_level(score: float) -> tuple[int, str]:
    """
    Map overall score to maturity level.
    """
    if score <= 20:
        return (1, "Initial")
    elif score <= 40:
        return (2, "Developing")
    elif score <= 60:
        return (3, "Defined")
    elif score <= 80:
        return (4, "Managed")
    else:
        return (5, "Optimizing")
```

---

## 7. User Interface

### 7.1 Key Screens

**1. Login Screen**
- Simple email/password form
- JWT token stored in httpOnly cookie

**2. Dashboard**
- Table of assessments with status, team, date, score
- "New Assessment" button
- Quick stats (total assessments, average score)

**3. Assessment Form**
- Single-page form with 20 questions
- Organized by domain with visual sections
- Each question shows the 0-5 scale with descriptions
- Optional notes field
- Auto-save draft every 30 seconds
- "Submit for Scoring" button

**4. Results Page**
- Hero section: Overall score + maturity level badge
- Radar chart: 3 domains
- Domain breakdown cards with scores
- Top 5 strengths (highest scoring questions)
- Top 5 gaps (lowest scoring questions)
- "Download Report" button
- "View Recommendations" section

**5. Recommendations Page**
- For each identified gap, provide:
  - What's missing
  - Why it matters
  - How to implement it
  - Resources/tools to use

### 7.2 UI Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── assessment/
│   │   ├── AssessmentForm.tsx
│   │   ├── QuestionCard.tsx
│   │   └── DomainSection.tsx
│   ├── results/
│   │   ├── ScoreCard.tsx
│   │   ├── RadarChart.tsx
│   │   ├── DomainBreakdown.tsx
│   │   └── StrengthsGaps.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AssessmentPage.tsx
│   └── ResultsPage.tsx
└── services/
    ├── api.ts
    └── auth.ts
```

---

## 8. Development Setup

### 8.1 Project Structure

```
devops-maturity-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app
│   │   ├── config.py                  # Settings
│   │   ├── database.py                # DB connection
│   │   ├── models.py                  # SQLAlchemy models
│   │   ├── schemas.py                 # Pydantic schemas
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # Auth endpoints
│   │   │   ├── assessments.py         # Assessment CRUD
│   │   │   └── analytics.py           # Analytics endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py            # JWT, password hashing
│   │   │   └── scoring.py             # Scoring engine
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── report_generator.py    # PDF generation
│   ├── alembic/                       # DB migrations
│   ├── tests/
│   ├── Dockerfile
│   ├── pyproject.toml                 # Poetry dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

### 8.2 Environment Variables

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/devops_maturity
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

### 8.3 Docker Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: devops
      POSTGRES_PASSWORD: devops123
      POSTGRES_DB: devops_maturity
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://devops:devops123@postgres:5432/devops_maturity
      SECRET_KEY: dev-secret-key-change-in-prod
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host

volumes:
  postgres_data:
```

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 9. MVP Development Roadmap

### Phase 1: Foundation (Week 1-2)
**Backend:**
- FastAPI project setup with Poetry
- Database models and migrations (Alembic)
- Authentication (JWT)
- Basic CRUD endpoints

**Frontend:**
- React + TypeScript + Vite setup
- Tailwind + shadcn/ui configuration
- Authentication flow
- Basic layout components

**Infrastructure:**
- Docker Compose setup
- PostgreSQL container
- Development environment documentation

### Phase 2: Core Assessment (Week 3-4)
**Backend:**
- Assessment CRUD endpoints
- Response save/update logic
- Scoring engine implementation
- Validation logic

**Frontend:**
- Assessment form with 20 questions
- Auto-save functionality
- Domain organization
- Progress tracking

### Phase 3: Results & Reports (Week 5)
**Backend:**
- Report generation logic
- Analytics endpoints
- PDF generation (ReportLab or WeasyPrint)

**Frontend:**
- Results dashboard
- Radar chart visualization
- Domain breakdown cards
- Strengths/gaps display
- Download report button

### Phase 4: Polish & Deploy (Week 6)
- End-to-end testing
- Bug fixes and refinement
- Documentation
- Production Docker images
- Deployment (cloud or internal server)
- User acceptance testing

**Total Timeline: 6 weeks for MVP**

---

## 10. Recommendations Engine

### 10.1 Gap Analysis

For each question scored 0-2 (critical gaps):

```python
RECOMMENDATIONS = {
    1: {  # Version Control
        "gap": "Not using modern version control",
        "why": "Version control is fundamental to collaboration and code safety",
        "how": [
            "Migrate to Git (GitHub, GitLab, or Bitbucket)",
            "Train team on Git basics",
            "Establish branching strategy"
        ],
        "tools": ["GitHub", "GitLab", "Bitbucket"],
        "priority": "CRITICAL"
    },
    2: {  # Branching Strategy
        "gap": "No defined branching strategy",
        "why": "Inconsistent branching leads to merge conflicts and delays",
        "how": [
            "Adopt trunk-based development for faster iterations",
            "Or implement GitFlow for release-based projects",
            "Document strategy and train team"
        ],
        "resources": [
            "https://trunkbaseddevelopment.com/",
            "https://www.atlassian.com/git/tutorials/comparing-workflows"
        ],
        "priority": "HIGH"
    },
    # ... (continue for all 20 questions)
}
```

### 10.2 Priority Matrix

```
Critical (0-1 score): Fix immediately - blocks DevOps progress
High (2 score):       Address within 1 month
Medium (3 score):     Improve within 3 months
Low (4+ score):       Optimize when capacity allows
```

---

## 11. Future Enhancements (Post-MVP)

### Phase 2 Features:
- **Domain 4 & 5**: Add Infrastructure and Observability questions
- **Historical Trends**: Track score changes over time
- **Team Comparison**: Compare multiple teams within organization
- **Action Items**: Convert recommendations to trackable tasks
- **Integrations**: Jira/Linear integration for action item sync

### Phase 3 Features:
- **Automated Evidence**: Integration with CI/CD tools to auto-verify answers
- **Custom Questions**: Allow adding organization-specific questions
- **Benchmarking**: Anonymous industry benchmarks
- **API Access**: Programmatic assessment creation

---

## 12. Success Metrics

### Usability Metrics:
- Assessment completion time: <20 minutes
- Assessment completion rate: >90%
- User satisfaction: >4/5 stars

### Adoption Metrics:
- Number of teams assessed (target: all teams within 3 months)
- Repeat assessments per team (target: quarterly)
- Recommendations implemented: >60% of critical gaps within 6 months

### Impact Metrics:
- Average maturity score improvement per quarter
- Deployment frequency increase
- Time to recovery decrease

---

## 13. Next Steps

1. ✅ **Review & Approve Spec** (This document)
2. **Finalize Questions** - Review all 20 questions with team
3. **Set Up Development Environment** - Clone repo, Docker setup
4. **Sprint Planning** - Break into 2-week sprints
5. **Start Development** - Begin Phase 1 (Foundation)

---

## Appendix A: Complete Question Bank (MVP)

See Section 2.2 for all 20 questions with scoring rubrics.

## Appendix B: Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) NOT NULL,
    assessor_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    overall_score FLOAT,
    maturity_level INTEGER,
    domain1_score FLOAT,
    domain2_score FLOAT,
    domain3_score FLOAT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    domain VARCHAR(50) NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, question_number)
);

CREATE INDEX idx_assessments_assessor ON assessments(assessor_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_responses_assessment ON responses(assessment_id);
```

---

## Document Control

**Version**: 2.0 (MVP Edition)  
**Date**: October 6, 2025  
**Status**: Ready for Development  
**Target**: Internal Team Tool  
**Timeline**: 6 weeks to MVP

---

*This MVP specification focuses on delivering immediate value with the 20 highest-impact DevOps questions. Domains 4 and 5 will be added in Phase 2 based on team feedback and priorities.*