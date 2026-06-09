import os
import json
from flask import Blueprint, request, jsonify, make_response, render_template_string
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.llm import LLMService

# --- WINDOWS GTK3 DLL FIX ---
GTK_PATH = r'C:\Program Files\GTK3-Runtime-Win64\bin'
if os.name == 'nt' and os.path.exists(GTK_PATH):
    os.environ['PATH'] = GTK_PATH + os.pathsep + os.environ.get('PATH', '')
    if hasattr(os, 'add_dll_directory'):
        try:
            os.add_dll_directory(GTK_PATH)
        except Exception:
            pass

# Deferred import for WeasyPrint
HTML = None
try:
    from weasyprint import HTML as WeasyHTML
    HTML = WeasyHTML
except Exception as e:
    print(f"WARNING: WeasyPrint could not initialize. PDF generation will be disabled. Error: {e}")

bp = Blueprint('ats_resume_builder', __name__, url_prefix='/api/ats-resume')
llm_service = LLMService()

# ATS-Friendly Minimalist Template
ATS_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; color: #000; line-height: 1.4; margin: 30px; font-size: 11pt; }
        .header { text-align: left; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .name { font-size: 24pt; font-weight: bold; margin: 0; text-transform: uppercase; }
        .contact { font-size: 10pt; color: #333; margin-top: 5px; }
        .section { margin-top: 15px; }
        .section-title { font-size: 12pt; font-weight: bold; border-bottom: 0.5px solid #666; padding-bottom: 2px; margin-bottom: 8px; text-transform: uppercase; }
        .item { margin-bottom: 10px; }
        .item-header { font-weight: bold; display: flex; justify-content: space-between; }
        .item-sub { font-style: italic; font-weight: normal; }
        .item-desc { margin-top: 3px; white-space: pre-line; }
        .skills-section { display: block; }
        .skill-group { margin-bottom: 5px; }
        ul { margin: 5px 0 0 20px; padding: 0; }
        li { margin-bottom: 2px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="name">{{ name }}</h1>
        <div class="contact">{{ contact }} | {{ address }}</div>
        <div class="contact">
            {% for tag, url in links_data %}
                {{ tag }}: {{ url }}{% if not loop.last %} | {% endif %}
            {% endfor %}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="item-desc">{{ summary }}</div>
    </div>

    <div class="section">
        <div class="section-title">Experience</div>
        {% for company, date, role, desc in experience %}
        <div class="item">
            <div class="item-header">
                <strong>{{ company }}</strong>
                <span>{{ date }}</span>
            </div>
            <div class="item-sub">{{ role }}</div>
            <div class="item-desc">{{ desc }}</div>
        </div>
        {% endfor %}
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        {% for inst, year, desc in education %}
        <div class="item">
            <div class="item-header">
                <strong>{{ inst }}</strong>
                <span>{{ year }}</span>
            </div>
            <div class="item-desc">{{ desc }}</div>
        </div>
        {% endfor %}
    </div>

    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skill-group"><strong>Languages/Frameworks:</strong> {{ skills_lang }}</div>
        <div class="skill-group"><strong>Tools:</strong> {{ skills_tools }}</div>
        <div class="skill-group"><strong>Interests:</strong> {{ skills_aoi }}</div>
    </div>
</body>
</html>
"""

@bp.get('/status')
def status():
    return jsonify({
        "pdf_enabled": HTML is not None,
        "msg": "ATS Resume Builder is ready" if HTML else "PDF engine (GTK3) is missing"
    })

@bp.post('/generate')
@jwt_required()
def generate():
    if not HTML:
        return jsonify({"msg": "PDF generation unavailable"}), 503

    data = request.json
    experience = [(e.get('company'), e.get('date'), e.get('role'), e.get('description')) for e in data.get('experience', [])]
    education = [(e.get('institution'), e.get('year'), e.get('description')) for e in data.get('education', [])]
    links = [(l.get('tag'), l.get('url')) for l in data.get('links', [])]

    form_data = {
        "name": data.get('name'),
        "contact": data.get('contact'),
        "address": data.get('address'),
        "summary": data.get('summary'),
        "links_data": links,
        "education": education,
        "experience": experience,
        "skills_lang": data.get('skills_lang'),
        "skills_aoi": data.get('skills_aoi'),
        "skills_tools": data.get('skills_tools'),
    }

    try:
        html_out = render_template_string(ATS_TEMPLATE, **form_data)
        pdf = HTML(string=html_out).write_pdf()
        response = make_response(pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=ATS_Resume.pdf'
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.post('/scan')
@jwt_required()
def scan():
    """Scan resume content against a Job Description for ATS compatibility"""
    data = request.json
    resume_text = data.get('resume_text', '')
    jd_text = data.get('job_description', '')

    if not jd_text:
        return jsonify({"error": "Job description is required for scanning"}), 400

    prompt = (
        "As an ATS (Applicant Tracking System), analyze the following resume against the job description. "
        "Return a JSON object with: 'ats_score' (0-100), 'matching_keywords' (list), "
        "'missing_keywords' (list), and 'suggestions' (string, 1-2 sentences on how to improve matching)."
    )
    
    content = f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{jd_text}"
    
    try:
        report_json = llm_service.get_completion([
            {"role": "system", "content": prompt},
            {"role": "user", "content": content}
        ], response_format={"type": "json_object"})
        return jsonify(json.loads(report_json))
    except Exception as e:
        return jsonify({"error": "AI scanning failed"}), 500

@bp.post('/improve')
@jwt_required()
def improve():
    """Improve specific resume sections via AI"""
    data = request.json
    content = data.get('content', '')
    field = data.get('field', 'summary')

    prompt = (
        f"You are an expert resume writer. Improve the following {field} to be more professional, "
        "metrics-driven, and ATS-optimized. Keep it concise. Return ONLY the improved text."
    )
    
    try:
        improved = llm_service.get_completion([
            {"role": "system", "content": prompt},
            {"role": "user", "content": content}
        ])
        return jsonify({"improved_text": improved})
    except Exception as e:
        return jsonify({"error": "AI improvement failed"}), 500
