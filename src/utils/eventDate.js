export const EVENT_TIME_ZONE = 'America/Sao_Paulo';

export function parseEventDate(value) {
  if (!value) return new Date(NaN);
  const text = String(value);
  // Legacy responses without an offset represent civil time in Sao Paulo.
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(text)
    ? text
    : `${text.includes('T') ? text : `${text}T00:00:00`}-03:00`);
}

export function eventDateParts(value) {
  const date = parseEventDate(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find(part => part.type === type).value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}
