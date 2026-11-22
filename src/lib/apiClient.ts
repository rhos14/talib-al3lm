/// <reference types="vite/client" />

function readViteApiBaseUrl(): string {
  try {
    return (import.meta.env.VITE_API_BASE_URL || '').trim();
  } catch {
    return '';
  }
}

function isDevBuild(): boolean {
  try {
    return Boolean(import.meta.env.DEV);
  } catch {
    return false;
  }
}

function normalizeApiBaseUrl(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(cleaned)) {
    if (isDevBuild()) {
      console.warn('[apiClient] Ignoring invalid VITE_API_BASE_URL (must start with http:// or https://).');
    }
    return '';
  }
  return cleaned;
}

export const API_BASE_URL = normalizeApiBaseUrl(readViteApiBaseUrl());

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export function getResolvedApiOrigin(): string {
  if (API_BASE_URL) return API_BASE_URL;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
