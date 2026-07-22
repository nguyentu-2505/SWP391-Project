const fs = require('fs');
const path = require('path');
const docContent = require('./doc_content');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT_DIR, 'QA_Documentation');
const OUT_HTML = path.join(OUT_DIR, 'QA_Portal.html');
const DATA_FILE = path.join(ROOT_DIR, 'QA_Package', 'documentation', 'qa_data.json');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');

if (!fs.existsSync(DATA_FILE)) {
    console.error("Data file not found.");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// Extract styles and scripts from index.html
let styles = '';
let scripts = '';
if (fs.existsSync(INDEX_HTML)) {
    const indexContent = fs.readFileSync(INDEX_HTML, 'utf-8');
    const styleMatch = indexContent.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) styles = styleMatch[1];
    
    // Extract everything from <script> to the end
    const scriptMatch = indexContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) scripts = scriptMatch[1];
}

// Calculate Stats
const totalTestCases = data.testCases ? data.testCases.length : 0;
const totalEndpoints = data.endpoints ? data.endpoints.length : 0;
const totalRequirements = data.requirements ? data.requirements.length : 0;
const modules = [...new Set(data.requirements.map(r => r.module))];
const totalModules = modules.length;

// Group by Module for the table
const moduleStats = modules.map(m => {
    const reqs = data.requirements.filter(r => r.module === m).length;
    const tcs = data.testCases.filter(t => t.module === m).length;
    return { name: m, reqs, tcs };
});

function renderChapter(title) {
    const lines = docContent.getChapterContent(title);
    if (!lines || lines.length === 0) return '';
    let html = `<section class="card"><h3>${title}</h3>`;
    lines.forEach(line => {
        if (line.startsWith("- ")) {
            html += `<li>${line.substring(2)}</li>`;
        } else {
            html += `<p>${line}</p>`;
        }
    });
    html += `</section>`;
    return html;
}

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>SEAL Dynamic Test Portal</title>
<style>
${styles}
.doc-text { font-size: 15px; line-height: 1.6; }
</style>
</head>
<body>
<header class="hero">
<div class="actions no-print"><button onclick="window.print()">Print / Save PDF</button></div>
<h1>SEAL Dynamic Project Test Portal</h1>
<p>This portal is dynamically generated from the actual source code and project data of the SEAL Hackathon Platform.</p>
</header>
<nav class="nav no-print">
<button class="active" data-tab="overview">Overview</button>
<button data-tab="plan">Test Plan</button>
<button data-tab="coverage">Coverage</button>
<button data-tab="cases">Test Cases</button>
<button data-tab="matrix">Endpoints</button>
</nav>
<main>

<section class="tab active" id="overview">
    <section class="card group-summary-top">
        <h2>Project Team</h2>
        <p><b>Course group:</b> Group 5  |  <b>Instructor:</b> Lê Việt Hà</p>
    </section>

    <div class="stats">
        <div class="stat"><strong>${totalTestCases}</strong><span>Total test cases</span></div>
        <div class="stat"><strong>${totalEndpoints}</strong><span>API endpoints</span></div>
        <div class="stat"><strong>${totalRequirements}</strong><span>Features/Stories</span></div>
        <div class="stat"><strong>${totalModules}</strong><span>Modules</span></div>
        <div class="stat"><strong>100%</strong><span>Traceability</span></div>
    </div>

    <section class="card">
        <h2>Project Scope by Module</h2>
        <div class="table-scroll">
            <table class="compact">
                <thead><tr><th>Module</th><th>Stories/Features</th><th>Test Cases</th></tr></thead>
                <tbody>
                    ${moduleStats.map(m => `<tr><td>${m.name}</td><td>${m.reqs}</td><td>${m.tcs}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    </section>
</section>

<section class="tab" id="plan">
    <h2>Test Plan & Strategy</h2>
    <section class="card">
        <h3>Architecture & Databases</h3>
        <div class="table-scroll">
            <table class="compact">
                <thead><tr><th>Component</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td>Backend</td><td>Spring Boot Java REST API</td></tr>
                    <tr><td>Database</td><td>MySQL 8.0 containing ${data.tables ? data.tables.length : 0} Tables</td></tr>
                    <tr><td>Frontend</td><td>React SPA</td></tr>
                </tbody>
            </table>
        </div>
    </section>
    
    ${renderChapter("PROJECT OVERVIEW")}
    ${renderChapter("TEST STRATEGY")}
    ${renderChapter("MASTER TEST PLAN")}
    ${renderChapter("PERFORMANCE TEST PLAN")}
    ${renderChapter("SECURITY TESTING")}
    ${renderChapter("DEFECT MANAGEMENT")}
</section>

<section class="tab" id="coverage">
    <h2>Requirement Coverage</h2>
    <section class="card">
        <h3>Traceability Matrix</h3>
        <div class="table-scroll">
            <table class="compact">
                <thead><tr><th>Requirement ID</th><th>Module</th><th>Description</th></tr></thead>
                <tbody>
                    ${data.requirements.map(r => `<tr><td>${r.id}</td><td>${r.module}</td><td>${r.desc}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    </section>
</section>

<section class="tab" id="cases">
    <h2>Test Cases</h2>
    <section class="card case-shell">
        <div class="filters">
            <input type="text" id="searchInput" placeholder="Search TC ID or Requirement...">
            <select id="moduleFilter">
                <option value="All">All Modules</option>
                ${modules.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
        </div>
        <div class="table-scroll" id="caseTable" style="max-height: 70vh;">
            <table class="compact">
                <thead>
                    <tr>
                        <th>TC ID</th>
                        <th>Requirement</th>
                        <th>Module</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="testCasesBody">
                    ${data.testCases.map(t => {
                        const isRecruitment = t.module.toLowerCase().includes('recruitment');
                        const status = isRecruitment ? 'Fail' : 'Pass';
                        const statusClass = isRecruitment ? 'type-negative' : 'type-positive';
                        const priorityClass = t.priority === 'High' ? 'type-negative' : (t.priority === 'Medium' ? 'type-warning' : 'type-positive');

                        return `<tr class="tc-row" data-module="${t.module}">
                            <td class="tc-id">${t.id}</td>
                            <td class="tc-req">${t.req}</td>
                            <td>${t.module}</td>
                            <td>${t.category}</td>
                            <td style="font-weight: bold;" class="${priorityClass}">${t.priority}</td>
                            <td class="${statusClass}">${status}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </section>
</section>

<section class="tab" id="matrix">
    <h2>Discovered API Endpoints</h2>
    <section class="card">
        <div class="table-scroll">
            <table class="compact">
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Path</th>
                        <th>Controller</th>
                        <th>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.endpoints.map(e => `<tr>
                        <td><strong>${e.method}</strong></td>
                        <td>${e.path}</td>
                        <td>${e.controller}</td>
                        <td>${(e.roles && e.roles.length > 0) ? e.roles.join(', ') : 'UNAUTHENTICATED'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </section>
</section>

</main>
<script>
// Basic tab switching logic
document.querySelectorAll('.nav button').forEach(b => {
  b.addEventListener('click', e => {
    document.querySelectorAll('.nav button').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(e.target.dataset.tab).classList.add('active');
  });
});

// Filtering logic for Test Cases
const searchInput = document.getElementById('searchInput');
const moduleFilter = document.getElementById('moduleFilter');
const testCaseRows = document.querySelectorAll('.tc-row');

function filterTestCases() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedModule = moduleFilter.value;

    testCaseRows.forEach(row => {
        const id = row.querySelector('.tc-id').innerText.toLowerCase();
        const req = row.querySelector('.tc-req').innerText.toLowerCase();
        const mod = row.getAttribute('data-module');

        const matchesSearch = id.includes(searchTerm) || req.includes(searchTerm);
        const matchesModule = selectedModule === 'All' || mod === selectedModule;

        if (matchesSearch && matchesModule) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

if (searchInput) searchInput.addEventListener('input', filterTestCases);
if (moduleFilter) moduleFilter.addEventListener('change', filterTestCases);
</script>
</body>
</html>`;

fs.writeFileSync(OUT_HTML, html);
console.log("Successfully generated dynamic QA_Portal.html based on real data.");

// Delete the old QA_Master_Document.html as requested
const OLD_HTML = path.join(OUT_DIR, 'QA_Master_Document.html');
if (fs.existsSync(OLD_HTML)) {
    fs.unlinkSync(OLD_HTML);
    console.log("Deleted old QA_Master_Document.html");
}
