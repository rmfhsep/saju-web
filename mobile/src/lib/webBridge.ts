import { WEB_URL } from '../config/env';

export const SCREEN_PATHS: Record<string, string> = {
  BirthInfo: '/onboarding/birth-info',
  SajuResult: '/onboarding/result',
  MatchPreview: '/onboarding/matches',
  Blocking: '/onboarding/blocking',
  ProfileSetup: '/onboarding/profile',
  Filter: '/onboarding/filter',
};

export function buildUrl(path: string, params?: Record<string, string>): string {
  const base = WEB_URL.endsWith('/') ? WEB_URL.slice(0, -1) : WEB_URL;
  const url = `${base}${path}`;
  if (!params || Object.keys(params).length === 0) return url;
  const qs = new URLSearchParams(params).toString();
  return `${url}?${qs}`;
}
