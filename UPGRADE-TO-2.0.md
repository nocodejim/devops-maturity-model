# Upgrade Guide: v1.x → v2.0 (Multi-Framework Architecture)

**Target Audience:** Systems running v1.0, v1.1, v1.2.x or any pre-2.0 version

**Breaking Changes:** v2.0 introduces multi-framework architecture with database schema changes that are incompatible with v1.x data structures.

**WARNING: This upgrade will destroy all existing assessment data. Backup if needed.**

---

## What's New in v2.0

### Multi-Framework Architecture
- Dynamic framework loading from database
- Support for multiple assessment types
- UUID-based question identification

### Two Frameworks Available
1. **DevOps Maturity MVP Framework** (100 questions)
   - Technical implementation assessment
   - 5 domains: Security, CI/CD, Infrastructure, Source Control, Observability
   - Same questions as v1.x but now database-driven

2. **CALMS DevOps Framework** (28 questions) - NEW!
   - Organizational readiness assessment
   - 5 domains: Culture (25%), Automation (25%), Lean (15%), Measurement (20%), Sharing (15%)
   - Lightweight 90-minute assessment for executives

### Database Schema Changes
- New tables: `frameworks`, `framework_domains`, `framework_gates`, `framework_questions`
- Assessments now require `framework_id` foreign key
- Questions identified by UUID instead of hardcoded IDs
- Old `gates` API endpoint deprecated (returns 0/0 for backward compatibility)

---

## Upgrade Path

### Prerequisites
- Docker and docker-compose installed
- Access to server running v1.x
- Backup of existing data (if needed)
- Updated `docker-compose.deploy.yml` with v2.0 image tags

---

### Manual Upgrade Steps

#### Step 1: Stop Old Containers
```bash
docker-compose -f docker-compose.deploy.yml down
```

#### Step 2: Remove Old Database Volume
**WARNING: This destroys all data**
```bash
docker volume rm devops-maturity-model_postgres_data
```

If volume has a different name, list volumes first:
```bash
docker volume ls | grep postgres
docker volume rm <volume-name>
```

#### Step 3: Pull New v2.0 Images
```bash
docker pull buckeye90/devops-maturity-backend:2.0
docker pull buckeye90/devops-maturity-frontend:2.0
```

#### Step 4: Update docker-compose.deploy.yml
Ensure your deployment file references v2.0 images:
```yaml
services:
  backend:
    image: buckeye90/devops-maturity-backend:2.0
    # ... rest of config

  frontend:
    image: buckeye90/devops-maturity-frontend:2.0
    # ... rest of config
```

#### Step 5: Start New Containers
```bash
docker-compose -f docker-compose.deploy.yml up -d
```

#### Step 6: Run Database Migrations
Wait for database to be healthy (~10 seconds), then:
```bash
docker-compose -f docker-compose.deploy.yml exec backend alembic upgrade head
```

You should see output indicating migrations ran successfully.

#### Step 7: Seed MVP Framework (Required)
This creates the same technical assessment framework from v1.x:
```bash
docker-compose -f docker-compose.deploy.yml exec backend python -m app.scripts.seed_frameworks
```

Expected output:
```
✅ Successfully seeded DevOps Maturity MVP Framework
   - Domains: 5
   - Gates: 20
   - Questions: 100
```

#### Step 8: Seed CALMS Framework (Optional)
Add the new organizational readiness assessment:
```bash
docker-compose -f docker-compose.deploy.yml exec backend python -m app.scripts.seed_calms_framework
```

Expected output:
```
✅ Successfully seeded CALMS DevOps Framework
   - Domains: 5 (Culture 25%, Automation 25%, Lean 15%, Measurement 20%, Sharing 15%)
   - Questions: 28 total (6+6+5+6+5)
   - Estimated completion time: 90 minutes
```

#### Step 9: Create Admin User and Organization
```bash
docker-compose -f docker-compose.deploy.yml exec backend python -c "
from app.database import SessionLocal
from app.models import User, Organization
from app.core.security import get_password_hash
from app.models.user import Role

db = SessionLocal()

# Create organization
org = Organization(
    name='Default Organization',
    size='MEDIUM',
    industry='Technology'
)
db.add(org)
db.flush()

# Create admin user
admin = User(
    email='admin@example.com',
    full_name='Admin User',
    hashed_password=get_password_hash('admin123'),
    role=Role.ADMIN,
    organization_id=org.id
)
db.add(admin)
db.commit()
print('✅ Admin user created: admin@example.com / admin123')
"
```

**IMPORTANT:** Change the default password after first login!

#### Step 10: Verify Installation
Check that frameworks are seeded correctly:
```bash
docker-compose -f docker-compose.deploy.yml exec backend python -c "
from app.database import SessionLocal
from app.models import Framework
db = SessionLocal()
frameworks = db.query(Framework).all()
for fw in frameworks:
    print(f'✅ {fw.name} (v{fw.version})')
"
```

Expected output:
```
✅ DevOps Maturity MVP Framework (v1.0)
✅ CALMS DevOps Framework (v1.0)
```

#### Step 11: Access Application
- **Frontend:** http://your-server:8673
- **Backend API Docs:** http://your-server:8680/docs
- **Login:** admin@example.com / admin123

---

## Automated Upgrade Script

For convenience, here's a script that performs the entire upgrade:

### upgrade-to-2.0.sh
```bash
#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  DevOps Maturity Assessment Platform - Upgrade to v2.0   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚨 WARNING: This will destroy all existing data!"
echo ""
read -p "Continue with upgrade? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "📦 Step 1/10: Pulling v2.0 images..."
docker pull buckeye90/devops-maturity-backend:2.0
docker pull buckeye90/devops-maturity-frontend:2.0

echo ""
echo "🛑 Step 2/10: Stopping old containers..."
docker-compose -f docker-compose.deploy.yml down

echo ""
echo "🗑️  Step 3/10: Removing old database volume..."
docker volume rm devops-maturity-model_postgres_data 2>/dev/null || \
  echo "   (No volume to remove or already removed)"

echo ""
echo "🚀 Step 4/10: Starting v2.0 containers..."
docker-compose -f docker-compose.deploy.yml up -d

echo ""
echo "⏳ Step 5/10: Waiting for database to be ready..."
sleep 15
echo "   Checking database health..."
docker-compose -f docker-compose.deploy.yml exec backend python -c "
from app.database import SessionLocal
db = SessionLocal()
print('✅ Database connection successful')
"

echo ""
echo "🔄 Step 6/10: Running database migrations..."
docker-compose -f docker-compose.deploy.yml exec -T backend alembic upgrade head

echo ""
echo "🌱 Step 7/10: Seeding MVP Framework (100 questions)..."
docker-compose -f docker-compose.deploy.yml exec -T backend python -m app.scripts.seed_frameworks

echo ""
echo "🌱 Step 8/10: Seeding CALMS Framework (28 questions)..."
docker-compose -f docker-compose.deploy.yml exec -T backend python -m app.scripts.seed_calms_framework

echo ""
echo "👤 Step 9/10: Creating default admin user..."
docker-compose -f docker-compose.deploy.yml exec -T backend python -c "
from app.database import SessionLocal
from app.models import User, Organization
from app.core.security import get_password_hash
from app.models.user import Role

db = SessionLocal()

# Create organization
org = Organization(
    name='Default Organization',
    size='MEDIUM',
    industry='Technology'
)
db.add(org)
db.flush()

# Create admin user
admin = User(
    email='admin@example.com',
    full_name='Admin User',
    hashed_password=get_password_hash('admin123'),
    role=Role.ADMIN,
    organization_id=org.id
)
db.add(admin)
db.commit()
print('✅ Admin user created')
"

echo ""
echo "✅ Step 10/10: Verifying frameworks..."
docker-compose -f docker-compose.deploy.yml exec -T backend python -c "
from app.database import SessionLocal
from app.models import Framework
db = SessionLocal()
frameworks = db.query(Framework).all()
for fw in frameworks:
    print(f'   ✅ {fw.name} (v{fw.version})')
"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Upgrade Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Frontend: http://localhost:8673"
echo "🔌 Backend API: http://localhost:8680"
echo "📚 API Docs: http://localhost:8680/docs"
echo ""
echo "🔑 Default Login Credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the default password after first login!"
echo ""
```

### Usage
```bash
# Download or create the script
chmod +x upgrade-to-2.0.sh
./upgrade-to-2.0.sh
```

---

## Rollback (If Needed)

If you need to rollback to v1.x:

1. Stop v2.0 containers:
   ```bash
   docker-compose -f docker-compose.deploy.yml down
   ```

2. Remove v2.0 database:
   ```bash
   docker volume rm devops-maturity-model_postgres_data
   ```

3. Update `docker-compose.deploy.yml` to use v1.x images:
   ```yaml
   backend:
     image: buckeye90/devops-maturity-backend:1.2.1
   frontend:
     image: buckeye90/devops-maturity-frontend:1.2.1
   ```

4. Start v1.x containers and restore backup data (if available)

---

## Troubleshooting

### Issue: "CALMS Framework already exists"
If you run the CALMS seed script twice, you'll see this message. This is safe to ignore, or you can delete and recreate:
```bash
docker-compose -f docker-compose.deploy.yml exec backend python -c "
from app.database import SessionLocal
from app.models import Framework, Assessment
db = SessionLocal()
fw = db.query(Framework).filter(Framework.name == 'CALMS DevOps Framework').first()
if fw:
    # Delete any assessments using this framework
    db.query(Assessment).filter(Assessment.framework_id == fw.id).delete()
    db.delete(fw)
    db.commit()
    print('Deleted CALMS framework')
"
# Then re-run seed script
docker-compose -f docker-compose.deploy.yml exec backend python -m app.scripts.seed_calms_framework
```

### Issue: "No frameworks available" in frontend
This means frameworks weren't seeded. Run both seed scripts:
```bash
docker-compose -f docker-compose.deploy.yml exec backend python -m app.scripts.seed_frameworks
docker-compose -f docker-compose.deploy.yml exec backend python -m app.scripts.seed_calms_framework
```

### Issue: Login fails with "incorrect email or password"
Admin user wasn't created. Re-run Step 9 above.

### Issue: Database connection errors
Ensure PostgreSQL container is healthy:
```bash
docker-compose -f docker-compose.deploy.yml ps
docker-compose -f docker-compose.deploy.yml logs postgres
```

Wait 15-30 seconds after startup, then retry migrations.

---

## Migration Notes

### Data Loss
v2.0 schema is incompatible with v1.x. There is no automated data migration path. All assessments, users, and organizations must be recreated.

### Why No Data Migration?
The multi-framework architecture fundamentally changes how questions are stored and referenced:
- v1.x: Questions hardcoded in frontend/backend with string IDs ("q1", "q2")
- v2.0: Questions stored in database with UUID primary keys

Mapping old assessment responses to new question UUIDs would require:
1. Identifying which framework the old assessment used (all were MVP in v1.x)
2. Mapping old question IDs to new UUIDs
3. Converting response format
4. High risk of data corruption

For production deployments with valuable data, export assessments before upgrading.

---

## Future Upgrades

For future upgrades (v2.0 → v2.1, etc.), we will provide:
- Database migration scripts that preserve data
- Backward-compatible API changes
- Documented deprecation timelines

v2.0 is a one-time breaking change to enable the multi-framework architecture. Future versions will maintain compatibility.

---

## Questions or Issues?

- **GitHub Issues:** https://github.com/anthropics/claude-code/issues
- **Documentation:** See `docs/` folder in repository

---

**Document Version:** 1.0
**Last Updated:** 2025-11-28
**Applies To:** v1.0, v1.1, v1.2.x → v2.0 upgrades
