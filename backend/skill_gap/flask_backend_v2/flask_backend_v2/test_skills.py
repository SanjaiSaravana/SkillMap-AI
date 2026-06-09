import re

SKILLS = sorted(set([
    "python","java","c++","c#","c","javascript","typescript","react","node","express","flask","django","fastapi",
    "sql","postgresql","mysql","mongodb","redis","oracle","sqlite","mariadb",
    "machine learning","deep learning","nlp","computer vision","pytorch","tensorflow","scikit-learn","keras",
    "docker","kubernetes","aws","gcp","azure","devops","jenkins","github actions","circleci","terraform",
    "git","linux","html","css","tailwind","bootstrap","sass","less","jquery",
    "data analysis","pandas","numpy","matplotlib","seaborn","tableau","power bi","r","sas",
    "excel","project management","agile","scrum","sdlc","kanban",
    "rest api","graphql","microservices","unit testing","jest","selenium","cypress","appium",
    "aws lambda","s3","ec2","dynamodb","php","laravel","ruby","rails","go","golang","rust","swift","kotlin"
]))

def extract_skills(text: str):
    t = (text or "").lower()
    found = []
    for sk in SKILLS:
        # Simplest and most robust: check if skill is in text, 
        # then check its boundaries manually.
        sk_low = sk.lower()
        idx = t.find(sk_low)
        while idx != -1:
            # Check prefix
            is_start = idx == 0 or not t[idx-1].isalnum()
            # Check suffix
            end_idx = idx + len(sk_low)
            is_end = end_idx == len(t) or not t[end_idx].isalnum()
            
            if is_start and is_end:
                found.append(sk)
                break
            idx = t.find(sk_low, idx + 1)
    return sorted(set(found))

test_jd = "We need a Python developer who knows React, C++, and AWS."
skills = extract_skills(test_jd)
print(f"Test JD: {test_jd}")
print(f"Detected Skills: {skills}")

test_resume = "I have experience in python, react, and aws."
r_skills = extract_skills(test_resume)
print(f"Test Resume: {test_resume}")
print(f"Detected Skills: {r_skills}")
