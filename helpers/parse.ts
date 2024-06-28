export function parseBoolean(value: any): boolean {
    return ['true', '1', 'yes'].includes(value?.toLowerCase()?.trim());
}
