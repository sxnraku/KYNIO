export type FastingStartParseError =
  | 'future'
  | 'invalid-date'
  | 'invalid-time';

export type FastingStartParseResult =
  | { error: null; timestamp: number }
  | { error: FastingStartParseError; timestamp: null };

const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatFastingStartDateEntry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatFastingStartTimeEntry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function formatFastingStartDate(timestamp: number): string {
  const date = new Date(timestamp);

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatFastingStartTime(timestamp: number): string {
  const date = new Date(timestamp);

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseFastingStartDateTime(
  dateInput: string,
  timeInput: string,
  now: number = Date.now(),
): FastingStartParseResult {
  const dateMatch = DATE_PATTERN.exec(dateInput.trim());

  if (!dateMatch) {
    return { error: 'invalid-date', timestamp: null };
  }

  const timeMatch = TIME_PATTERN.exec(timeInput.trim());

  if (!timeMatch) {
    return { error: 'invalid-time', timestamp: null };
  }

  const day = Number(dateMatch[1]);
  const monthIndex = Number(dateMatch[2]) - 1;
  const year = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59) {
    return { error: 'invalid-time', timestamp: null };
  }

  const selectedDate = new Date(year, monthIndex, day, hours, minutes, 0, 0);
  const timestamp = selectedDate.getTime();
  const hasMatchingDate =
    Number.isFinite(timestamp) &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === monthIndex &&
    selectedDate.getDate() === day;

  if (!hasMatchingDate) {
    return { error: 'invalid-date', timestamp: null };
  }

  if (timestamp > now) {
    return { error: 'future', timestamp: null };
  }

  return { error: null, timestamp };
}
