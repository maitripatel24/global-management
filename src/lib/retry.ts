/**
 * Retries a database call a couple of times with a short delay.
 *
 * Neon's free-tier Postgres suspends its compute after a few minutes of
 * inactivity ("scale to zero"). The first request after that has to wait for
 * it to wake up, and occasionally that wait outlasts a single connection
 * attempt and throws instead of just being slow. Retrying rides through that
 * cold-start blip instead of surfacing it to the user as a failure.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientDbError(err) || i === attempts - 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 700 * (i + 1)));
    }
  }
  throw lastError;
}

function isTransientDbError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("Can't reach database server") || message.includes("Connection terminated");
}
