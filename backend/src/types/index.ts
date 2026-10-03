import { Request } from 'express';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'CONTENT_ADMIN'
  | 'EDITOR'
  | 'REVIEWER'
  | 'FORM_MANAGER';

export type Permission =
  | 'CONTENT_CREATE'
  | 'CONTENT_READ'
  | 'CONTENT_UPDATE'
  | 'CONTENT_DELETE'
  | 'CONTENT_REVIEW'
  | 'CONTENT_APPROVE'
  | 'CONTENT_PUBLISH'
  | 'MEDIA_MANAGE'
  | 'FORM_READ'
  | 'FORM_UPDATE'
  | 'USER_MANAGE'
  | 'AUDIT_READ'
  | 'SETTINGS_MANAGE';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'CONTENT_CREATE',
    'CONTENT_READ',
    'CONTENT_UPDATE',
    'CONTENT_DELETE',
    'CONTENT_REVIEW',
    'CONTENT_APPROVE',
    'CONTENT_PUBLISH',
    'MEDIA_MANAGE',
    'FORM_READ',
    'FORM_UPDATE',
    'USER_MANAGE',
    'AUDIT_READ',
    'SETTINGS_MANAGE'
  ],
  CONTENT_ADMIN: [
    'CONTENT_CREATE',
    'CONTENT_READ',
    'CONTENT_UPDATE',
    'CONTENT_DELETE',
    'CONTENT_REVIEW',
    'CONTENT_APPROVE',
    'CONTENT_PUBLISH',
    'MEDIA_MANAGE',
    'FORM_READ',
    'FORM_UPDATE',
    'AUDIT_READ'
  ],
  EDITOR: [
    'CONTENT_CREATE',
    'CONTENT_READ',
    'CONTENT_UPDATE',
    'MEDIA_MANAGE'
  ],
  REVIEWER: [
    'CONTENT_READ',
    'CONTENT_REVIEW',
    'CONTENT_APPROVE'
  ],
  FORM_MANAGER: [
    'FORM_READ',
    'FORM_UPDATE'
  ]
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
