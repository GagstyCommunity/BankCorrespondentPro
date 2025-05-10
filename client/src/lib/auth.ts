import { USER_ROLES, DASHBOARD_PATHS } from "./constants";
import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data.user;
}

export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === USER_ROLES.ADMIN;
}

export function isBankOfficer(user: User | null): boolean {
  return user?.role === USER_ROLES.BANK;
}

export function isCSP(user: User | null): boolean {
  return user?.role === USER_ROLES.CSP;
}

export function isAuditor(user: User | null): boolean {
  return user?.role === USER_ROLES.AUDITOR;
}

export function isFI(user: User | null): boolean {
  return user?.role === USER_ROLES.FI;
}

export function getDashboardPath(role: string): string {
  return DASHBOARD_PATHS[role] || "/dashboard";
}
