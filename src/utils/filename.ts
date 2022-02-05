export function filename(str: string): string {
    const sanitized = str
        .replace(/[\/\?<>\\:\*\|":]/g, '')
        .replace(/[\x00-\x1f\x80-\x9f]/g, '')
        .replace(/^\.+$/, '')
        .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '')
        .replace(/\s/gim, '_');
    return sanitized.split('').splice(0, 255).join('');
}
