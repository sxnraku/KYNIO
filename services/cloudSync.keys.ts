export function fastKey(startTime: number, endTime: number): string {
  return `${startTime}:${endTime}`;
}

export function mealKey(timestamp: number): string {
  return String(timestamp);
}

export function workoutKey(timestamp: number): string {
  return String(timestamp);
}

export function weightKey(timestamp: number): string {
  return String(timestamp);
}
