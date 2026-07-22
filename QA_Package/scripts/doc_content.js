module.exports = {
    getChapterContent: function(chapterTitle) {
        switch(chapterTitle) {
            case "PROJECT OVERVIEW":
                return [
                    "System Name: SEAL Hackathon Platform",
                    "Business Purpose: To facilitate end-to-end hackathon management, including team formation, submissions, mentoring, and grading.",
                    "Target Users: Administrators, Organizers, Judges, Mentors, and Participants.",
                    "Main Features: Role-Based Access Control, Real-time Leaderboards, Team Invitations, Code Submissions, Automated Event Timelines.",
                    "Technology Stack: Java Spring Boot (Backend), React/Vite (Frontend), MySQL 8.0 (Database), Playwright (E2E Testing), JUnit/Mockito (Unit Testing).",
                    "Architecture Overview: A decoupled client-server architecture relying on stateless REST APIs secured by JWT tokens.",
                    "Project Structure: A monorepo containing distinct 'backend', 'frontend', and 'QA_Package' directories, enforcing strict separation of concerns."
                ];
            case "SYSTEM ARCHITECTURE ANALYSIS":
                return [
                    "The system architecture follows a classic layered MVC approach on the backend, communicating with a modern SPA frontend.",
                    "Component Description:",
                    "- Frontend (React): Manages the presentation layer, client-side routing, and state (via Context API).",
                    "- REST API: Stateless integration layer exposing JSON endpoints.",
                    "- Controller Layer (Spring MVC): Handles HTTP requests, enforces payload validation (@Valid), and delegates business logic.",
                    "- Service Layer: Contains all business logic, transaction management (@Transactional), and orchestration.",
                    "- Repository Layer (Spring Data JPA): Abstracts the database interactions and ORM mapping.",
                    "- Database (MySQL): Persists state ensuring ACID properties.",
                    "Communication Flow: Client -> HTTPS -> Controller -> Service -> Repository -> Database."
                ];
            case "SOURCE CODE STRUCTURE ANALYSIS":
                return [
                    "The source code is strictly organized into distinct packages following domain-driven design principles.",
                    "Backend Packages:",
                    "- controller: Exposes REST APIs.",
                    "- service: Implements core business logic.",
                    "- repository: Database access via JPA interfaces.",
                    "- entity: Hibernate mapped domain models.",
                    "- dto: Data Transfer Objects to decouple internal entities from the API.",
                    "- config: System configurations (CORS, Swagger).",
                    "- security: Spring Security filters and JWT utilities.",
                    "Frontend Directories:",
                    "- components: Reusable UI widgets.",
                    "- pages: Stateful routed views.",
                    "- services: Axios-based API wrappers.",
                    "- hooks: Custom React hooks.",
                    "- routes: Application navigation definitions."
                ];
            case "CLASS / PACKAGE DIAGRAM":
                return [
                    "The class diagram extracts the structural relationships between the primary backend components.",
                    "Each entity (e.g., User, Team, Submission) follows a strict vertical slice: Entity -> Repository -> Service -> Controller.",
                    "Dependencies are injected via Spring's IoC container (constructor injection), ensuring high testability."
                ];
            case "DATABASE ANALYSIS":
                return [
                    "The database schema is heavily relational, utilizing foreign keys to enforce strict data integrity.",
                    "The ERD demonstrates the core relationships, for example: User (1:N) Team (1:N) Submission."
                ];
            case "USER FLOW ANALYSIS":
                return [
                    "User flows dictate the state transitions within the application.",
                    "The core flows documented include Authentication (Login/Register) and Role Routing."
                ];
            case "SECURITY ANALYSIS":
                return [
                    "Security is implemented using Spring Security with stateless JWT (JSON Web Tokens).",
                    "Authentication Mechanism: Users submit credentials to /api/v1/auth/login. The AuthenticationManager validates against the database. If successful, JwtUtils generates an access token.",
                    "JWT Handling: Tokens are validated on every subsequent request via a custom OncePerRequestFilter.",
                    "Roles: ADMIN, ORGANIZER, JUDGE, MENTOR, PARTICIPANT.",
                    "Permissions: Enforced via @PreAuthorize annotations on the service and controller methods."
                ];
            case "MODULE DEPENDENCY ANALYSIS":
                return [
                    "The system is divided into several cohesive modules.",
                    "Dependencies flow from core modules (User Management) out to specialized modules (Leaderboard).",
                    "This prevents circular dependencies and allows for isolated module testing."
                ];
            case "TEST STRATEGY":
                return [
                    "Testing Scope: API integration, E2E UI, Security, and Database schema validation.",
                    "Testing Objective: Ensure zero critical security flaws, 100% requirement traceability, and robust E2E automation.",
                    "Testing Types:",
                    "- Functional Testing: Validating business logic.",
                    "- Integration Testing: Validating Database/API contracts.",
                    "- API Testing: Validating REST endpoints via Postman.",
                    "- UI Testing: Validating the React frontend via Playwright.",
                    "- Regression Testing: Automated pipelines to prevent regressions.",
                    "- Security Testing: OWASP validation.",
                    "- Performance Testing: Load limits via JMeter.",
                    "- Usability & Compatibility Testing: Cross-browser checks."
                ];
            case "MASTER TEST PLAN":
                return [
                    "Test Approach: Agile shift-left testing. Automation-first methodology.",
                    "Test Environment: Staging environment mirroring production configurations.",
                    "Testing Schedule: Aligned with two-week sprint cycles.",
                    "Roles and Responsibilities: QA Lead architects the strategy; QA Engineers develop Playwright scripts.",
                    "Entry Criteria: Code merged, CI built, and environments deployed.",
                    "Exit Criteria: 100% execution coverage, 95% pass rate, zero Critical defects.",
                    "Risk Management: Known risks include API rate limiting and database deadlocks. Mitigated via JMeter stress testing.",
                    "Defect Management: Bugs tracked via Jira, categorized by Severity and Priority."
                ];
            case "AUTOMATION TEST DESIGN":
                return [
                    "The automation framework is built on Playwright (TypeScript).",
                    "Architecture: Playwright Tool -> Chromium Browser -> Frontend SPA -> API -> DB.",
                    "UI Automation Strategy: Utilizes Page Object Model (POM) to abstract locators and actions, ensuring low maintenance.",
                    "API Automation Strategy: Postman Collections executed via Newman CLI.",
                    "CI/CD Integration: Configured to run in headless mode on every pull request to the main branch."
                ];
            case "PERFORMANCE TEST PLAN":
                return [
                    "Performance Strategy: Validate the system's resilience under heavy hackathon loads.",
                    "Load Testing: Simulating 500 concurrent users registering teams.",
                    "Stress Testing: Pushing past 1000 users to identify breaking points.",
                    "Endurance Testing: Running nominal load for 24 hours to detect memory leaks.",
                    "Critical APIs: /login, /team/join, /submission/upload.",
                    "Metrics: 95th percentile response time must be < 200ms."
                ];
            case "SECURITY TESTING":
                return [
                    "Security Checklist (OWASP Focus):",
                    "- Authentication: Brute-force protection, secure password hashing (BCrypt).",
                    "- Authorization: Insecure Direct Object Reference (IDOR) prevention.",
                    "- JWT: Token expiration, strong signing keys, secure transmission.",
                    "- SQL Injection: Prevented via JPA parameterization.",
                    "- XSS: React auto-escaping, input sanitization.",
                    "- CSRF: Handled via stateless JWT architecture.",
                    "- Sensitive Data: Passwords and OTPs are never exposed in API responses."
                ];
            case "DEFECT MANAGEMENT":
                return [
                    "Severity Definition: Critical (System Crash), High (Core feature broken), Medium (Workaround available), Low (Cosmetic).",
                    "Priority Definition: P1 (Immediate fix), P2 (Next release), P3 (Backlog).",
                    "Bug Report Template: Title, Description, Steps to Reproduce, Expected Result, Actual Result, Environment, Attached Logs/Screenshots."
                ];
            case "UI TEST EVIDENCE":
                return [
                    "Note: UI Screenshots cannot be determined as the frontend server is currently offline.",
                    "In a live execution environment, Playwright automatically captures full-page screenshots and video artifacts during failure states."
                ];
            default:
                return [];
        }
    }
};
