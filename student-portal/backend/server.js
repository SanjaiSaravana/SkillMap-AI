const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('❌ Database connection error:', err.message);
    else console.log('✅ Connected to SQLite successfully');
});

// Create table if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            github_user TEXT UNIQUE,
            leetcode_user TEXT,
            hackerrank_user TEXT,
            github_repos INTEGER,
            leetcode_solved INTEGER,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Helper Function to fetch stats (Used by both manual register and auto-cron)
async function fetchStats(github, leetcode) {
    let repos = 0;
    let solved = 0;
    try {
        const ghRes = await axios.get(`https://api.github.com/users/${github}`, { timeout: 5000 });
        repos = ghRes.data.public_repos || 0;
    } catch (e) { console.log(`⚠️ GitHub fail: ${github}`); }

    try {
        const lcRes = await axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcode}`, { timeout: 5000 });
        solved = lcRes.data.totalSolved || 0;
    } catch (e) { console.log(`⚠️ LeetCode fail: ${leetcode}`); }

    return { repos, solved };
}

// 1. Manual Registration Route
app.post('/api/register', async (req, res) => {
    const { name, github, leetcode, hackerrank } = req.body;
    console.log(`📩 Manual sync request for: ${name}`);

    try {
        const stats = await fetchStats(github, leetcode);
        const query = `
            INSERT INTO students (name, github_user, leetcode_user, hackerrank_user, github_repos, leetcode_solved)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (github_user) 
            DO UPDATE SET 
                github_repos = excluded.github_repos, 
                leetcode_solved = excluded.leetcode_solved,
                last_updated = CURRENT_TIMESTAMP;
        `;
        db.run(query, [name, github, leetcode, hackerrank, stats.repos, stats.solved], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: "Student data saved!" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Dashboard Route
app.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students ORDER BY leetcode_solved DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. AUTO-SYNC LOGIC (CRON JOB)
cron.schedule('*/1 * * * *', () => {
    console.log("🤖 Auto-Sync Robot: Updating all student stats...");
    db.all('SELECT name, github_user, leetcode_user FROM students', [], async (err, rows) => {
        if (err) return console.error("❌ Auto-Sync failed:", err.message);
        
        for (let student of rows) {
            const freshData = await fetchStats(student.github_user, student.leetcode_user);
            
            db.run(
                'UPDATE students SET github_repos = ?, leetcode_solved = ?, last_updated = CURRENT_TIMESTAMP WHERE github_user = ?',
                [freshData.repos, freshData.solved, student.github_user]
            );
            console.log(`✅ Auto-updated: ${student.name}`);
        }
        console.log("🏁 All stats are now up to date.");
    });
});

const PORT = 5004;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));