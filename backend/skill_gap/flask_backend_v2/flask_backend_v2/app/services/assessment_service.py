import json
from ..extensions import db
from ..models import Assessment, Question, UserAssessment

STATIC_DATA = [
    {
        "skill": "Python",
        "title": "Python Intermediate Assessment",
        "questions": [
            {"text": "What is the output of print(2 ** 3 ** 2)?", "choices": ["64", "512", "Error", "None"], "correct": 1},
            {"text": "Which of these is NOT a mutable data type?", "choices": ["List", "Dictionary", "Tuple", "Set"], "correct": 2},
            {"text": "What does the 'yield' keyword do?", "choices": ["Stops the function", "Returns a generator", "Raises an error", "Imports a module"], "correct": 1},
            {"text": "How do you start a class definition?", "choices": ["class MyClass:", "def MyClass:", "struct MyClass:", "public class MyClass"], "correct": 0},
            {"text": "What is the result of 'hello'[-1]?", "choices": ["h", "o", "l", "Error"], "correct": 1}
        ]
    },
    {
        "skill": "React",
        "title": "React.js Proficiency Test",
        "questions": [
            {"text": "Which hook is used for side effects?", "choices": ["useState", "useEffect", "useContext", "useReducer"], "correct": 1},
            {"text": "What prevents a component from re-rendering?", "choices": ["React.memo", "useMemo", "shouldComponentUpdate", "All of the above"], "correct": 3},
            {"text": "What is the virtual DOM?", "choices": ["A direct copy of the DOM", "A lightweight representation", "A browser plugin", "A database"], "correct": 1},
            {"text": "How do you pass data to child components?", "choices": ["State", "Props", "Context", "Redux"], "correct": 1},
            {"text": "What is the correct syntax for JSX?", "choices": ["<div class='box'>", "<div className='box'>", "<div style='box'>", "<div id='box'>"], "correct": 1}
        ]
    },
    {
        "skill": "SQL",
        "title": "SQL Fundamentals",
        "questions": [
            {"text": "Which command is used to remove a table?", "choices": ["DELETE", "REMOVE", "DROP", "TRUNCATE"], "correct": 2},
            {"text": "What does JOIN do?", "choices": ["Combines rows from two tables", "Deletes duplicates", "Creates a new table", "Sorts data"], "correct": 0},
            {"text": "Which clause filters groups?", "choices": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], "correct": 1},
            {"text": "What is a primary key?", "choices": ["Any unique column", "A unique identifier for a row", "The first column", "A foreign key"], "correct": 1},
            {"text": "How do you select strictly unique values?", "choices": ["SELECT UNIQUE", "SELECT DISTINCT", "SELECT DIFFERENT", "SELECT ONLY"], "correct": 1}
        ]
    }
]

def ensure_assessments_exist():
    try:
        if Assessment.query.first():
            return
        
        for item in STATIC_DATA:
            asm = Assessment(title=item["title"], skill=item["skill"], difficulty="Intermediate")
            db.session.add(asm)
            db.session.commit()
            
            for q in item["questions"]:
                quest = Question(assessment_id=asm.id, text=q["text"], choices_json=json.dumps(q["choices"]), correct_index=q["correct"])
                db.session.add(quest)
            db.session.commit()
    except Exception as e:
        print(f"Error seeding assessments: {e}")
        db.session.rollback()

def get_all_assessments():
    ensure_assessments_exist()
    return Assessment.query.all()

def get_assessment_by_id(asm_id):
    ensure_assessments_exist()
    return Assessment.query.get(asm_id)

def submit_assessment(user_id, asm_id, answers):
    # answers: list of indices [1, 2, 0, ...]
    questions = Question.query.filter_by(assessment_id=asm_id).all()
    score = 0
    total = len(questions)
    
    # Sort questions by ID to ensure alignment if frontend sorts them, 
    # but usually questions come in order. Assuming strict order for v1.
    questions = sorted(questions, key=lambda x: x.id)
    
    for i, q in enumerate(questions):
        if i < len(answers) and answers[i] == q.correct_index:
            score += 1
            
    final_score = (score / total) * 100 if total > 0 else 0
    passed = final_score >= 80.0
    
    attempt = UserAssessment(user_id=user_id, assessment_id=asm_id, score=final_score, passed=passed)
    db.session.add(attempt)
    db.session.commit()
    
    return attempt
