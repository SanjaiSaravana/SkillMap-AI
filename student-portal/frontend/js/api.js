const BASE_URL = 'http://localhost:5004/api';

const api = {
    // Save student data
    async saveStudent(data) {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to save student');
        return await response.json();
    },

    // Fetch all students for dashboard
    async getAllStudents() {
        const response = await fetch(`${BASE_URL}/students`);
        if (!response.ok) throw new Error('Failed to fetch students');
        return await response.json();
    }
};