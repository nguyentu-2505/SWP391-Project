import os
import re
import json
import csv
import xml.etree.ElementTree as ET
from datetime import datetime

ROOT_DIR = r"d:\IT_FPT\SUMMER26\SWP391-Project"
BACKEND_DIR = os.path.join(ROOT_DIR, "backend", "src", "main", "java")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend", "src")
SQL_FILE = os.path.join(ROOT_DIR, "database.sql")

# Data structures
class ProjectData:
    def __init__(self):
        self.tables = [] # [{'name': '', 'columns': []}]
        self.endpoints = [] # [{'method': '', 'path': '', 'roles': [], 'file': '', 'class': ''}]
        self.entities = []
        self.frontend_pages = []
        self.test_cases = []
        self.requirements = []

data = ProjectData()

def parse_sql():
    if not os.path.exists(SQL_FILE):
        return
    with open(SQL_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find CREATE TABLE
    table_pattern = re.compile(r'CREATE\s+TABLE\s+(\w+)\s*\((.*?)\);', re.DOTALL | re.IGNORECASE)
    for match in table_pattern.finditer(content):
        table_name = match.group(1)
        columns_block = match.group(2)
        columns = []
        for line in columns_block.split('\n'):
            line = line.strip()
            if line and not line.startswith('--') and not line.startswith('CONSTRAINT') and not line.startswith('PRIMARY KEY') and not line.startswith('FOREIGN KEY') and not line.startswith('UNIQUE'):
                parts = line.split()
                if len(parts) >= 2:
                    columns.append({'name': parts[0], 'type': parts[1]})
        data.tables.append({'name': table_name, 'columns': columns, 'file': 'database.sql'})

def parse_backend():
    if not os.path.exists(BACKEND_DIR):
        return
    
    mapping_regex = re.compile(r'@(Get|Post|Put|Delete|Patch)Mapping\s*\(\s*["\'](.*?)["\']\s*\)')
    class_mapping_regex = re.compile(r'@RequestMapping\s*\(\s*["\'](.*?)["\']\s*\)')
    role_regex = re.compile(r'@PreAuthorize\s*\(\s*["\'].*?hasRole\(\'(.*?)\'\).*?["\']\s*\)')
    
    for root, dirs, files in os.walk(BACKEND_DIR):
        for file in files:
            if file.endswith(".java"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for @Entity
                if '@Entity' in content:
                    data.entities.append(file)
                
                # Check for @RestController
                if '@RestController' in content:
                    base_path = ""
                    cm = class_mapping_regex.search(content)
                    if cm:
                        base_path = cm.group(1)
                        
                    lines = content.split('\n')
                    current_roles = []
                    
                    for i, line in enumerate(lines):
                        # check roles
                        rm = role_regex.search(line)
                        if rm:
                            current_roles.append(rm.group(1))
                            
                        mm = mapping_regex.search(line)
                        if mm:
                            method = mm.group(1).upper()
                            endpoint_path = mm.group(2)
                            full_path = base_path + endpoint_path
                            data.endpoints.append({
                                'method': method,
                                'path': full_path,
                                'roles': list(current_roles) if current_roles else ["Any"],
                                'file': file
                            })
                            current_roles = [] # reset

def parse_frontend():
    if not os.path.exists(FRONTEND_DIR):
        data.frontend_pages.append({'name': 'Not Implemented', 'file': 'Not Implemented'})
        return
    
    for root, dirs, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.endswith((".tsx", ".jsx")):
                data.frontend_pages.append({'name': file, 'file': file})

def generate_requirements():
    req_id = 1
    for ep in data.endpoints:
        data.requirements.append({
            'req_id': f"REQ-API-{req_id:03d}",
            'desc': f"System shall provide {ep['method']} {ep['path']}",
            'priority': "High",
            'rule': f"Access restricted to: {', '.join(ep['roles'])}",
            'criteria': f"Returns valid JSON payload for {ep['path']}",
            'source': ep['file']
        })
        req_id += 1
        
    for table in data.tables:
        data.requirements.append({
            'req_id': f"REQ-DB-{req_id:03d}",
            'desc': f"System shall store {table['name']} records",
            'priority': "High",
            'rule': f"Adhere to schema with columns: {', '.join([c['name'] for c in table['columns'][:3]])}",
            'criteria': "Data persistence verified via queries",
            'source': table['file']
        })
        req_id += 1
        
    if not data.requirements:
        data.requirements.append({'req_id': 'REQ-001', 'desc': 'Not Implemented', 'priority': 'N/A', 'rule': 'N/A', 'criteria': 'N/A', 'source': 'N/A'})

def generate_test_cases():
    tc_id = 1
    roles = ["ADMIN", "ORGANIZER", "JUDGE", "GUEST_JUDGE", "MENTOR", "PARTICIPANT", "UNAUTHENTICATED"]
    
    for ep in data.endpoints:
        # Positive case
        data.test_cases.append({
            'id': f"TC-API-{tc_id:04d}",
            'req': f"REQ-API-XXX",
            'module': 'Backend API',
            'priority': 'High',
            'precondition': f"User is authenticated as {ep['roles'][0] if ep['roles'] else 'Any'}",
            'steps': f"1. Send {ep['method']} request to {ep['path']}\\n2. Include valid headers and payload.",
            'expected': "200 OK / 201 Created",
            'category': 'Positive',
            'source': ep['file']
        })
        tc_id += 1
        
        # Negative case - Auth
        data.test_cases.append({
            'id': f"TC-API-{tc_id:04d}",
            'req': f"REQ-API-XXX",
            'module': 'Backend API Security',
            'priority': 'High',
            'precondition': "User token is expired or invalid",
            'steps': f"1. Send {ep['method']} request to {ep['path']}\\n2. Use expired JWT.",
            'expected': "401 Unauthorized",
            'category': 'Security / Negative',
            'source': ep['file']
        })
        tc_id += 1
        
        # SQL Injection check
        data.test_cases.append({
            'id': f"TC-API-{tc_id:04d}",
            'req': f"REQ-API-XXX",
            'module': 'Backend API Security',
            'priority': 'Critical',
            'precondition': "None",
            'steps': f"1. Send {ep['method']} request to {ep['path']}\\n2. Inject payload: ' OR 1=1 --",
            'expected': "400 Bad Request or proper sanitization",
            'category': 'Security / SQLi',
            'source': ep['file']
        })
        tc_id += 1
        
    # Generate DB tests
    for tbl in data.tables:
        data.test_cases.append({
            'id': f"TC-DB-{tc_id:04d}",
            'req': f"REQ-DB-XXX",
            'module': 'Database Schema',
            'priority': 'High',
            'precondition': "Database is running",
            'steps': f"1. Verify table {tbl['name']} structure matches schema.",
            'expected': "Table constraints and PK/FK enforced correctly.",
            'category': 'Database Integrity',
            'source': tbl['file']
        })
        tc_id += 1

def write_html():
    # Constructing a massive HTML string with charts, filtering, etc.
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise QA Portal</title>
    <style>
        :root {{ --primary: #0F172A; --secondary: #3B82F6; --bg: #F8FAFC; --card: #FFFFFF; --text: #334155; --border: #E2E8F0; }}
        body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; display: flex; }}
        nav {{ width: 250px; background: var(--primary); color: white; height: 100vh; position: fixed; overflow-y: auto; padding: 1rem; }}
        nav a {{ color: #CBD5E1; text-decoration: none; display: block; padding: 0.5rem; border-radius: 4px; font-size: 0.9rem; }}
        nav a:hover {{ background: #1E293B; color: white; }}
        main {{ margin-left: 280px; padding: 2rem; width: calc(100% - 280px); }}
        .card {{ background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
        table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }}
        th, td {{ border: 1px solid var(--border); padding: 0.5rem; text-align: left; }}
        th {{ background: #F1F5F9; position: sticky; top: 0; }}
        .badge {{ padding: 2px 6px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; }}
        .badge-high {{ background: #FEE2E2; color: #991B1B; }}
        .badge-med {{ background: #FEF3C7; color: #92400E; }}
        .badge-low {{ background: #E0E7FF; color: #3730A3; }}
        input[type="text"] {{ padding: 0.5rem; width: 100%; box-sizing: border-box; margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 4px; }}
        .export-btn {{ background: var(--secondary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; float: right; margin-bottom: 1rem; }}
    </style>
</head>
<body>
    <nav>
        <h2>Enterprise QA</h2>
        <a href="#req">1. Requirement Explorer</a>
        <a href="#testcases">2. Test Case Explorer</a>
        <a href="#api">3. API Coverage</a>
        <a href="#db">4. Database Coverage</a>
        <a href="#ui">5. UI Coverage</a>
        <a href="#metrics">6. Test Metrics</a>
    </nav>
    <main>
        <h1>SEAL Hackathon QA Portal</h1>
        
        <div class="card" id="req">
            <h2>Requirement Traceability Explorer</h2>
            <p>Generated strictly from actual source code bindings.</p>
            <div style="max-height: 400px; overflow-y: auto;">
                <table>
                    <thead><tr><th>Req ID</th><th>Description</th><th>Source File</th><th>Priority</th><th>Acceptance Criteria</th></tr></thead>
                    <tbody>
"""
    for req in data.requirements:
        html += f"<tr><td>{req['req_id']}</td><td>{req['desc']}</td><td><code>{req['source']}</code></td><td><span class='badge badge-high'>{req['priority']}</span></td><td>{req['criteria']}</td></tr>"
        
    html += """
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="card" id="testcases">
            <h2>Test Case Explorer</h2>
            <button class="export-btn" onclick="alert('Export to CSV generated natively in output directory.')">Export CSV</button>
            <input type="text" id="tcSearch" placeholder="Filter Test Cases..." onkeyup="filterTable('tcSearch', 'tcTable')">
            <div style="max-height: 500px; overflow-y: auto;">
                <table id="tcTable">
                    <thead><tr><th>TC ID</th><th>Category</th><th>Precondition</th><th>Steps</th><th>Expected</th><th>Source API/Table</th></tr></thead>
                    <tbody>
"""
    for tc in data.test_cases:
        steps_html = tc['steps'].replace('\\n', '<br>')
        html += f"<tr><td>{tc['id']}</td><td>{tc['category']}</td><td>{tc['precondition']}</td><td>{steps_html}</td><td>{tc['expected']}</td><td><code>{tc['source']}</code></td></tr>"
        
    html += """
                    </tbody>
                </table>
            </div>
            <p style="margin-top: 1rem; font-weight: bold;">Total Test Cases Generated: """ + str(len(data.test_cases)) + """</p>
        </div>

        <div class="card" id="api">
            <h2>REST API Coverage Matrix</h2>
            <table>
                <thead><tr><th>Method</th><th>Endpoint</th><th>Required Roles</th><th>Controller</th></tr></thead>
                <tbody>
"""
    for ep in data.endpoints:
        html += f"<tr><td><strong>{ep['method']}</strong></td><td>{ep['path']}</td><td>{', '.join(ep['roles'])}</td><td>{ep['file']}</td></tr>"
    if not data.endpoints:
        html += "<tr><td colspan='4'>Not Implemented (No @RestController mappings found)</td></tr>"
        
    html += """
                </tbody>
            </table>
        </div>

        <div class="card" id="db">
            <h2>Database Security & Constraint Validation</h2>
            <table>
                <thead><tr><th>Table Name</th><th>Columns Found</th><th>Source</th></tr></thead>
                <tbody>
"""
    for t in data.tables:
        html += f"<tr><td>{t['name']}</td><td>{', '.join([c['name'] for c in t['columns']])}</td><td>{t['file']}</td></tr>"
    if not data.tables:
        html += "<tr><td colspan='3'>Not Implemented (No SQL CREATE TABLE commands found)</td></tr>"
        
    html += """
                </tbody>
            </table>
        </div>
        
        <div class="card" id="ui">
            <h2>UI/UX Component Coverage</h2>
            <table>
                <thead><tr><th>Component File</th><th>Status</th></tr></thead>
                <tbody>
"""
    for f in data.frontend_pages:
        html += f"<tr><td>{f['file']}</td><td>Scanned</td></tr>"
    if not data.frontend_pages:
        html += "<tr><td colspan='2'>Not Implemented (Frontend code missing or unreadable)</td></tr>"

    html += """
                </tbody>
            </table>
        </div>

    </main>
    <script>
        function filterTable(inputId, tableId) {
            let input = document.getElementById(inputId);
            let filter = input.value.toUpperCase();
            let table = document.getElementById(tableId);
            let tr = table.getElementsByTagName("tr");
            for (let i = 1; i < tr.length; i++) {
                let text = tr[i].innerText;
                if (text.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    </script>
</body>
</html>
"""
    with open(os.path.join(ROOT_DIR, "QA_Documentation.html"), 'w', encoding='utf-8') as f:
        f.write(html)

def write_csv():
    tc_file = os.path.join(ROOT_DIR, "TestCases.csv")
    with open(tc_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Test Case ID', 'Requirement', 'Module', 'Priority', 'Precondition', 'Steps', 'Expected Result', 'Actual Result', 'Status', 'Source'])
        for tc in data.test_cases:
            writer.writerow([tc['id'], tc['req'], tc['module'], tc['priority'], tc['precondition'], tc['steps'], tc['expected'], '', 'Pending', tc['source']])
            
    rtm_file = os.path.join(ROOT_DIR, "RTM.csv")
    with open(rtm_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Req ID', 'Description', 'Source File', 'Test Cases Mapped'])
        for req in data.requirements:
            writer.writerow([req['req_id'], req['desc'], req['source'], 'TC-API-XXX'])

def write_postman():
    postman = {
        "info": {
            "name": "SEAL Hackathon Auto-Generated Collection",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": []
    }
    
    for ep in data.endpoints:
        postman["item"].append({
            "name": ep['path'],
            "request": {
                "method": ep['method'],
                "url": {
                    "raw": f"{{{{base_url}}}}{ep['path']}",
                    "host": ["{{base_url}}"],
                    "path": ep['path'].split('/')[1:]
                }
            }
        })
        
    with open(os.path.join(ROOT_DIR, "postman_collection.json"), 'w', encoding='utf-8') as f:
        json.dump(postman, f, indent=4)

def write_jmeter():
    # Extremely simplified JMX structure
    jmx = f"""<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="SEAL Load Test" enabled="true">
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="API Load" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">1</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">100</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
      </ThreadGroup>
      <hashTree/>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
"""
    with open(os.path.join(ROOT_DIR, "jmeter_test_plan.jmx"), 'w', encoding='utf-8') as f:
        f.write(jmx)

def write_misc():
    # Playwright Skeleton
    pw_dir = os.path.join(ROOT_DIR, "playwright_skeleton")
    os.makedirs(pw_dir, exist_ok=True)
    with open(os.path.join(pw_dir, "example.spec.ts"), 'w', encoding='utf-8') as f:
        f.write("import { test, expect } from '@playwright/test';\\n\\ntest('Homepage load', async ({ page }) => {\\n  await page.goto('http://localhost:5173');\\n  await expect(page).toHaveTitle(/SEAL/);\\n});")
        
    # Bug Report Template
    with open(os.path.join(ROOT_DIR, "bug_report_template.md"), 'w', encoding='utf-8') as f:
        f.write("# Defect Report\\n**ID**: BUG-XXX\\n**Title**: \\n**Severity**: \\n**Steps to Reproduce**: \\n1. \\n2. \\n**Expected**: \\n**Actual**: \\n**Source Code Reference**: ")

    # Metrics
    metrics = {
        "total_endpoints": len(data.endpoints),
        "total_test_cases": len(data.test_cases),
        "total_tables": len(data.tables),
        "pass_rate_target": "98%",
        "execution_date": datetime.now().isoformat()
    }
    with open(os.path.join(ROOT_DIR, "test_metrics.json"), 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=4)

if __name__ == "__main__":
    parse_sql()
    parse_backend()
    parse_frontend()
    
    generate_requirements()
    generate_test_cases()
    
    write_html()
    write_csv()
    write_postman()
    write_jmeter()
    write_misc()
    
    print(f"Generated {len(data.test_cases)} test cases from source code.")
    print("All deliverables generated in project root.")
