import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthUser, UserRole, ROLE_PERMISSIONS } from '../types/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export const signAccessToken = (user: { id: string; email: string; role: UserRole; name: string }): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m'
  });
};

export const signRefreshToken = (user: { id: string; email: string; role: UserRole; name: string }): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyAccessToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      permissions: ROLE_PERMISSIONS[decoded.role] || []
    };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};
