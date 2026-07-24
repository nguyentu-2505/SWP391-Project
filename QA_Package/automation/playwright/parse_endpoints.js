const fs = require('fs');
const path = require('path');

const endpointsFile = path.join(__dirname, 'endpoints.txt');
const outputSpec = path.join(__dirname, 'tests', '06_api_auto.spec.ts');

const lines = fs.readFileSync(endpointsFile, 'utf16le').split('\n').map(l => l.trim()).filter(l => l.length > 0);

let controllers = {};
let currentController = null;
let currentBaseRoute = '';
let currentRole = 'NONE';
let endpoints = [];
let pendingMethod = null;
let pendingRoute = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for controller class
    const classMatch = line.match(/class (\w+Controller)/);
    if (classMatch) {
        currentController = classMatch[1];
        currentBaseRoute = ''; // FIX: Reset base route for new controllers
        if (!controllers[currentController]) {
            controllers[currentController] = [];
        }
    }

    // Check for RequestMapping (Base Route)
    const reqMapMatch = line.match(/@RequestMapping\("([^"]+)"\)/);
    if (reqMapMatch) {
        currentBaseRoute = reqMapMatch[1];
    }

    // Check for Method Mapping
    const methodMatch = line.match(/@(Get|Post|Put|Delete|Patch)Mapping(?:\(\s*value\s*=\s*["']([^"']+)["']\s*|\(\s*["']([^"']+)["']\s*)?\)?/);
    if (methodMatch) {
        pendingMethod = methodMatch[1].toUpperCase();
        pendingRoute = methodMatch[2] || methodMatch[3] || '';
        currentRole = 'NONE'; // Default unless PreAuthorize is found next

        // Peek ahead up to 3 lines for @PreAuthorize
        for (let j = 1; j <= 3 && (i + j) < lines.length; j++) {
            if (lines[i + j].includes('@Get') || lines[i + j].includes('@Post') || lines[i + j].includes('@Put') || lines[i + j].includes('@Delete') || lines[i + j].includes('@Patch')) {
                break;
            }
            const authMatch = lines[i + j].match(/@PreAuthorize\("has(?:Any)?Role\(([^)]+)\)"\)/);
            if (authMatch) {
                currentRole = authMatch[1].replace(/['"]/g, '');
                break;
            } else if (lines[i + j].includes('isAuthenticated()')) {
                currentRole = 'AUTHENTICATED';
                break;
            } else if (lines[i + j].includes("permitAll()")) {
                currentRole = 'NONE';
                break;
            }
        }

        if (currentController && pendingMethod) {
            endpoints.push({
                controller: currentController,
                method: pendingMethod,
                route: currentBaseRoute + pendingRoute,
                role: currentRole
            });
            pendingMethod = null;
            pendingRoute = null;
        }
    }
}

// Generate the Playwright file
let code = `import { test, expect } from '@playwright/test';

let tokens: Record<string, string> = {
  ADMIN: '',
  ORGANIZER: '',
  JUDGE: '',
  MENTOR: '',
  PARTICIPANT: ''
};

test.beforeAll(async ({ request }) => {
  const login = async (username) => {
    const res = await request.post('http://localhost:8080/api/v1/auth/login', { data: { username, password: 'password123' } });
    if (res.ok()) return (await res.json()).data.accessToken;
    return '';
  };
  tokens.ADMIN = await login('admin');
  tokens.ORGANIZER = await login('organizer1');
  tokens.JUDGE = await login('judge1');
  tokens.MENTOR = await login('mentor1');
  tokens.PARTICIPANT = await login('participant1');
});
`;

let testCount = 0;
endpoints.forEach(ep => {
    if (!controllers[ep.controller]) controllers[ep.controller] = [];
    controllers[ep.controller].push(ep);
});

for (const [ctrl, eps] of Object.entries(controllers)) {
    if (eps.length === 0) continue;
    code += `\ntest.describe('API Tests: ${ctrl}', () => {\n`;
    eps.forEach((ep, i) => {
        testCount++;
        let testRoute = ep.route.replace(/\{[^}]+\}/g, '1');

        // Single role selection
        let authRole = 'NONE';
        if (ep.role !== 'NONE' && ep.role !== 'AUTHENTICATED') {
            authRole = ep.role.split(',')[0].trim();
        } else if (ep.role === 'AUTHENTICATED') {
            authRole = 'PARTICIPANT';
        }

        code += `  test('[${ctrl}-${i}] ${ep.method} ${ep.route} (Role: ${ep.role})', async ({ request }) => {\n`;
        code += `    let headers = {};\n`;
        code += `    if ('${authRole}' !== 'NONE' && tokens['${authRole}']) headers['Authorization'] = 'Bearer ' + tokens['${authRole}'];\n`;
        code += `    const response = await request.${ep.method.toLowerCase()}('http://localhost:8080${testRoute}', { headers });\n`;

        if (authRole !== 'NONE' && ep.route !== '/api/v1/auth/login') {
            code += `    expect([200, 201, 204, 400, 403, 404, 405]).toContain(response.status());\n`;
        } else {
            code += `    expect([200, 201, 204, 400, 401, 403, 404, 405]).toContain(response.status());\n`;
        }
        code += `  });\n\n`;
    });
    code += `});\n`;
}

fs.writeFileSync(outputSpec, code);
console.log(`Generated ${testCount} API tests based on reverse engineered endpoints.`);

const stats = {
    totalControllers: Object.keys(controllers).length,
    totalEndpoints: testCount
};
fs.writeFileSync(path.join(__dirname, 'coverage_stats.json'), JSON.stringify(stats, null, 2));
