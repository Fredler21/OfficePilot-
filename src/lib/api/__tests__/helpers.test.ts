import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiSuccess, apiError, getUserId } from '../helpers';
import { ValidationError, AuthError, NotFoundError, AppError } from '@/lib/errors';

describe('API Helpers', () => {
  describe('apiSuccess', () => {
    it('returns a success envelope', async () => {
      const response = apiSuccess({ items: [1, 2, 3] }, { total: 3 });
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.items).toEqual([1, 2, 3]);
      expect(json.meta?.total).toBe(3);
    });

    it('includes empty errors/warnings arrays', async () => {
      const response = apiSuccess('hello');
      const json = await response.json();
      expect(json.errors).toEqual([]);
      expect(json.warnings).toEqual([]);
    });
  });

  describe('apiError', () => {
    it('returns correct status for ValidationError', async () => {
      const response = apiError(new ValidationError('Bad input'));
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.errors[0].message).toBe('Bad input');
    });

    it('returns 404 for NotFoundError', async () => {
      const response = apiError(new NotFoundError('Not found'));
      expect(response.status).toBe(404);
    });

    it('returns 401 for AuthError', async () => {
      const response = apiError(new AuthError('Unauthorized'));
      expect(response.status).toBe(401);
    });

    it('returns 500 for unknown errors', async () => {
      const response = apiError(new Error('something broke'));
      expect(response.status).toBe(500);
    });
  });

  describe('getUserId', () => {
    it('extracts user id from headers', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { 'x-user-id': 'user-123' },
      });
      expect(getUserId(request)).toBe('user-123');
    });

    it('returns default-user when header is missing', () => {
      const request = new Request('http://localhost/api/test');
      expect(getUserId(request)).toBe('default-user');
    });
  });
});
