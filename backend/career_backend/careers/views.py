import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import CareerPath


# ---------------------------------------------------------------------------
# Career Plan View  (resume-driven)
# ---------------------------------------------------------------------------

def _extract_resume_text(file_field):
    """Extract plain text from PDF/DOCX resume file."""
    name = file_field.name.lower()
    try:
        file_field.seek(0)
        raw = file_field.read()
    except Exception:
        return ""

    if name.endswith('.pdf'):
        try:
            import PyPDF2, io
            reader = PyPDF2.PdfReader(io.BytesIO(raw))
            return " ".join((p.extract_text() or "") for p in reader.pages)
        except Exception:
            pass

    if name.endswith(('.docx', '.doc')):
        try:
            import docx, io
            doc = docx.Document(io.BytesIO(raw))
            return " ".join(p.text for p in doc.paragraphs)
        except Exception:
            pass

    try:
        return raw.decode('utf-8', errors='ignore')
    except Exception:
        return ""


def _skill_present(skill, text_lower):
    """Whole-word match of a skill in the resume text."""
    return bool(re.search(
        r'(?<![a-z0-9+#._-])' + re.escape(skill.lower()) + r'(?![a-z0-9+#._-])',
        text_lower
    ))


# Six-month milestone templates keyed by broad domain keywords
_MILESTONES = {
    'python': [
        "Month 1-2: Strengthen Python fundamentals — OOP, decorators, comprehensions",
        "Month 2-3: Master a web framework (Django or FastAPI) — build a REST API project",
        "Month 3-4: Learn databases (PostgreSQL/MySQL) and ORM patterns",
        "Month 4-5: Deploy a full project to cloud (Heroku/AWS/GCP) with CI/CD",
        "Month 5-6: Contribute to open-source Python projects and build your portfolio",
    ],
    'react': [
        "Month 1-2: Deep-dive React hooks, state management (Context API / Redux Toolkit)",
        "Month 2-3: Learn TypeScript fundamentals and apply it to React projects",
        "Month 3-4: Build a full-stack app with React + REST/GraphQL backend",
        "Month 4-5: Master testing (Jest, React Testing Library) and CI integration",
        "Month 5-6: Optimize performance (code splitting, lazy loading) and deploy to Vercel/Netlify",
    ],
    'machine learning': [
        "Month 1-2: Solidify statistics, linear algebra, and Python (NumPy, Pandas)",
        "Month 2-3: Implement core ML algorithms from scratch; use scikit-learn on real datasets",
        "Month 3-4: Learn deep learning fundamentals — PyTorch or TensorFlow/Keras",
        "Month 4-5: Complete an end-to-end ML project (data → model → API → deployment)",
        "Month 5-6: Study MLOps basics (model versioning, monitoring) and publish on GitHub",
    ],
    'data': [
        "Month 1-2: Master SQL (CTEs, window functions) and data wrangling with Pandas",
        "Month 2-3: Learn data visualization (Matplotlib, Seaborn, Plotly / Tableau)",
        "Month 3-4: Study statistical analysis and A/B testing fundamentals",
        "Month 4-5: Build end-to-end data pipelines (ETL) with Airflow or dbt",
        "Month 5-6: Create a portfolio of 3 analytical case studies and publish insights",
    ],
    'java': [
        "Month 1-2: Master Java 17+ features, Spring Boot basics, REST API development",
        "Month 2-3: Learn microservices patterns (API Gateway, service discovery)",
        "Month 3-4: Study databases (JPA/Hibernate, PostgreSQL) and caching (Redis)",
        "Month 4-5: Implement security (Spring Security / JWT) and containerization (Docker)",
        "Month 5-6: Deploy a microservices app on Kubernetes and set up monitoring",
    ],
    'cloud': [
        "Month 1-2: Earn AWS/Azure/GCP fundamentals certification",
        "Month 2-3: Learn Infrastructure as Code (Terraform / CloudFormation)",
        "Month 3-4: Master containerization (Docker) and orchestration (Kubernetes)",
        "Month 4-5: Implement CI/CD pipelines with GitHub Actions / Jenkins",
        "Month 5-6: Design and deploy a highly-available, scalable cloud-native application",
    ],
    'default': [
        "Month 1-2: Audit current skills and identify the top 3 gaps to address",
        "Month 2-3: Complete an online course or certification in your primary skill area",
        "Month 3-4: Build a real project that demonstrates your target skill set",
        "Month 4-5: Get feedback via code review, mentorship, or a freelance project",
        "Month 5-6: Update portfolio and LinkedIn; apply to 5+ relevant positions",
    ],
}


def _get_milestones(skills):
    """Return the most relevant milestone template based on resume skills."""
    for key in _MILESTONES:
        if key == 'default':
            continue
        if any(key in s.lower() for s in skills):
            return _MILESTONES[key]
    return _MILESTONES['default']


class CareerPlanView(APIView):
    """
    GET /api/careers/plan/

    Generates a personalised career plan by:
      1. Reading the user's most recent resume file
      2. Extracting skills from the text
      3. Scoring each CareerPath by how many of its skills_needed appear in the resume
      4. Returning top matched paths + skill gap analysis + 6-month milestone roadmap
    """
    permission_classes = [IsAuthenticated]
    TOP_PATHS = 3

    def get(self, request):
        from resumes.models import Resume

        # 1. Get latest resume
        resume = Resume.objects.filter(user=request.user).first()
        if not resume:
            return Response({
                'has_resume': False,
                'message': 'Upload a resume first to generate your career plan.',
            })

        # 2. Extract text
        resume_lower = _extract_resume_text(resume.file).lower()
        if not resume_lower.strip():
            return Response({
                'has_resume': True,
                'message': 'Could not read resume text. Please upload a text-based PDF or DOCX.',
            })

        # 3. Collect all skills present in the resume
        all_path_skills = set()
        for path in CareerPath.objects.all():
            if path.skills_needed:
                for s in path.skills_needed.split(','):
                    all_path_skills.add(s.strip())

        current_skills = [s for s in all_path_skills if _skill_present(s, resume_lower)]

        # 4. Score each CareerPath
        scored_paths = []
        for path in CareerPath.objects.all():
            if not (path.skills_needed or '').strip():
                continue
            needed  = [s.strip() for s in path.skills_needed.split(',') if s.strip()]
            matched = [s for s in needed if _skill_present(s, resume_lower)]
            missing = [s for s in needed if s not in matched]
            if not needed:
                continue
            score = round(len(matched) / len(needed) * 100)
            scored_paths.append({
                'id':             path.id,
                'title':          path.title,
                'description':    path.description or '',
                'icon':           path.icon or '💼',
                'avg_salary':     path.avg_salary or '',
                'growth_rate':    path.growth_rate or '',
                'match_score':    score,
                'matched_skills': matched,
                'missing_skills': missing,
                'total_skills':   len(needed),
            })

        scored_paths.sort(key=lambda x: x['match_score'], reverse=True)
        top_paths = scored_paths[:self.TOP_PATHS]

        # 5. Skills to develop (union of missing from top paths)
        skills_to_learn = []
        seen = set()
        for p in top_paths:
            for s in p['missing_skills']:
                if s.lower() not in seen:
                    skills_to_learn.append(s)
                    seen.add(s.lower())

        # 6. Pick milestones based on current skills
        milestones = _get_milestones(current_skills)

        return Response({
            'has_resume':      True,
            'resume_title':    resume.title or resume.file.name.split('/')[-1],
            'current_skills':  sorted(current_skills),
            'top_paths':       top_paths,
            'skills_to_learn': skills_to_learn[:12],
            'milestones':      milestones,
            'skill_score':     round(len(current_skills) / max(len(all_path_skills), 1) * 100),
        })
