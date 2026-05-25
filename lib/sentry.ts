export function init(options?: any) {
  console.log("LOG: [Sentry Mock/No-Op] Sentry.init called (integrations disabled)");
}

export function setupExpressErrorHandler(app: any) {
  console.log("LOG: [Sentry Mock/No-Op] Sentry.setupExpressErrorHandler called (integrations disabled)");
}

export function captureException(err: any) {
  console.log("LOG: [Sentry Mock/No-Op] Sentry.captureException called with error:", err?.message || err);
}
