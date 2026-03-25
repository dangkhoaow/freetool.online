export class NotFoundRouteError extends Error {
  constructor(message = 'Route not found') {
    super(message);
    this.name = 'NotFoundRouteError';
  }
}

export class RedirectRouteError extends Error {
  target: string;

  constructor(target: string, message = 'Route redirect requested') {
    super(message);
    this.name = 'RedirectRouteError';
    this.target = target;
  }
}

export function isNotFoundRouteError(error: unknown): error is NotFoundRouteError {
  return error instanceof NotFoundRouteError;
}
