import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../src/utils/jwt.js';
import { UserRole, ROLE_PERMISSIONS } from '../src/types/index.js';

describe('Authentication & JWT Utilities (Section 6, 7, 8)', () => {
  const mockUser = {
    id: 'user-test-uuid-1234',
    email: 'admin@mwanchasenior.org',
    role: 'SUPER_ADMIN' as UserRole,
    name: 'Lead Administrator'
  };

  it('should sign and verify valid access token with correct permissions', () => {
    const token = signAccessToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockUser.id);
    expect(decoded?.email).toBe(mockUser.email);
    expect(decoded?.role).toBe('SUPER_ADMIN');
    expect(decoded?.permissions).toEqual(ROLE_PERMISSIONS.SUPER_ADMIN);
  });

  it('should sign and verify refresh token', () => {
    const refreshToken = signRefreshToken(mockUser);
    expect(refreshToken).toBeDefined();

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockUser.id);
    expect(decoded?.email).toBe(mockUser.email);
  });

  it('should reject invalid or tampered access token', () => {
    const tampered = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token';
    const result = verifyAccessToken(tampered);
    expect(result).toBeNull();
  });
});
