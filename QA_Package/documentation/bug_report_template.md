# Enterprise QA Defect Report

## Bug ID: BUG-[YEAR]-[MODULE]-[ID]
**Status:** Open | In Progress | Resolved | Closed  
**Reporter:**  
**Date Reported:**  
**Severity:** Critical | High | Medium | Low  
**Priority:** P1 | P2 | P3 | P4  

---

## 1. Description
[Provide a concise description of the issue. E.g., "Participant can submit project after round deadline."]

## 2. Environment
- **OS:** Windows / macOS / iOS / Android
- **Browser:** Chrome v114 / Safari v16 / Firefox v110
- **App Version / Build:** v1.2.0 (Commit SHA: XXXXX)
- **Role:** [E.g., Participant, Judge]

## 3. Steps to Reproduce
1. Log in as a Participant.
2. Navigate to `/dashboard/submissions`.
3. Wait until the Round Deadline has passed.
4. Click **Submit**.

## 4. Expected Result
The system should reject the submission and display a 403 Forbidden error with a "Deadline has passed" message.

## 5. Actual Result
The system accepts the submission and returns 200 OK.

## 6. Source Code / DB Reference
- **Controller:** `SubmissionController.java`
- **API Endpoint:** `POST /api/v1/submissions`
- **Database Table:** `submission`

## 7. Evidence
![Screenshot Placeholder](https://via.placeholder.com/600x400?text=Insert+Screenshot+Here)

*Logs:*
```json
{
  "status": 200,
  "message": "Submission recorded successfully."
}
```

## 8. Root Cause Analysis (Dev Notes)
[To be filled by Developer]

## 9. QA Sign-Off (Verification)
- **Tested By:** 
- **Date Verified:**
- **Regression Impact:** Yes / No
