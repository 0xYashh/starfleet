import DodoPayments from 'dodopayments';

const apiKey = process.env.DODO_PAYMENTS_API_KEY || process.env.DODO_API_KEY;

if (!apiKey) {
  throw new Error('DODO_PAYMENTS_API_KEY or DODO_API_KEY environment variable is required');
}

console.log('🔑 DodoPayments client initialized with key:', apiKey.substring(0, 10) + '...');

export const dodoPayments = new DodoPayments({
    bearerToken: apiKey,
    environment: 'test_mode',
});
