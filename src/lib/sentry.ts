/**
 * Sentry utility for centralized error capturing with context
 * Provides consistent error tracking across the application
 */

import * as Sentry from '@sentry/nextjs';
import type { User } from '@supabase/supabase-js';

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string | number | boolean>;
    extra?: Record<string, unknown>;
    level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
    user?: UserContext;
  }
): void {
  Sentry.withScope((scope) => {
    // Add tags for filtering and grouping
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }

    // Add extra data for debugging
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Set severity level
    if (context?.level) {
      scope.setLevel(context.level);
    }

    // Set user context
    if (context?.user) {
      setUserContext(context.user);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a message (non-exception event)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: {
    tags?: Record<string, string | number | boolean>;
    extra?: Record<string, unknown>;
    user?: UserContext;
  }
): void {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.user) {
      setUserContext(context.user);
    }

    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: UserContext): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    ...(user.role && { role: user.role }),
    ...(user.ipAddress && { ip_address: user.ipAddress }),
  });

  // Store user ID in localStorage for client-side persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('sentry_user_id', user.id);
  }
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sentry_user_id');
  }
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug',
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): ReturnType<typeof Sentry.startSpan> {
  return Sentry.startSpan({ name, op }, () => {});
}

/**
 * Context types
 */
export type UserContext = {
  id: string;
  email?: string;
  role?: string;
  ipAddress?: string;
};

/**
 * API request context for error tracking
 */
export type RequestContext = {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
  userId?: string;
};

/**
 * Capture API error with request context
 */
export function captureApiError(
  error: Error | unknown,
  requestContext: RequestContext,
  context?: Omit<Parameters<typeof captureException>[1], 'extra'>
): void {
  captureException(error, {
    ...context,
    tags: {
      ...(context && 'tags' in context && context.tags && typeof context.tags === 'object'
        ? context.tags as Record<string, string | number | boolean>
        : {}),
      api_method: requestContext.method,
      api_path: requestContext.path,
    },
    extra: {
      request: {
        method: requestContext.method,
        path: requestContext.path,
        query: requestContext.query,
        body: requestContext.body,
      },
      user_id: requestContext.userId,
    },
  });
}

/**
 * Capture database error with query context
 */
export function captureDatabaseError(
  error: Error | unknown,
  context?: {
    operation?: 'select' | 'insert' | 'update' | 'delete' | 'transaction';
    table?: string;
    query?: string;
    userId?: string;
  }
): void {
  captureException(error, {
    tags: {
      database: true,
      ...(context?.operation != null && { operation: context.operation }),
      ...(context?.table != null && { table: context.table }),
    },
    extra: {
      ...context,
      query: context?.query,
    },
    level: 'error',
  });
}

/**
 * Capture authentication error
 */
export function captureAuthError(
  error: Error | unknown,
  context?: {
    operation?: 'login' | 'logout' | 'refresh' | 'verify';
    email?: string;
    reason?: string;
  }
): void {
  captureException(error, {
    tags: {
      auth: true,
      ...(context?.operation != null && { operation: context.operation }),
    },
    extra: {
      email: context?.email,
      reason: context?.reason,
    },
    level: 'warning',
  });
}

/**
 * Track custom business events (non-errors)
 */
export function trackEvent(
  name: string,
  data?: Record<string, unknown>,
  context?: UserContext
): void {
  Sentry.withScope((scope) => {
    if (context) {
      setUserContext(context);
    }
    scope.setExtra('event_data', data);
    Sentry.captureMessage(`Event: ${name}`, 'info');
  });
}

/**
 * Invoice generation tracking
 */
export function trackInvoiceGeneration(
  context: {
    invoiceNumber?: string;
    clientId?: string;
    sessionCount?: number;
    totalAmount?: number;
    userId?: string;
  }
): void {
  Sentry.startSpanManual(
    {
      name: 'invoice_generation',
      op: 'business.invoice.generate',
      attributes: {
        session_count: context.sessionCount,
        total_amount: context.totalAmount,
      },
    },
    (span) => {
      addBreadcrumb(
        `Invoice ${context.invoiceNumber} generated`,
        'invoice',
        'info',
        {
          invoice_number: context.invoiceNumber,
          client_id: context.clientId,
          session_count: context.sessionCount,
          total_amount: context.totalAmount,
        }
      );

      if (context.userId) {
        setUserContext({ id: context.userId });
      }

      span.end();
    }
  );
}