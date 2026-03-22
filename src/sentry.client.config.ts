// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
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
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,

  // Trace propagation for distributed tracing
  tracePropagationTargets: [
    'localhost',
    /^\//,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter(Boolean) as (string | RegExp)[],

  // Filter out client-side errors
  beforeSend(event, hint) {
    // Ignore errors from browser extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(frame =>
      frame.filename?.includes('extension') || frame.filename?.includes('chrome-extension')
    )) {
      return null;
    }

    // Ignore ResizeObserver errors (common browser quirks)
    if (event.message?.includes('ResizeObserver')) {
      return null;
    }

    return event;
  },

  // Integrations
  integrations: [
    // Browser profiling (v8 API)
    Sentry.browserTracingIntegration(),
    // Replay for session recording (v8 API)
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Attach stack traces
  attachStacktrace: true,

  // Set user context from localStorage if available (for Supabase auth)
  initialScope: (scope) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('sentry_user_id') : null;
    if (userId) {
      scope.setUser({ id: userId });
    }
    return scope;
  },
});