import {
  bootstrap,
  InitialData,
  LanguageCode,
} from '@vendure/core';

import { config } from './vendure-config';

const initialData: InitialData = {
  defaultLanguage: LanguageCode.en,
  defaultZone: 'Europe',

  countries: [
    { code: 'AF', name: 'Afghanistan', zone: 'Asia' },
    { code: 'AL', name: 'Albania', zone: 'Europe' },
    { code: 'DZ', name: 'Algeria', zone: 'Africa' },
    { code: 'JO', name: 'Jordan', zone: 'Middle East' },
    { code: 'SA', name: 'Saudi Arabia', zone: 'Middle East' },
    { code: 'AE', name: 'United Arab Emirates', zone: 'Middle East' },
    { code: 'US', name: 'United States', zone: 'North America' },
    { code: 'GB', name: 'United Kingdom', zone: 'Europe' },
    { code: 'DE', name: 'Germany', zone: 'Europe' },
    { code: 'FR', name: 'France', zone: 'Europe' },
  ],

  taxRates: [],
  shippingMethods: [],
  paymentMethods: [],
  collections: [],
  roles: [],
};

async function run() {
  const app = await bootstrap(config);

  const initializer =
    app.get('InitializerService' as any);

  await initializer.populateInitialData(initialData);

  console.log('Countries and zones seeded');

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});