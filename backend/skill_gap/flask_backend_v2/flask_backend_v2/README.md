# Flask Backend v2

This is an upgraded backend (Flask) with:
- Better structure (app package)
- JWT auth + admin role
- Daily score normalization
- Auto-k clustering (silhouette)
- TF-IDF resume similarity
- Internship recommendations

## Run (Conda on Windows)
```bash
conda create -n skillgap python=3.12 -y
conda activate skillgap
conda install numpy pandas scikit-learn -y
pip install -r requirements.txt
copy .env.example .env
python seed.py
python run.py
```

Health: http://127.0.0.1:5000/health
