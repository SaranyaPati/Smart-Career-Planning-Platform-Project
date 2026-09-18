"""
Seed realistic sample data for Career Paths and Jobs.
Run: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from careers.models import CareerPath
from jobs.models import Job


CAREER_PATHS = [
    {
        "title": "Full Stack Developer",
        "icon": "💻",
        "description": "Build end-to-end web applications using modern frontend and backend frameworks.",
        "skills_needed": "React, Node.js, Python, Django, REST APIs, SQL, Git",
        "avg_salary": "₹8–18 LPA",
        "growth_rate": "22% YoY",
    },
    {
        "title": "Data Scientist",
        "icon": "📊",
        "description": "Analyse complex datasets and build ML models to drive data-driven decisions.",
        "skills_needed": "Python, Pandas, NumPy, Scikit-learn, TensorFlow, SQL, Tableau",
        "avg_salary": "₹10–22 LPA",
        "growth_rate": "35% YoY",
    },
    {
        "title": "DevOps Engineer",
        "icon": "⚙️",
        "description": "Automate deployments, manage CI/CD pipelines, and maintain cloud infrastructure.",
        "skills_needed": "Docker, Kubernetes, AWS, Jenkins, Terraform, Linux, Python",
        "avg_salary": "₹9–20 LPA",
        "growth_rate": "28% YoY",
    },
    {
        "title": "UI/UX Designer",
        "icon": "🎨",
        "description": "Design user-centred interfaces and create delightful digital experiences.",
        "skills_needed": "Figma, Adobe XD, Prototyping, User Research, CSS, HTML",
        "avg_salary": "₹6–14 LPA",
        "growth_rate": "18% YoY",
    },
    {
        "title": "Machine Learning Engineer",
        "icon": "🤖",
        "description": "Design and deploy production-ready ML systems and pipelines.",
        "skills_needed": "Python, TensorFlow, PyTorch, MLOps, Docker, Cloud ML, SQL",
        "avg_salary": "₹12–28 LPA",
        "growth_rate": "40% YoY",
    },
    {
        "title": "Product Manager",
        "icon": "🎯",
        "description": "Define product vision, prioritise features, and lead cross-functional teams.",
        "skills_needed": "Roadmapping, User Stories, Agile, Jira, Analytics, Communication",
        "avg_salary": "₹12–30 LPA",
        "growth_rate": "25% YoY",
    },
    {
        "title": "Cybersecurity Analyst",
        "icon": "🔒",
        "description": "Protect systems and data from threats, vulnerabilities, and attacks.",
        "skills_needed": "Network Security, SIEM, Python, Penetration Testing, ISO 27001",
        "avg_salary": "₹8–18 LPA",
        "growth_rate": "30% YoY",
    },
    {
        "title": "Cloud Architect",
        "icon": "☁️",
        "description": "Design scalable, resilient cloud architectures across AWS, Azure, and GCP.",
        "skills_needed": "AWS, Azure, GCP, Terraform, Kubernetes, Networking, Python",
        "avg_salary": "₹15–35 LPA",
        "growth_rate": "32% YoY",
    },
]


JOBS = [
    {
        "title": "React Developer",
        "company": "TechNova Solutions",
        "location": "Bangalore, India",
        "location_type": "hybrid",
        "description": "Build responsive, high-performance React applications for our SaaS platform.",
        "requirements": "2+ years React, TypeScript, REST API integration, Git.",
        "skills_required": "React, TypeScript, JavaScript, HTML, CSS, Git",
        "salary_range": "₹8–14 LPA",
        "apply_url": "https://example.com/apply/react-dev",
    },
    {
        "title": "Python Backend Engineer",
        "company": "DataBridge AI",
        "location": "Hyderabad, India",
        "location_type": "onsite",
        "description": "Design and scale REST APIs using Django and FastAPI.",
        "requirements": "3+ years Python, Django/FastAPI, PostgreSQL, Redis, Docker.",
        "skills_required": "Python, Django, FastAPI, PostgreSQL, Docker, Redis",
        "salary_range": "₹10–18 LPA",
        "apply_url": "https://example.com/apply/python-be",
    },
    {
        "title": "Data Analyst",
        "company": "Insight Analytics",
        "location": "Remote",
        "location_type": "remote",
        "description": "Analyse user behaviour and generate dashboards for executive reporting.",
        "requirements": "SQL, Python (Pandas), Tableau or Power BI, 1+ year experience.",
        "skills_required": "SQL, Python, Pandas, Tableau, Power BI, Excel",
        "salary_range": "₹6–10 LPA",
        "apply_url": "https://example.com/apply/data-analyst",
    },
    {
        "title": "UI/UX Designer",
        "company": "Creative Labs",
        "location": "Chennai, India",
        "location_type": "hybrid",
        "description": "Create wireframes, prototypes, and pixel-perfect designs for our product suite.",
        "requirements": "Portfolio required, proficient in Figma, user research experience.",
        "skills_required": "Figma, Adobe XD, Prototyping, User Research, CSS",
        "salary_range": "₹7–12 LPA",
        "apply_url": "https://example.com/apply/ux-designer",
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudStack Pvt Ltd",
        "location": "Pune, India",
        "location_type": "onsite",
        "description": "Manage CI/CD pipelines, Kubernetes clusters, and AWS infrastructure.",
        "requirements": "AWS, Docker, Kubernetes, Terraform, Jenkins, 2+ years experience.",
        "skills_required": "AWS, Docker, Kubernetes, Terraform, Jenkins, Linux",
        "salary_range": "₹12–20 LPA",
        "apply_url": "https://example.com/apply/devops",
    },
    {
        "title": "Machine Learning Engineer",
        "company": "NeuralGen Systems",
        "location": "Remote",
        "location_type": "remote",
        "description": "Train, evaluate, and deploy ML models into production-grade pipelines.",
        "requirements": "PyTorch or TensorFlow, MLOps tools, Python, 2+ years.",
        "skills_required": "Python, PyTorch, TensorFlow, MLOps, Docker, SQL",
        "salary_range": "₹15–28 LPA",
        "apply_url": "https://example.com/apply/ml-engineer",
    },
    {
        "title": "Full Stack Developer",
        "company": "StartupVenture Inc.",
        "location": "Mumbai, India",
        "location_type": "hybrid",
        "description": "Own complete features from React frontend to Django backend.",
        "requirements": "React, Django, REST APIs, SQL, Git, 2+ years.",
        "skills_required": "React, Django, Python, SQL, Git, REST APIs",
        "salary_range": "₹9–16 LPA",
        "apply_url": "https://example.com/apply/fullstack",
    },
    {
        "title": "Cybersecurity Analyst",
        "company": "SecureNet India",
        "location": "Delhi, India",
        "location_type": "onsite",
        "description": "Monitor threats, conduct penetration testing, and respond to incidents.",
        "requirements": "CEH or CISSP preferred, SIEM tools, network security, 2+ years.",
        "skills_required": "Network Security, SIEM, Python, Penetration Testing, Linux",
        "salary_range": "₹8–15 LPA",
        "apply_url": "https://example.com/apply/cybersec",
    },
    {
        "title": "Cloud Solutions Architect",
        "company": "Infra Global",
        "location": "Bangalore, India",
        "location_type": "hybrid",
        "description": "Design and implement cloud-native architectures on AWS and GCP.",
        "requirements": "AWS Solutions Architect cert preferred, Terraform, Kubernetes.",
        "skills_required": "AWS, GCP, Terraform, Kubernetes, Networking, Python",
        "salary_range": "₹18–35 LPA",
        "apply_url": "https://example.com/apply/cloud-architect",
    },
    {
        "title": "Product Manager",
        "company": "ProducTech",
        "location": "Remote",
        "location_type": "remote",
        "description": "Lead agile sprints, define roadmaps, and work with engineering and design.",
        "requirements": "3+ years PM, strong communication, Jira, user research.",
        "skills_required": "Roadmapping, Agile, Jira, User Stories, Analytics, Communication",
        "salary_range": "₹14–28 LPA",
        "apply_url": "https://example.com/apply/product-manager",
    },
]


class Command(BaseCommand):
    help = "Seed career paths and job listings with realistic sample data"

    def handle(self, *args, **kwargs):
        # Seed Career Paths
        created_paths = 0
        for data in CAREER_PATHS:
            _, created = CareerPath.objects.get_or_create(
                title=data["title"],
                defaults=data,
            )
            if created:
                created_paths += 1
        self.stdout.write(f"Career Paths: {created_paths} created, "
                          f"{len(CAREER_PATHS) - created_paths} already existed.")

        # Seed Jobs
        created_jobs = 0
        for data in JOBS:
            _, created = Job.objects.get_or_create(
                title=data["title"],
                company=data["company"],
                defaults=data,
            )
            if created:
                created_jobs += 1
        self.stdout.write(f"Jobs: {created_jobs} created, "
                          f"{len(JOBS) - created_jobs} already existed.")

        self.stdout.write(self.style.SUCCESS("Seed data loaded successfully!"))
