const fs = require('fs');
const path = require('path');
const docContent = require('./doc_content');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT_DIR, 'QA_Documentation');
const OUT_HTML = path.join(OUT_DIR, 'QA_Master_Document.html');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');

// Read the index.html file to extract style and script
let styles = '';
let script = '';
if (fs.existsSync(INDEX_HTML)) {
    const indexContent = fs.readFileSync(INDEX_HTML, 'utf-8');
    const styleMatch = indexContent.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) styles = styleMatch[1];
    
    const scriptMatch = indexContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) script = scriptMatch[1];
}

const tabGroups = [
    { id: 'overview', title: 'Overview', chapters: ["PROJECT OVERVIEW", "SYSTEM ARCHITECTURE ANALYSIS", "SOURCE CODE STRUCTURE ANALYSIS", "CLASS / PACKAGE DIAGRAM"] },
    { id: 'data', title: 'Data & API', chapters: ["DATABASE ANALYSIS", "API DOCUMENTATION"] },
    { id: 'flows', title: 'Flows & Dependencies', chapters: ["USER FLOW ANALYSIS", "SECURITY ANALYSIS", "MODULE DEPENDENCY ANALYSIS"] },
    { id: 'strategy', title: 'Strategy', chapters: ["REQUIREMENT TRACEABILITY MATRIX", "TEST STRATEGY", "MASTER TEST PLAN"] },
    { id: 'design', title: 'Test Design', chapters: ["TEST CASE DESIGN", "AUTOMATION TEST DESIGN"] },
    { id: 'validation', title: 'Validation', chapters: ["PERFORMANCE TEST PLAN", "SECURITY TESTING", "DEFECT MANAGEMENT", "UI TEST EVIDENCE"] }
];

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>Enterprise QA Master Documentation Package</title>
<style>
${styles}
/* Additional adjustments for documentation readability */
.doc-text { font-size: 15px; line-height: 1.6; }
.doc-img { max-width: 100%; height: auto; border: 1px solid var(--border); border-radius: 8px; margin: 16px 0; }
</style>
</head>
<body>
<header class="hero">
<div class="actions no-print"><button onclick="window.print()">Print / Save PDF</button></div>
<h1>Enterprise QA Master Documentation Package</h1>
<p>Submission-ready testing documentation for the SEAL Hackathon Platform. Comprehensive architecture, API, Database, and test strategy analysis automatically generated from the source code.</p>
</header>
<nav class="nav no-print">
${tabGroups.map((group, i) => `<button class="${i === 0 ? 'active' : ''}" data-tab="${group.id}">${group.title}</button>`).join('\n')}
</nav>
<main>
`;

let chapterCount = 1;

tabGroups.forEach((group, index) => {
    html += `<section class="tab ${index === 0 ? 'active' : ''}" id="${group.id}">\n`;
    
    group.chapters.forEach(ch => {
        html += `<section class="card">
        <h2>Chapter ${chapterCount}: ${ch}</h2>\n`;
        
        const paragraphs = docContent.getChapterContent(ch);
        paragraphs.forEach(p => {
            if (p.startsWith("- ")) html += `<p class="doc-text"><strong>•</strong> ${p.substring(2)}</p>\n`;
            else html += `<p class="doc-text">${p}</p>\n`;
        });

        // Insert Images
        const imgMap = {
            "SYSTEM ARCHITECTURE ANALYSIS": "diagrams/architecture.svg",
            "CLASS / PACKAGE DIAGRAM": "diagrams/class_diagram.svg",
            "DATABASE ANALYSIS": "diagrams/database_erd.svg",
            "USER FLOW ANALYSIS": "diagrams/activity_diagrams/login_routing.svg",
            "SECURITY ANALYSIS": "diagrams/authentication_flow.svg",
            "MODULE DEPENDENCY ANALYSIS": "diagrams/module_dependency.svg",
            "AUTOMATION TEST DESIGN": "diagrams/automation_architecture.svg",
            "DEFECT MANAGEMENT": "diagrams/defect_lifecycle.svg"
        };

        if (imgMap[ch]) {
            html += `<img class="doc-img" src="${imgMap[ch]}" alt="${ch} Diagram" />\n`;
        }

        html += `</section>\n`;
        chapterCount++;
    });

    html += `</section>\n`;
});

html += `</main>
<script>
// Default tab logic copied and adapted
document.querySelectorAll('.nav button').forEach(b => {
  b.addEventListener('click', e => {
    document.querySelectorAll('.nav button').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(e.target.dataset.tab).classList.add('active');
  });
});
</script>
</body>
</html>`;

fs.writeFileSync(OUT_HTML, html);
console.log("Successfully generated QA_Master_Document.html mimicking index.html styling.");
