export interface DocumensoConfig {
  url: string;
  apiKey: string;
  meta: {
    signing_order: 'PARALLEL' | 'SEQUENTIAL';
  };
}
