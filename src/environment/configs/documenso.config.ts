import { DocumensoConfig } from '../interfaces/documenso';

export const documensoConfig = () => ({
  documenso: {
    url: process.env.DOCUMENSO_BASE_URL,
    apiKey: process.env.DOCUMENSO_API_TOKEN,
  } as DocumensoConfig,
});
