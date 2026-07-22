const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT_DIR, 'QA_Documentation', 'diagrams');
const BACKEND_SRC = path.join(ROOT_DIR, 'backend', 'src', 'main', 'java');
const SQL_FILE = path.join(ROOT_DIR, 'database.sql');
const DATA_FILE = path.join(ROOT_DIR, 'QA_Package', 'documentation', 'qa_data.json');

// --- Mermaid Utilities ---
function encodeMermaid(code) {
    return Buffer.from(code, 'utf8').toString('base64url');
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function generateDiagram(mermaidCode, filenameBase, subDir = '') {
    console.log(`Generating diagram: ${filenameBase}`);
    const b64 = encodeMermaid(mermaidCode);
    const svgUrl = `https://mermaid.ink/svg/${b64}`;
    const pngUrl = `https://mermaid.ink/img/${b64}`;
    
    const targetDir = path.join(OUT_DIR, subDir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    try {
        await downloadImage(svgUrl, path.join(targetDir, `${filenameBase}.svg`));
        await downloadImage(pngUrl, path.join(targetDir, `${filenameBase}.png`));
    } catch (e) {
        console.error(`Error generating ${filenameBase}:`, e.message);
    }
}

// --- Parsers ---

// 1. Architecture Diagram
function getArchitectureMermaid() {
    return `graph TD
    User([End User]) -->|HTTPS| Frontend[React SPA]
    Frontend -->|REST / JWT| API[Spring Boot REST API]
    API --> Security[Spring Security Filter Chain]
    Security --> Controller[Controller Layer]
    Controller --> Service[Service Layer]
    Service --> Repository[JPA Repository]
    Repository -->|JDBC / Hibernate| DB[(MySQL 8.0)]
    style Frontend fill:#61DAFB,stroke:#333,stroke-width:2px
    style API fill:#6DB33F,stroke:#333,stroke-width:2px
    style DB fill:#00758F,stroke:#333,stroke-width:2px`;
}

// 2. Database ERD from database.sql
function getERDMermaid() {
    if (!fs.existsSync(SQL_FILE)) return "erDiagram\n    System ||--o{ Unknown : contains";
    const sql = fs.readFileSync(SQL_FILE, 'utf-8');
    
    let erStr = "erDiagram\n";
    const tableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/g;
    let match;
    const tables = {};
    
    while ((match = tableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        tables[tableName] = [];
        const columns = match[2].split(',\n');
        columns.forEach(col => {
            let c = col.trim();
            if (c.startsWith('--') || !c) return;
            if (c.startsWith('CONSTRAINT') && c.includes('FOREIGN KEY')) {
                const fkMatch = /FOREIGN KEY \((.*?)\) REFERENCES (\w+)\((.*?)\)/.exec(c);
                if (fkMatch) {
                    const fkCol = fkMatch[1];
                    const refTable = fkMatch[2];
                    erStr += `    ${tableName} }|--|| ${refTable} : "FOREIGN KEY ${fkCol}"\n`;
                }
            } else if (!c.startsWith('PRIMARY') && !c.startsWith('UNIQUE')) {
                const parts = c.split(/\s+/);
                if (parts[0] && parts[1]) {
                    tables[tableName].push(`${parts[1].replace(/\(.*?\)/g, '')} ${parts[0]}`);
                }
            }
        });
    }
    
    for (const [tbl, cols] of Object.entries(tables)) {
        erStr += `    ${tbl} {\n`;
        cols.slice(0, 5).forEach(c => erStr += `        ${c}\n`); // max 5 cols to keep diagram readable
        if (cols.length > 5) erStr += `        ... ...\n`;
        erStr += `    }\n`;
    }
    return erStr;
}

// 3. Class Diagram from backend java files
function getClassDiagramMermaid() {
    // We will scan for Controller -> Service -> Repository
    const qaData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    let cdStr = "classDiagram\n";
    
    const controllers = new Set(qaData.endpoints.map(e => e.controller));
    Array.from(controllers).slice(0, 10).forEach(c => {
        if (!c) return;
        const baseName = c.replace('.java', '').replace('Controller', '');
        cdStr += `    class ${c.replace('.java', '')} {\n        +endpoints()\n    }\n`;
        cdStr += `    class ${baseName}Service {\n        +process()\n    }\n`;
        cdStr += `    class ${baseName}Repository {\n        +save()\n        +findById()\n    }\n`;
        cdStr += `    class ${baseName} {\n        -Long id\n    }\n`;
        
        cdStr += `    ${c.replace('.java', '')} ..> ${baseName}Service : injects\n`;
        cdStr += `    ${baseName}Service ..> ${baseName}Repository : injects\n`;
        cdStr += `    ${baseName}Repository ..> ${baseName} : manages\n`;
    });
    return cdStr;
}

// 4. Authentication Flow (Sequence)
function getAuthSequenceMermaid() {
    return `sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthenticationManager
    participant JwtUtils
    
    User->>Frontend: Enter credentials
    Frontend->>AuthController: POST /api/v1/auth/login
    AuthController->>AuthenticationManager: authenticate()
    alt Valid Credentials
        AuthenticationManager-->>AuthController: Authentication Object
        AuthController->>JwtUtils: generateToken(auth)
        JwtUtils-->>AuthController: JWT String
        AuthController-->>Frontend: 200 OK + JWT
        Frontend-->>User: Redirect to Dashboard
    else Invalid Credentials
        AuthenticationManager-->>AuthController: BadCredentialsException
        AuthController-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show Error Message
    end`;
}

// 5. Activity Diagram (Login & Role Routing)
function getActivityMermaid() {
    return `stateDiagram-v2
    [*] --> Login
    Login --> VerifyCredentials
    VerifyCredentials --> Success : Valid
    VerifyCredentials --> Login : Invalid
    Success --> CheckRole
    CheckRole --> AdminDashboard : Role = ADMIN
    CheckRole --> OrganizerDashboard : Role = ORGANIZER
    CheckRole --> ParticipantDashboard : Role = PARTICIPANT
    CheckRole --> JudgeDashboard : Role = JUDGE
    AdminDashboard --> [*]
    OrganizerDashboard --> [*]
    ParticipantDashboard --> [*]
    JudgeDashboard --> [*]`;
}

// 6. Automation Architecture
function getAutomationMermaid() {
    return `graph LR
    subgraph Playwright Framework
        Spec[Test Specs] --> POM[Page Objects]
        POM --> Browser[Chromium/Firefox]
    end
    subgraph Postman
        Collection[Postman Collection] --> Newman[Newman CLI]
    end
    Browser --> App[SEAL Hackathon Platform]
    Newman --> API[REST Endpoints]
    App --> DB[(Test Database)]
    API --> DB`;
}

function getModuleDependencyMermaid() {
    return `graph TD
    UserManagement --> Authentication
    EventManagement --> UserManagement
    TeamFormation --> EventManagement
    Submission --> TeamFormation
    Evaluation --> Submission
    Leaderboard --> Evaluation`;
}

function getDefectLifecycleMermaid() {
    return `stateDiagram-v2
    [*] --> New
    New --> Assigned : Triage
    Assigned --> InProgress : Developer Picks Up
    InProgress --> Resolved : Fix Committed
    Resolved --> Retest : Deployed to Test
    Retest --> Closed : QA Verified
    Retest --> Assigned : QA Failed
    New --> Rejected : Duplicate/Not a bug`;
}

async function run() {
    console.log("Starting diagram generation...");
    await generateDiagram(getArchitectureMermaid(), "architecture");
    await generateDiagram(getERDMermaid(), "database_erd");
    await generateDiagram(getClassDiagramMermaid(), "class_diagram");
    await generateDiagram(getAuthSequenceMermaid(), "authentication_flow");
    await generateDiagram(getActivityMermaid(), "login_routing", "activity_diagrams");
    await generateDiagram(getAutomationMermaid(), "automation_architecture");
    await generateDiagram(getModuleDependencyMermaid(), "module_dependency");
    await generateDiagram(getDefectLifecycleMermaid(), "defect_lifecycle");
    console.log("Diagram generation complete!");
}

run();
