import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiting (for single-instance deployments)
 * For multi-instance, use Redis or Upstash
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, ClientRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Cleanup old records every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count < this.config.maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const record = this.store.get(identifier);
    if (!record) return this.config.maxRequests;

    const now = Date.now();
    if (now > record.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const record = this.store.get(identifier);
    return record?.resetTime || Date.now();
  }

  /**
   * Cleanup expired records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Default rate limiter instances
 */
const apiLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

const authLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

const bigqueryLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Middleware: Apply rate limiting
 */
export function rateLimit(
  limiter: RateLimiter,
  responseCode: number = 429
) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const identifier = getClientIdentifier(request);

      if (!limiter.isAllowed(identifier)) {
        const resetTime = limiter.getResetTime(identifier);
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: responseCode,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(resetTime),
            },
          }
        );
      }

      // Attach rate limit info to request
      (request as any).rateLimit = {
        remaining: limiter.getRemaining(identifier),
        reset: limiter.getResetTime(identifier),
      };

      const response = await handler(request);

      // Add rate limit headers to response
      response.headers.set(
        'X-RateLimit-Remaining',
        String(limiter.getRemaining(identifier))
      );
      response.headers.set(
        'X-RateLimit-Reset',
        String(limiter.getResetTime(identifier))
      );

      return response;
    };
  };
}

export { apiLimiter, authLimiter, bigqueryLimiter, RateLimiter };
