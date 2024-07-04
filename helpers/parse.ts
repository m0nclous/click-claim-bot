export function parseBoolean(value: any): boolean {
    return ['true', '1', 'yes'].includes(value?.toLowerCase()?.trim());
}

export const parseNumbers = (value: string): string => {
    return value.replace(/\D/g, '');
};
