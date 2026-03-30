let ready = false;
let bootstrapping = false;
let bootstrapError: string | null = null;

export function markBootstrapping() {
  bootstrapping = true;
  bootstrapError = null;
}

export function markReady() {
  ready = true;
  bootstrapping = false;
  bootstrapError = null;
}

export function markBootstrapFailed(error: unknown) {
  bootstrapping = false;
  bootstrapError = error instanceof Error ? error.message : String(error);
}

export function getBootstrapStatus() {
  return {
    ready,
    bootstrapping,
    error: bootstrapError,
  };
}
