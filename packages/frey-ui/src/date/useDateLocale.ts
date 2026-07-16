import { useSyncExternalStore } from 'react';
import { resolveDateLocale } from './dateLocale';

function subscribeToLocale(): () => void {
  return () => undefined;
}

function getBrowserLocale(): string {
  return typeof navigator === 'undefined' || navigator.language.length === 0
    ? 'en-US'
    : navigator.language;
}

function getServerLocale(): string {
  return 'en-US';
}

export function useDateLocale(locale?: string): string {
  const browserLocale = useSyncExternalStore(
    subscribeToLocale,
    getBrowserLocale,
    getServerLocale
  );
  return resolveDateLocale(locale ?? browserLocale);
}
