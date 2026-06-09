from __future__ import annotations
import re
import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SKILLS = sorted(set([
    "python","java","c++","c","javascript","typescript","react","node","express","flask","django","fastapi",
    "sql","postgresql","mysql","mongodb","redis",
    "machine learning","deep learning","nlp","computer vision","pytorch","tensorflow","scikit-learn",
    "docker","kubernetes","aws","gcp","azure",
    "git","linux","html","css","tailwind","bootstrap",
    "data analysis","pandas","numpy"
]))

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    parts = []
    for page in doc:
        parts.append(page.get_text("text"))
    return "\n".join(parts)

def extract_skills(text: str):
    t = (text or "").lower()
    found = []
    for sk in SKILLS:
        if re.search(r"(^|\W)" + re.escape(sk.lower()) + r"(\W|$)", t):
            found.append(sk)
    return sorted(set(found))

def semantic_similarity_tfidf(a: str, b: str) -> float:
    a = a or ""
    b = b or ""
    if not a.strip() or not b.strip():
        return 0.0
    vec = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1,2))
    X = vec.fit_transform([a, b])
    sim = cosine_similarity(X[0], X[1])[0][0]
    return float(sim * 100.0)

def match_resume_to_jd(resume_text: str, jd_text: str):
    rs = set(extract_skills(resume_text))
    js = set(extract_skills(jd_text))
    missing = sorted(list(js - rs))
    overlap = len(rs & js) / max(1, len(js))
    skill_score = overlap * 100.0
    semantic = semantic_similarity_tfidf(resume_text, jd_text)
    final = 0.7*skill_score + 0.3*semantic
    return {
        "resume_skills": sorted(rs),
        "jd_skills": sorted(js),
        "missing_skills": missing,
        "match_score": float(final),
        "semantic_similarity": float(semantic)
    }
