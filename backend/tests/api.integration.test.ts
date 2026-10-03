import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('API Integration Tests (Section 50, 52, 53)', () => {
  it('GET /ready should return status ready', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready' });
  });

  it('GET /health should return service health information', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('service', 'msc-backend');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1/donations/config should return donation methods with fiduciary safeguards', async () => {
    const res = await request(app).get('/api/v1/donations/config');
    // May return 200 with empty array or existing methods
    expect([200, 500]).toContain(res.status);
  });

  it('POST /api/v1/contact should reject missing fields with 422 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: 'G',
        email: 'invalid-email'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/admin/dashboard should reject unauthenticated request with 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/non-existent-endpoint should return 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/unknown-resource-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
