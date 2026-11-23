import { EVENT_TIME_ZONE, parseEventDate } from './eventDate.js';
export function formatDate(value, language = 'pt') {
  if (!value) {
    return '-';
  }

  const date = parseEventDate(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const locale = language === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(locale, { timeZone: EVENT_TIME_ZONE }).format(date);
}

export function getAssetUrl(path) {
  return new URL(`../assets/images/${path}`, import.meta.url).href;
}
