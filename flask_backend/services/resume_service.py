from __future__ import annotations
import os, json, re
import fitz  # PyMuPDF

# Simple skills dictionary for MVP; extend as needed
SKILLS = sorted(set([
    "python","java","c++","c","javascript","typescript","react","node","flask","django","fastapi",
    "sql","postgresql","mysql","mongodb","redis",
    "machine learning","deep learning","nlp","computer vision","pytorch","tensorflow","scikit-learn",
    "docker","kubernetes","aws","gcp","azure",
    "git","linux","html","css","tailwind","bootstrap",
    "solidity","ethereum","blockchain",
    "data analysis","pandas","numpy"
]))

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text("text"))
    return "\n".join(text_parts)

def extract_skills(text: str):
    t = (text or "").lower()
    found = []
    for sk in SKILLS:
        # phrase boundary-ish
        if re.search(r"(^|\W)" + re.escape(sk.lower()) + r"(\W|$)", t):
            found.append(sk)
    return sorted(set(found))

def match_resume_to_jd(resume_text: str, jd_text: str):
    rs = set(extract_skills(resume_text))
    js = set(extract_skills(jd_text))
    missing = sorted(list(js - rs))
    overlap = len(rs & js) / max(1, len(js))
    score = overlap * 100.0
    return {
        "resume_skills": sorted(rs),
        "jd_skills": sorted(js),
        "missing_skills": missing,
        "match_score": score
    }
