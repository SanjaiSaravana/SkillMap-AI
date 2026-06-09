const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: String,
    github_user: String,
    leetcode_user: String,
    hackerrank_user: String,
    stats: {
        github_repos: Number,
        leetcode_solved: Number,
        last_updated: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('Student', StudentSchema);