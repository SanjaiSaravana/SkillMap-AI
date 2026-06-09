# Flask Backend (Leaderboard + Clustering + Internship Recommender + Resume Analyzer + Learning Map)

## 1) Setup
```bash
cd flask_backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux
```

## 2) Run
```bash
python run.py
```
Server: http://127.0.0.1:5000

## 3) Initialize DB + seed datasets (your CSVs)
Put these files in the project root OR provide their paths:
- cs_dataset.csv
- leetcode_github_dataset.csv
- internships_dataset.csv

Then run:
```bash
python seed.py
```

## 4) Daily jobs
This backend runs daily jobs using APScheduler:
- recompute daily leaderboard
- recompute clustering
- recompute internship recommendations

You can also trigger them manually:
- POST /admin/run-jobs

## 5) React integration
Enable CORS in `.env` if needed; default is permissive in dev.
Use JWT access token in `Authorization: Bearer <token>` header.
