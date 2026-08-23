export type LegalDocument = 'account-deletion' | 'privacy' | 'support' | 'terms';

const DEFAULT_LEGAL_BASE_URL = 'https://sxnraku.github.io/KYNIO';

export function getLegalDocumentUrl(document: LegalDocument): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_LEGAL_BASE_URL?.trim();
  const baseUrl = (configuredBaseUrl || DEFAULT_LEGAL_BASE_URL).replace(/\/$/, '');
  return `${baseUrl}/${document}.html`;
}
