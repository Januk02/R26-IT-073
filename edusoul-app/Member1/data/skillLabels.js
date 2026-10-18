// Format display labels while preserving the identifiers used by the API.
export const skillLabel = key => key.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
