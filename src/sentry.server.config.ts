// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay sessions
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay on errors
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  
  // Release for version tracking
  release: process.env.SENTRY_RELEASE || undefined,

  // Filter out some expected errors in development
  beforeSend(event, hint) {
    // In development, skip certain expected errors
    if (process.env.NODE_ENV === 'development') {
      // Skip validation errors in dev (they're part of normal operation)
      if (event.exception?.values?.[0]?.type === 'ValidationError') {
        return null;
      }
    }
    return event;
  },

  // Before send transaction for performance filtering
  beforeSendTransaction(event) {
    // Filter out health check and heartbeat transactions
    const transactionName = event.transaction;
    if (transactionName?.includes('health') || transactionName?.includes('ping')) {
      return null;
    }
    return event;
  },

  // Integrations (v8 API - server-side: HTTP tracing)
  integrations: [
    Sentry.httpIntegration(),
  ],

  // Attach request data to errors
  attachStacktrace: true,
});