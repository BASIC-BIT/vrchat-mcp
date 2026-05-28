function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function toolName(name: string): string {
  return sanitize(name.replace(/\./g, '_'));
}
