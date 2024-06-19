import { NormalizedOptions as NormalizedOptionsOriginal } from 'ky';

export interface NormalizedOptions extends NormalizedOptionsOriginal {
    searchParams?: URLSearchParams;
}
