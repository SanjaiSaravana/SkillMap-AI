// --- Logic for index.html ---
async function submitData() {
    const status = document.getElementById('status-msg');
    const studentData = {
        name: document.getElementById('name').value,
        github: document.getElementById('gh').value,
        leetcode: document.getElementById('lc').value,
        hackerrank: document.getElementById('hr').value
    };

    if (!studentData.name || !studentData.github || !studentData.leetcode) {
        status.innerText = "❌ Please fill all required fields.";
        return;
    }

    status.innerText = "⏳ Syncing with APIs and PostgreSQL...";
    
    try {
        await api.saveStudent(studentData);
        status.innerText = "✅ Successfully saved to Database!";
        // Clear inputs
        ['name', 'gh', 'lc', 'hr'].forEach(id => document.getElementById(id).value = '');
    } catch (err) {
        status.innerText = "⚠️ Error: " + err.message;
        console.error(err);
    }
}

// --- Logic for dashboard.html ---
async function loadDashboard() {
    const container = document.getElementById('leaderboard');
    try {
        const students = await api.getAllStudents();
        if (students.length === 0) {
            container.innerHTML = "<p>No students registered yet.</p>";
            return;
        }

        container.innerHTML = students.map(s => `
            <div class="card">
                <h3>${s.name}</h3>
                <p><strong>LeetCode:</strong> ${s.leetcode_solved} solved</p>
                <p><strong>GitHub:</strong> ${s.github_repos} repos</p>
                <a href="https://hackerrank.com/${s.hackerrank_user}" target="_blank">HackerRank Profile</a>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = "<p>Error loading dashboard. Is the server running?</p>";
    }
    async function refreshStudent(github_user) {
    // You would call an API route that re-fetches stats for THIS specific user
    alert("Updating stats for " + github_user + "...");
    // Logic to call backend...
}
async function loadDashboard() {
    const container = document.getElementById('leaderboard');
    
    try {
        const students = await api.getAllStudents();
        
        if (students.length === 0) {
            container.innerHTML = "<p>No students found. Go register one!</p>";
            return;
        }

        container.innerHTML = students.map((s, index) => {
            // Format the date to look nice (e.g., "Jan 30, 9:55 PM")
            const date = new Date(s.last_updated);
            const timeString = date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            // Add a trophy for the top student
            const rankEmoji = index === 0 ? '🏆' : `#${index + 1}`;

            return `
                <div class="card">
                    <div class="rank">${rankEmoji}</div>
                    <h3>${s.name}</h3>
                    <div class="stats">
                        <p>🚀 <strong>LeetCode:</strong> ${s.leetcode_solved} solved</p>
                        <p>📂 <strong>GitHub:</strong> ${s.github_repos} repos</p>
                    </div>
                    <div class="meta">
                        <span>Last Synced: ${timeString}</span>
                    </div>
                    <a href="https://github.com/${s.github_user}" target="_blank" class="link">View Profile</a>
                </div>
            `;
        }).join('');

    } catch (err) {
        container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}
}