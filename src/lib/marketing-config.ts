export const config = {
  env: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    mockMode: process.env.NODE_ENV !== 'production'
      ? process.env.KQ_MOCK_MODE === 'true'
      : false,
  },
  app: {
    businessName: 'KQ Collective',
    defaultCtaLabel: 'Register interest',
    defaultCtaHref: '/contact',
    gstRate: 0.1,
  },
} as const;