export function formatDate(value, language = 'pt') {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const locale = language === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC' }).format(date);
}

export function getAssetUrl(path) {
  return new URL(`../assets/images/${path}`, import.meta.url).href;
}
