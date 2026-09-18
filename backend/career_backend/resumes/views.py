import re
import os

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resume
from .serializers import ResumeSerializer
from jobs.models import Job
from jobs.serializers import JobSerializer


# ===========================================================================
# Standard CRUD views
# ===========================================================================

class ResumeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/resumes/   — list all resumes for the logged-in user
    POST /api/resumes/   — upload a new resume (multipart/form-data)
    """
    serializer_class   = ResumeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        file  = self.request.data.get('file')
        # Use the *original* uploaded filename — not the temp path on disk
        original_name = getattr(file, 'name', '') or ''
        original_name = os.path.basename(original_name)  # strip any path prefix

        title = (self.request.data.get('title') or '').strip()
        if not title:
            title = original_name or 'My Resume'

        serializer.save(user=self.request.user, title=title, status='uploaded')


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/resumes/<id>/  — get a specific resume
    DELETE /api/resumes/<id>/  — delete a resume
    """
    serializer_class   = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class ResumeStatusView(APIView):
    """
    GET /api/resumes/status/
    Returns a quick status summary: { has_resume, status, count }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        resumes = Resume.objects.filter(user=request.user)
        latest  = resumes.first()
        return Response({
            'has_resume': resumes.exists(),
            'status':     latest.status if latest else 'none',
            'count':      resumes.count(),
        })


# ===========================================================================
# Resume text extraction
# ===========================================================================

def _extract_text(file_field):
    """Return plain text from a PDF / DOCX resume. Falls back to raw UTF-8."""
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


# ===========================================================================
# Matching helpers
# ===========================================================================

# Words that are too generic to describe a job DOMAIN.
# Stripped from the job title before the domain-gate check.
_GENERIC_TITLE_WORDS = {
    'senior', 'junior', 'lead', 'principal', 'staff', 'chief', 'head',
    'associate', 'intern', 'trainee', 'executive',
    'engineer', 'developer', 'programmer', 'analyst', 'manager',
    'architect', 'specialist', 'consultant', 'officer', 'director',
    'coordinator', 'advisor', 'expert', 'professional', 'technician',
    'full', 'stack', 'back', 'front', 'end', 'web', 'mobile', 'digital',
    'remote', 'hybrid', 'onsite', 'role', 'team', 'position', 'job',
    'and', 'the', 'for', 'with', 'of', 'in', 'at',
}


def _word_present(word, text):
    """True if `word` appears as a whole word in `text` (already lower-cased)."""
    return bool(re.search(
        r'(?<![a-z0-9])' + re.escape(word) + r'(?![a-z0-9])',
        text
    ))


def _domain_gate(resume_lower, job_title):
    """
    Gate 3 — Domain title check.

    Strips generic words from the job title to get DOMAIN words, then
    requires at least one domain word to appear in the resume text.

    "Cyber Security Engineer"   → domain: ['cyber', 'security']
    "Python Backend Developer"  → domain: ['python', 'backend']
    "Machine Learning Engineer" → domain: ['machine', 'learning']
    "Senior React Developer"    → domain: ['react']

    If no domain words survive filtering, the gate passes (no false-negative).
    """
    words = re.findall(r'[a-zA-Z]+', job_title.lower())
    domain = [w for w in words if w not in _GENERIC_TITLE_WORDS and len(w) > 2]

    if not domain:
        return True   # nothing meaningful to check → allow

    return any(_word_present(w, resume_lower) for w in domain)


def _skill_gate(resume_lower, job):
    """
    Gate 1 + Gate 2 — Skill score & absolute count.

    Parses `job.skills_required` as a comma-separated list and checks each
    skill as an exact whole-word / whole-phrase against the resume text.

    Returns:
        score         int   0-100   % of required skills found
        matched       list[str]     skills present in resume
        missing       list[str]     skills absent from resume
        total         int           total required skills
    """
    if not (job.skills_required or "").strip():
        return 0, [], [], 0

    skills = [s.strip().lower() for s in job.skills_required.split(',') if s.strip()]
    if not skills:
        return 0, [], [], 0

    matched, missing = [], []
    for skill in skills:
        pattern = r'(?<![a-z0-9+#._-])' + re.escape(skill) + r'(?![a-z0-9+#._-])'
        (matched if re.search(pattern, resume_lower) else missing).append(skill)

    score = round(len(matched) / len(skills) * 100)
    return score, matched, missing, len(skills)


# ===========================================================================
# ResumeAnalyzeView  —  three-gate matching
# ===========================================================================

class ResumeAnalyzeView(APIView):
    """
    GET /api/resumes/<id>/analyze/

    Three-gate algorithm:
      Gate 1  Skill score    ≥ MIN_SKILL_SCORE % of required skills present
      Gate 2  Absolute count ≥ MIN_MATCHED_COUNT skills must match
      Gate 3  Domain title   ≥ 1 domain word from job title in resume

    All three gates must pass for a job to appear in recommendations.
    This prevents e.g. a "Cyber Security Engineer" job from appearing in
    a Python/React developer's recommendations just because Python is listed
    as one of many required skills.
    """
    permission_classes = [IsAuthenticated]
    TOP_N             = 10   # max results
    MIN_SKILL_SCORE   = 25   # at least 25% of required skills must match
    MIN_MATCHED_COUNT = 1    # at least 1 skill must match (absolute)

    def get(self, request, pk):
        # ── fetch resume ──────────────────────────────────────────────────
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        # ── extract text ──────────────────────────────────────────────────
        resume_lower = _extract_text(resume.file).lower()

        if not resume_lower.strip():
            return Response({
                'resume_id': resume.pk,
                'keywords_found': [],
                'recommendations': [],
                'message': (
                    'Could not extract text from the resume. '
                    'Please upload a readable PDF or DOCX file.'
                ),
            })

        # ── score every active job through all three gates ────────────────
        scored = []          # [(score, job, matched, missing)]
        all_matched = set()

        for job in Job.objects.filter(is_active=True):
            score, matched, missing, total = _skill_gate(resume_lower, job)

            # Gate 1: skill score threshold
            if score < self.MIN_SKILL_SCORE:
                continue

            # Gate 2: minimum absolute matched count
            if len(matched) < self.MIN_MATCHED_COUNT:
                continue

            # Gate 3 (soft): if score < 50%, at least one domain word from
            # the job title should appear in the resume — prevents obvious
            # domain mismatches (e.g. Cyber Security for a React resume).
            if score < 50 and not _domain_gate(resume_lower, job.title):
                continue

            scored.append((score, job, matched, missing))
            all_matched.update(matched)

        # ── sort, truncate, serialize ─────────────────────────────────────
        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[:self.TOP_N]

        serializer = JobSerializer(
            [job for _, job, _, _ in top],
            many=True,
            context={'request': request},
        )
        data = list(serializer.data)

        for i, (score, _, matched, missing) in enumerate(top):
            data[i]['match_score']    = score
            data[i]['matched_skills'] = matched
            data[i]['missing_skills'] = missing

        return Response({
            'resume_id':      resume.pk,
            'keywords_found': sorted(all_matched),
            'recommendations': data,
        })
