let problems = JSON.parse(localStorage.getItem("problems")) || [];

// Handle form submission
document.getElementById("addForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const newProblem = {
        name: document.getElementById("problemName").value,
        platform: document.getElementById("platform").value,
        description: document.getElementById("description").value,
        difficulty: document.getElementById("difficulty").value,
        status: document.getElementById("status").value,
        date: new Date().toISOString().split("T")[0]
    };

    problems.push(newProblem);
    localStorage.setItem("problems", JSON.stringify(problems));

    this.reset();
    renderProblems();
    updateCharts();  // Update the charts when a new problem is added
});

// Render problems in the table
function renderProblems() {
    const tableBody = document.getElementById("problemTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    problems.forEach((p, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.platform}</td>
            <td>${p.difficulty}</td>
            <td>${p.status}</td>
            <td>${p.description}</td>
            <td>
                <button class="edit" onclick="editProblem(${index})">Edit</button>
                <button class="delete" onclick="deleteProblem(${index})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Delete a problem
function deleteProblem(index) {
    problems.splice(index, 1);
    localStorage.setItem("problems", JSON.stringify(problems));
    renderProblems();
    updateCharts();  // Update the charts when a problem is deleted
}

// Edit a problem
function editProblem(index) {
    const p = problems[index];

    // Pre-fill the form with the problem details for editing
    document.getElementById("problemName").value = p.name;
    document.getElementById("platform").value = p.platform;
    document.getElementById("description").value = p.description;
    document.getElementById("difficulty").value = p.difficulty;
    document.getElementById("status").value = p.status;

    // Update the button action to update the problem
    const form = document.getElementById("addForm");
    form.removeEventListener("submit", handleSubmit);  // Remove the current submit event listener
    form.addEventListener("submit", function handleEditSubmit(e) {
        e.preventDefault();
        p.name = document.getElementById("problemName").value;
        p.platform = document.getElementById("platform").value;
        p.description = document.getElementById("description").value;
        p.difficulty = document.getElementById("difficulty").value;
        p.status = document.getElementById("status").value;

        localStorage.setItem("problems", JSON.stringify(problems));

        form.reset();
        renderProblems();
        updateCharts();  // Update the charts after editing
        form.removeEventListener("submit", handleEditSubmit);
        form.addEventListener("submit", handleSubmit);  // Re-attach the default submit listener
    });
}

// Default submit action for adding a problem
function handleSubmit(e) {
    e.preventDefault();
    const newProblem = {
        name: document.getElementById("problemName").value,
        platform: document.getElementById("platform").value,
        description: document.getElementById("description").value,
        difficulty: document.getElementById("difficulty").value,
        status: document.getElementById("status").value,
        date: new Date().toISOString().split("T")[0]
    };

    problems.push(newProblem);
    localStorage.setItem("problems", JSON.stringify(problems));

    this.reset();
    renderProblems();
    updateCharts();  // Update the charts after adding a problem
}

// Function to update charts (pie chart and bar chart)
// Function to update charts (pie chart and bar chart)
let pieChart, statusChart, barChart;

function updateCharts() {
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
    const statusCount = { Solved: 0, Unsolved: 0, Pending: 0 };  // New status count object
    const entriesPerDate = {};

    problems.forEach(p => {
        difficultyCount[p.difficulty] = (difficultyCount[p.difficulty] || 0) + 1;
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;  // Count status occurrences
        entriesPerDate[p.date] = (entriesPerDate[p.date] || 0) + 1;
    });

    const total = problems.length;
    const labelsWithPercent = Object.entries(difficultyCount).map(([key, value]) => {
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `${key} (${value})`;  // Or use `${key} (${value})` for count
    });

    // Difficulty Pie Chart Data
    const pieData = {
        labels: labelsWithPercent,
        datasets: [{
            data: Object.values(difficultyCount),
            backgroundColor: ['green', 'yellow', 'red']
        }]
    };

    // Status Pie Chart Data
    const statusData = {
        labels: Object.entries(statusCount).map(([key, value]) => `${key} (${value})`),
        datasets: [{
            data: Object.values(statusCount),
            backgroundColor: ['green', 'red', 'yellow']
        }]
    };

    // Update Difficulty Pie Chart
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById("difficultyChart"), {
        type: 'pie',
        data: pieData,
        options: {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Update Status Pie Chart
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(document.getElementById("statusChart"), {
        type: 'pie',
        data: statusData,
        options: {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Bar Chart Data (Entries per Day)
    const barData = {
        labels: Object.keys(entriesPerDate),
        datasets: [{
            label: 'Entries per Day',
            data: Object.values(entriesPerDate),
            backgroundColor: 'black'
        }]
    };

    // Update Bar Chart
    if (barChart) barChart.destroy();
    barChart = new Chart(document.getElementById("entryBarChart"), {
        type: 'bar',
        data: barData,
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}



// Initial render of problems and charts
renderProblems();
updateCharts();  // Ensure the charts are rendered initially
document.getElementById("sortByDifficulty").addEventListener("click", () => {
    problems.sort((a, b) => {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return order[a.difficulty] - order[b.difficulty];
    });
    renderProblems();
});

document.getElementById("sortByStatus").addEventListener("click", () => {
    const order = { Solved: 1, Pending: 2, Unsolved: 3 };
    problems.sort((a, b) => order[a.status] - order[b.status]);
    renderProblems();
});
