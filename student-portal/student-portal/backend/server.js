const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron'); // New library for auto-updates
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'student_portal',
    password: 'root', 
    port: 5433, 
});

pool.connect((err) => {
    if (err) console.error('❌ Database connection error:', err.stack);
    else console.log('✅ Connected to PostgreSQL successfully');
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
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (github_user) 
            DO UPDATE SET 
                github_repos = EXCLUDED.github_repos, 
                leetcode_solved = EXCLUDED.leetcode_solved,
                last_updated = CURRENT_TIMESTAMP;
        `;
        await pool.query(query, [name, github, leetcode, hackerrank, stats.repos, stats.solved]);
        res.status(200).json({ message: "Student data saved!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Dashboard Route
app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students ORDER BY leetcode_solved DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. AUTO-SYNC LOGIC (CRON JOB)
// Runs every hour on the minute 0 (e.g., 1:00, 2:00, etc.)
cron.schedule('*/1 * * * *', async () => {
    console.log("🤖 Auto-Sync Robot: Updating all student stats...");
    try {
        const allStudents = await pool.query('SELECT name, github_user, leetcode_user FROM students');
        
        for (let student of allStudents.rows) {
            const freshData = await fetchStats(student.github_user, student.leetcode_user);
            
            await pool.query(
                'UPDATE students SET github_repos = $1, leetcode_solved = $2, last_updated = CURRENT_TIMESTAMP WHERE github_user = $3',
                [freshData.repos, freshData.solved, student.github_user]
            );
            console.log(`✅ Auto-updated: ${student.name}`);
        }
        console.log("🏁 All stats are now up to date.");
    } catch (err) {
        console.error("❌ Auto-Sync failed:", err.message);
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));