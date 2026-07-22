import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('[TC-0001] Call GET /api/v1/audit-logs as ADMIN', async ({ request }) => {
    // Attempting to hit the backend which might be down, to generate a real failure/success result.
    const response = await request.get('http://localhost:8080/api/v1/audit-logs', {
      headers: { Authorization: 'Bearer MOCK_ADMIN_TOKEN' }
    });
    // We expect a 200 OK
    expect(response.status()).toBe(200);
  });

  test('[TC-0006] Call GET /api/v1/audit-logs as UNAUTHENTICATED', async ({ request }) => {
    const response = await request.get('http://localhost:8080/api/v1/audit-logs');
    // We expect a 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});
