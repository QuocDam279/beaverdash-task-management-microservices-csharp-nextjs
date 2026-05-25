/**
 * TypeScript interfaces for Identity and Authentication
 * Mapped from IdentityService and PM.Domain.Entities.User
 */

export interface User {
  id: string; // UUID
  googleId?: string | null; // From IdentityService
  email: string;
  displayName: string;
  avatar: string | null;
  createdAt?: string; // ISO Date String
  updatedAt?: string; // ISO Date String
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  displayName: string;
  exp: number; // Expiry timestamp
}
