export function parseUrlHashParams(url: string) {
    const urlHash = new URL(url).hash;
    const urlParams = new URLSearchParams(urlHash.substring(1));

    return Object.fromEntries(urlParams.entries());
}
