# Design Document

## Overview

The DevOps Maturity Assessment Platform is a full-stack web application built with a React frontend and FastAPI backend, using PostgreSQL for data persistence. The system follows a three-tier architecture with clear separation between presentation, business logic, and data layers. The platform enables organizations to assess their DevOps maturity across 20 capability gates organized into 5 domains, providing scoring, visualization, and actionable recommendations.

The design leverages existing infrastructure (Docker Compose for local development) and builds upon the current MVP foundation to deliver a complete, production-ready assessment platform with comprehensive testing, security, and performance optimization.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│              (React 18 + TypeScript)                     │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Port 5173)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Assessment   │  │  Dashboard   │  │   Reports    │  │
│  │   Pages      │  │  & Results   │  │  Generator   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ React Query  │  │  Zustand     │                    │
│  │  (API Cache) │  │  (State)     │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │ REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Port 8000)                     │
│                   FastAPI + Python                       │
└─────────────────────────────────────────────────────────┘

                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   API Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Auth      │  │ Assessments  │  │   Reports    │  │
│  │  Endpoints   │  │  Endpoints   │  │  Endpoints   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Business Logic Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Security   │  │   Scoring    │  │    Report    │  │
│  │   Service    │  │   Engine     │  │   Generator  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  SQLAlchemy  │  │   Database   │  │    Redis     │  │
│  │     ORM      │  │   Session    │  │   (Cache)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Port 5432)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Organizations│  │    Users     │  │ Assessments  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ DomainScores │  │ GateResponses│                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.2 with TypeScript 5.2
- Vite 5.0 for build tooling
- Tailwind CSS 3.3 for styling
- React Router 6.20 for navigation
- React Query 5.12 for server state management
- React Hook Form 7.48 + Zod 3.22 for form validation
- Recharts 2.10 for data visualization
- Axios 1.6 for HTTP client

**Backend:**
- Python 3.11+
- FastAPI 0.115 for REST API
- SQLAlchemy 2.0 for ORM
- Alembic 1.12 for database migrations
- Pydantic 2.5 for data validation
- Python-JOSE 3.3 for JWT handling
- Passlib 1.7 + Bcrypt 4.0 for password hashing
- ReportLab 4.0 for PDF generation
- Uvicorn 0.30 as ASGI server

**Database & Infrastructure:**
- PostgreSQL 15 (primary database)
- Docker & Docker Compose for containerization
- Redis (to be added for caching)



## Components and Interfaces

### Frontend Components

#### 1. Authentication Components
- **LoginPage**: User login form with email/password
- **RegisterPage**: Organization and user registration
- **ProtectedRoute**: HOC for route protection
- **AuthContext**: React context for auth state management

#### 2. Dashboard Components
- **DashboardPage**: Main landing page after login
- **AssessmentList**: List of all assessments with status
- **AssessmentCard**: Individual assessment summary card
- **QuickStats**: Overview metrics (total assessments, avg score)

#### 3. Assessment Components
- **AssessmentWizard**: Multi-step form container
- **DomainStep**: Individual domain questionnaire
- **QuestionCard**: Single question with scoring rubric
- **ProgressIndicator**: Visual progress tracker (X of 20 gates)
- **NavigationControls**: Previous/Next/Save Draft buttons

#### 4. Results Components
- **ResultsPage**: Complete results view
- **ScoreHero**: Large overall score display
- **RadarChart**: 5-domain visualization
- **DomainBreakdown**: Domain cards with scores
- **StrengthsGaps**: Top 3 and bottom 3 gates
- **ComparisonView**: Historical comparison chart

#### 5. Report Components
- **ReportPage**: Report preview and download
- **ReportGenerator**: PDF generation trigger
- **ExportOptions**: CSV/JSON export controls

#### 6. Shared Components
- **Button**: Reusable button component
- **Input**: Form input with validation
- **Select**: Dropdown component
- **Card**: Container component
- **Modal**: Dialog component
- **Toast**: Notification component
- **Spinner**: Loading indicator

### Backend API Endpoints

#### Authentication Endpoints (`/api/auth`)
```python
POST   /api/auth/register          # Register new user and organization
POST   /api/auth/login             # Login and get JWT token
POST   /api/auth/refresh           # Refresh access token
GET    /api/auth/me                # Get current user profile
POST   /api/auth/logout            # Logout (invalidate token)
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with token
```

#### Organization Endpoints (`/api/organizations`)
```python
GET    /api/organizations/me       # Get current user's organization
PUT    /api/organizations/me       # Update organization details
GET    /api/organizations/users    # List organization users
POST   /api/organizations/invite   # Invite user to organization
DELETE /api/organizations/users/{id} # Remove user from organization
```

#### Assessment Endpoints (`/api/assessments`)
```python
GET    /api/assessments/           # List all assessments
POST   /api/assessments/           # Create new assessment
GET    /api/assessments/{id}       # Get assessment details
PUT    /api/assessments/{id}       # Update assessment metadata
DELETE /api/assessments/{id}       # Delete assessment
GET    /api/assessments/{id}/responses # Get all responses
POST   /api/assessments/{id}/responses # Save/update responses
POST   /api/assessments/{id}/submit    # Submit for scoring
GET    /api/assessments/{id}/results   # Get calculated results
```


#### Report Endpoints (`/api/reports`)
```python
GET    /api/reports/{assessment_id}/pdf    # Generate and download PDF
GET    /api/reports/{assessment_id}/csv    # Export as CSV
GET    /api/reports/{assessment_id}/json   # Export as JSON
```

#### Question Bank Endpoints (`/api/questions`)
```python
GET    /api/questions/                      # Get all questions
GET    /api/questions/domains               # Get domains structure
GET    /api/questions/gates/{gate_id}       # Get gate questions
```

### Backend Services

#### 1. Security Service (`app/core/security.py`)
```python
class SecurityService:
    def hash_password(password: str) -> str
    def verify_password(plain: str, hashed: str) -> bool
    def create_access_token(data: dict) -> str
    def create_refresh_token(data: dict) -> str
    def decode_token(token: str) -> dict
    def get_current_user(token: str) -> User
```

#### 2. Scoring Engine (`app/core/scoring.py`)
```python
class ScoringEngine:
    def calculate_gate_score(responses: List[Response]) -> float
    def calculate_domain_score(gate_scores: List[float]) -> float
    def calculate_overall_score(domain_scores: Dict[str, float]) -> float
    def determine_maturity_level(score: float) -> int
    def identify_strengths(gate_scores: Dict[str, float]) -> List[str]
    def identify_gaps(gate_scores: Dict[str, float]) -> List[str]
    def generate_recommendations(gaps: List[str]) -> List[str]
```

#### 3. Report Generator (`app/core/reports.py`)
```python
class ReportGenerator:
    def generate_pdf(assessment: Assessment) -> bytes
    def generate_csv(assessment: Assessment) -> str
    def generate_json(assessment: Assessment) -> dict
    def create_executive_summary(assessment: Assessment) -> str
    def create_domain_analysis(domain_scores: List[DomainScore]) -> str
    def create_recommendations_section(gaps: List[str]) -> str
```

#### 4. Question Bank Service (`app/core/questions.py`)
```python
class QuestionBankService:
    def get_all_questions() -> List[Question]
    def get_questions_by_domain(domain: str) -> List[Question]
    def get_questions_by_gate(gate_id: str) -> List[Question]
    def get_domain_structure() -> Dict[str, List[Gate]]
```

## Data Models

### Database Schema

#### Organization Table
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50) CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'assessor' CHECK (role IN ('admin', 'assessor', 'viewer')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
```


#### Assessment Table
```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    assessor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
    overall_score DECIMAL(5,2),
    maturity_level INTEGER CHECK (maturity_level BETWEEN 1 AND 5),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assessments_org ON assessments(organization_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_assessor ON assessments(assessor_id);
```

#### DomainScore Table
```sql
CREATE TABLE domain_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    domain_name VARCHAR(100) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    maturity_level INTEGER CHECK (maturity_level BETWEEN 1 AND 5),
    strengths TEXT[],
    gaps TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_domain_scores_assessment ON domain_scores(assessment_id);
```

#### GateResponse Table
```sql
CREATE TABLE gate_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    gate_id VARCHAR(50) NOT NULL,
    domain_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    answer VARCHAR(50) NOT NULL,
    score INTEGER CHECK (score BETWEEN 0 AND 5),
    notes TEXT,
    evidence TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assessment_id, question_id)
);

CREATE INDEX idx_gate_responses_assessment ON gate_responses(assessment_id);
CREATE INDEX idx_gate_responses_gate ON gate_responses(gate_id);
```

### SQLAlchemy Models

#### Organization Model
```python
class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    industry = Column(String(100))
    size = Column(Enum('small', 'medium', 'large', 'enterprise', name='org_size'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization")
    assessments = relationship("Assessment", back_populates="organization")
```

#### User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'assessor', 'viewer', name='user_role'), default='assessor')
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    assessments = relationship("Assessment", back_populates="assessor")
```


#### Assessment Model
```python
class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'))
    assessor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    team_name = Column(String(255), nullable=False)
    status = Column(Enum('draft', 'in_progress', 'completed', name='assessment_status'))
    overall_score = Column(Numeric(5, 2))
    maturity_level = Column(Integer)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="assessments")
    assessor = relationship("User", back_populates="assessments")
    domain_scores = relationship("DomainScore", back_populates="assessment")
    gate_responses = relationship("GateResponse", back_populates="assessment")
```

#### DomainScore Model
```python
class DomainScore(Base):
    __tablename__ = "domain_scores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey('assessments.id'))
    domain_name = Column(String(100), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    maturity_level = Column(Integer)
    strengths = Column(ARRAY(Text))
    gaps = Column(ARRAY(Text))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="domain_scores")
```

#### GateResponse Model
```python
class GateResponse(Base):
    __tablename__ = "gate_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey('assessments.id'))
    gate_id = Column(String(50), nullable=False)
    domain_id = Column(String(50), nullable=False)
    question_id = Column(String(50), nullable=False)
    answer = Column(String(50), nullable=False)
    score = Column(Integer, nullable=False)
    notes = Column(Text)
    evidence = Column(ARRAY(Text))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="gate_responses")
    
    __table_args__ = (
        UniqueConstraint('assessment_id', 'question_id', name='uq_assessment_question'),
    )
```

### Pydantic Schemas

#### Request Schemas
```python
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=8)
    organization_name: str
    industry: Optional[str] = None
    size: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AssessmentCreate(BaseModel):
    team_name: str

class ResponseSubmit(BaseModel):
    gate_id: str
    domain_id: str
    question_id: str
    answer: str
    score: int = Field(ge=0, le=5)
    notes: Optional[str] = None
    evidence: Optional[List[str]] = None
```


#### Response Schemas
```python
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssessmentResponse(BaseModel):
    id: UUID
    team_name: str
    status: str
    overall_score: Optional[float]
    maturity_level: Optional[int]
    started_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class DomainScoreResponse(BaseModel):
    domain_name: str
    score: float
    maturity_level: int
    strengths: List[str]
    gaps: List[str]
    
    class Config:
        from_attributes = True

class ResultsResponse(BaseModel):
    assessment: AssessmentResponse
    domain_scores: List[DomainScoreResponse]
    overall_score: float
    maturity_level: int
    top_strengths: List[str]
    priority_gaps: List[str]
    recommendations: List[str]
```

## Error Handling

### Error Response Format
All API errors will follow a consistent format:
```python
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
```

### HTTP Status Codes
- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors

### Exception Handlers
```python
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation Error", "message": str(exc)}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "message": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "message": "An unexpected error occurred"}
    )
```

### Frontend Error Handling
```typescript
// API client with error interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// React Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['assessments'],
  queryFn: fetchAssessments,
  onError: (error) => {
    toast.error(error.message);
  }
});
```



## Testing Strategy

### Backend Testing

#### 1. Unit Tests
- Test individual functions and methods in isolation
- Mock external dependencies (database, external APIs)
- Target: 80%+ code coverage
- Tools: pytest, pytest-mock

```python
# Example unit test
def test_calculate_gate_score():
    responses = [
        Response(score=5),
        Response(score=4),
        Response(score=3)
    ]
    engine = ScoringEngine()
    score = engine.calculate_gate_score(responses)
    assert score == 80.0  # (12/15) * 100
```

#### 2. Integration Tests
- Test API endpoints with test database
- Verify database operations
- Test authentication flows
- Tools: pytest, httpx, TestClient

```python
# Example integration test
def test_create_assessment(client, auth_headers):
    response = client.post(
        "/api/assessments/",
        json={"team_name": "Test Team"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["team_name"] == "Test Team"
```

#### 3. Database Tests
- Test migrations
- Verify constraints and relationships
- Test data integrity
- Tools: pytest, SQLAlchemy

### Frontend Testing

#### 1. Component Tests
- Test individual React components
- Mock API calls and context
- Verify rendering and user interactions
- Tools: Vitest, React Testing Library

```typescript
// Example component test
test('renders login form', () => {
  render(<LoginPage />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
});
```

#### 2. Integration Tests
- Test user flows across multiple components
- Verify routing and navigation
- Test form submissions
- Tools: Vitest, React Testing Library

#### 3. E2E Tests (Optional for MVP)
- Test complete user journeys
- Verify frontend-backend integration
- Tools: Playwright or Cypress

### Test Organization

```
backend/
├── tests/
│   ├── unit/
│   │   ├── test_security.py
│   │   ├── test_scoring.py
│   │   └── test_reports.py
│   ├── integration/
│   │   ├── test_auth_api.py
│   │   ├── test_assessments_api.py
│   │   └── test_reports_api.py
│   └── conftest.py  # Shared fixtures

frontend/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── LoginPage.test.tsx
│   │       └── AssessmentWizard.test.tsx
│   └── services/
│       └── __tests__/
│           └── api.test.ts
```

### CI/CD Testing Pipeline

```yaml
# GitHub Actions workflow
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run backend tests
        run: |
          cd backend
          poetry install
          poetry run pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run frontend tests
        run: |
          cd frontend
          npm ci
          npm run test -- --coverage
```



## Security Design

### Authentication Flow

```
1. User Registration:
   Client → POST /api/auth/register → Server
   Server creates user + organization → Returns JWT tokens

2. User Login:
   Client → POST /api/auth/login → Server
   Server verifies credentials → Returns access + refresh tokens

3. Authenticated Request:
   Client → GET /api/assessments/ (with Bearer token) → Server
   Server validates JWT → Returns data

4. Token Refresh:
   Client → POST /api/auth/refresh (with refresh token) → Server
   Server validates refresh token → Returns new access token
```

### JWT Token Structure

**Access Token** (short-lived, 30 minutes):
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "assessor",
  "org_id": "organization_id",
  "exp": 1234567890,
  "type": "access"
}
```

**Refresh Token** (long-lived, 7 days):
```json
{
  "sub": "user_id",
  "exp": 1234567890,
  "type": "refresh"
}
```

### Password Security
- Minimum 8 characters
- Hashed using bcrypt with salt rounds = 12
- Never stored or logged in plain text
- Password reset via secure token (expires in 1 hour)

### API Security Measures

1. **Rate Limiting**
   - 100 requests per minute per IP
   - 1000 requests per hour per user
   - Implemented using middleware

2. **Input Validation**
   - Pydantic schemas for all inputs
   - SQL injection prevention via ORM
   - XSS prevention via output encoding

3. **CORS Configuration**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],  # Frontend URL
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **HTTPS Enforcement**
   - All production traffic over HTTPS
   - Secure cookie flags (HttpOnly, Secure, SameSite)

5. **SQL Injection Prevention**
   - SQLAlchemy ORM with parameterized queries
   - No raw SQL execution with user input

### Authorization

Role-based access control (RBAC):

| Role     | Permissions                                      |
|----------|--------------------------------------------------|
| Admin    | Full access to organization data, user management|
| Assessor | Create/edit assessments, view results           |
| Viewer   | View assessments and results (read-only)        |

```python
# Dependency for role checking
def require_role(required_role: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Usage in endpoint
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(require_role('admin'))
):
    # Only admins can delete users
    pass
```

## Performance Optimization

### Backend Optimization

1. **Database Query Optimization**
   - Use eager loading for relationships
   - Implement pagination for list endpoints
   - Add database indexes on frequently queried columns

```python
# Eager loading example
assessment = db.query(Assessment)\
    .options(joinedload(Assessment.domain_scores))\
    .options(joinedload(Assessment.gate_responses))\
    .filter(Assessment.id == assessment_id)\
    .first()
```

2. **Caching Strategy**
   - Cache question bank (rarely changes)
   - Cache user sessions
   - Cache computed results for completed assessments

```python
# Redis caching example
@cache(expire=3600)  # Cache for 1 hour
def get_question_bank():
    return QuestionBankService.get_all_questions()
```

3. **Async Operations**
   - Use async/await for I/O operations
   - Background tasks for PDF generation

```python
from fastapi import BackgroundTasks

@router.get("/reports/{assessment_id}/pdf")
async def generate_report(
    assessment_id: UUID,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(generate_pdf_async, assessment_id)
    return {"message": "Report generation started"}
```



### Frontend Optimization

1. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for heavy components

```typescript
// Lazy loading routes
const AssessmentWizard = lazy(() => import('./pages/AssessmentWizard'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
```

2. **React Query Caching**
   - Cache API responses
   - Stale-while-revalidate strategy
   - Optimistic updates

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

3. **Asset Optimization**
   - Minification and tree-shaking (Vite)
   - Image optimization
   - CDN for static assets (production)

4. **Memoization**
   - Use React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for stable function references

### Performance Targets

| Metric                    | Target    |
|---------------------------|-----------|
| Page Load Time            | < 2s      |
| Time to Interactive       | < 3s      |
| API Response Time (p95)   | < 500ms   |
| Assessment Submission     | < 3s      |
| PDF Generation            | < 5s      |
| Lighthouse Performance    | > 90      |

## Deployment Architecture

### Development Environment
```
Docker Compose:
- PostgreSQL container
- Backend container (hot reload)
- Frontend container (Vite dev server)
```

### Production Environment (Recommended)

**Option 1: Cloud PaaS (Heroku, Railway, Fly.io)**
```
- Frontend: Static hosting (Vercel, Netlify)
- Backend: Container deployment
- Database: Managed PostgreSQL
- Redis: Managed Redis instance
```

**Option 2: Kubernetes**
```
- Frontend: Nginx container serving static files
- Backend: FastAPI containers (3+ replicas)
- Database: StatefulSet or managed service
- Redis: StatefulSet or managed service
- Ingress: NGINX Ingress Controller
- TLS: cert-manager with Let's Encrypt
```

### Environment Variables

**Backend (.env)**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379/0
SECRET_KEY=<random-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://app.example.com
ENVIRONMENT=production
LOG_LEVEL=INFO
```

**Frontend (.env)**
```bash
VITE_API_URL=https://api.example.com
VITE_ENVIRONMENT=production
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Monitoring and Logging

1. **Application Logging**
   - Structured JSON logs
   - Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
   - Centralized logging (CloudWatch, Datadog, etc.)

2. **Health Checks**
   ```python
   @app.get("/health")
   async def health_check():
       return {
           "status": "healthy",
           "database": check_database_connection(),
           "redis": check_redis_connection()
       }
   ```

3. **Metrics**
   - Request count and latency
   - Error rates
   - Database query performance
   - Active users

## Question Bank Structure

### Domain and Gate Organization

```python
QUESTION_BANK = {
    "source_control": {
        "name": "Source Control & Development Practices",
        "weight": 0.15,
        "gates": {
            "1.1": {
                "name": "Version Control & Git Strategy",
                "questions": [
                    {
                        "id": "q1.1.1",
                        "text": "What version control system does your organization use?",
                        "type": "single_choice",
                        "options": [
                            {"value": "none", "label": "No version control", "score": 0},
                            {"value": "centralized", "label": "Centralized VCS (SVN, CVS)", "score": 1},
                            {"value": "git_basic", "label": "Git with basic usage", "score": 2},
                            {"value": "git_branching", "label": "Git with defined branching strategy", "score": 4},
                            {"value": "git_trunk", "label": "Git with trunk-based development", "score": 5}
                        ]
                    },
                    # More questions...
                ]
            },
            # More gates...
        }
    },
    # More domains...
}
```

This structure will be stored as a Python constant or JSON file and loaded by the QuestionBankService.



## UI/UX Design Patterns

### Design System

**Color Palette:**
- Primary: Blue (#3B82F6) - Trust, professionalism
- Success: Green (#10B981) - Positive scores, strengths
- Warning: Yellow (#F59E0B) - Areas for improvement
- Danger: Red (#EF4444) - Critical gaps
- Neutral: Gray scale for text and backgrounds

**Typography:**
- Headings: Inter font family, bold
- Body: Inter font family, regular
- Code: Fira Code (monospace)

**Spacing:**
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

### Key UI Patterns

#### 1. Assessment Wizard
- Multi-step form with progress indicator
- Sticky navigation bar
- Auto-save on field blur
- Visual feedback for completed sections

#### 2. Results Dashboard
- Card-based layout
- Responsive grid system
- Interactive charts with tooltips
- Color-coded maturity levels

#### 3. Radar Chart
```typescript
// Recharts configuration
<RadarChart data={domainScores}>
  <PolarGrid />
  <PolarAngleAxis dataKey="domain" />
  <PolarRadiusAxis angle={90} domain={[0, 100]} />
  <Radar
    name="Score"
    dataKey="score"
    stroke="#3B82F6"
    fill="#3B82F6"
    fillOpacity={0.6}
  />
</RadarChart>
```

#### 4. Maturity Level Badge
```typescript
const MaturityBadge = ({ level }: { level: number }) => {
  const colors = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-blue-100 text-blue-800',
    5: 'bg-green-100 text-green-800',
  };
  
  const labels = {
    1: 'Initial',
    2: 'Developing',
    3: 'Defined',
    4: 'Managed',
    5: 'Optimizing',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[level]}`}>
      Level {level}: {labels[level]}
    </span>
  );
};
```

### Accessibility Considerations

1. **Keyboard Navigation**
   - All interactive elements accessible via Tab
   - Skip links for main content
   - Focus indicators visible

2. **Screen Reader Support**
   - Semantic HTML elements
   - ARIA labels for complex components
   - Alt text for images and charts

3. **Color Contrast**
   - WCAG AA compliance (4.5:1 for normal text)
   - Don't rely solely on color for information

4. **Form Accessibility**
   - Labels associated with inputs
   - Error messages announced to screen readers
   - Required fields clearly marked

## Data Flow Diagrams

### Assessment Creation Flow

```
User → Click "New Assessment"
  ↓
Frontend → POST /api/assessments/ {team_name}
  ↓
Backend → Create Assessment record (status: draft)
  ↓
Backend → Return Assessment ID
  ↓
Frontend → Navigate to /assessments/{id}/edit
  ↓
Frontend → Load questions from /api/questions/
  ↓
User → Answer questions
  ↓
Frontend → POST /api/assessments/{id}/responses (auto-save)
  ↓
Backend → Upsert GateResponse records
  ↓
User → Click "Submit Assessment"
  ↓
Frontend → POST /api/assessments/{id}/submit
  ↓
Backend → Calculate scores (ScoringEngine)
  ↓
Backend → Update Assessment (status: completed, scores)
  ↓
Backend → Create DomainScore records
  ↓
Frontend → Navigate to /assessments/{id}/results
```

### Report Generation Flow

```
User → Click "Download Report"
  ↓
Frontend → GET /api/reports/{id}/pdf
  ↓
Backend → Fetch Assessment + Scores + Responses
  ↓
Backend → ReportGenerator.generate_pdf()
  ↓
Backend → Create PDF with ReportLab
  ↓
Backend → Return PDF bytes (Content-Type: application/pdf)
  ↓
Frontend → Trigger browser download
```

## Migration Strategy

### Phase 1: Foundation (Current → Complete MVP)
1. Complete database schema and migrations
2. Implement all authentication endpoints
3. Build question bank with all 20 gates
4. Complete CRUD operations for assessments

### Phase 2: Core Features
1. Implement scoring engine
2. Build assessment wizard UI
3. Create results dashboard
4. Implement PDF report generation

### Phase 3: Testing & Polish
1. Write comprehensive test suite
2. Implement error handling
3. Add loading states and optimistic updates
4. Performance optimization

### Phase 4: Production Readiness
1. Security audit
2. Load testing
3. Documentation
4. Deployment setup

## Design Decisions and Rationale

### Why FastAPI?
- Modern, fast Python framework
- Automatic API documentation (OpenAPI)
- Built-in data validation with Pydantic
- Async support for better performance
- Type hints for better IDE support

### Why React Query?
- Simplifies server state management
- Built-in caching and refetching
- Optimistic updates support
- Reduces boilerplate code
- Better developer experience

### Why PostgreSQL?
- Robust relational database
- ACID compliance for data integrity
- JSON support for flexible data
- Excellent performance
- Wide ecosystem support

### Why Docker Compose?
- Consistent development environment
- Easy service orchestration
- Simplified onboarding for new developers
- Production-like local setup

### Why Tailwind CSS?
- Utility-first approach for rapid development
- Consistent design system
- Small production bundle size
- No CSS naming conflicts
- Excellent documentation

This design document provides a comprehensive blueprint for implementing the DevOps Maturity Assessment Platform, ensuring consistency, maintainability, and scalability throughout the development process.
