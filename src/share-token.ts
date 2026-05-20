import { createHmac, timingSafeEqual } from "node:crypto";

export type SharePayload = {
  workflow: string;
  runId: string;
  /** Epoch milliseconds — token is rejected if `expiresAt < now`. */
  expiresAt: number;
};

/**
 * Token format: `v1.<base64url-json-payload>.<base64url-hmac-sig>`.
 *
 * Version prefix lets us rotate the signing scheme later without breaking
 * existing tokens silently — `verifyShareToken` returns null on version
 * mismatch and the user has to re-create the share URL.
 */
const TOKEN_VERSION = "v1";

/** Default lifetime — spec § 5 옵션 2: "서명 토큰 URL (만료 1시간)". */
export const DEFAULT_TTL_MS = 60 * 60 * 1000;

export function generateShareToken(
  payload: SharePayload,
  secret: string,
): string {
  if (secret.length === 0) {
    throw new Error("share token secret must not be empty");
  }
  const body = encodeBase64Url(
    Buffer.from(JSON.stringify(payload), "utf8"),
  );
  const sig = sign(body, secret);
  return `${TOKEN_VERSION}.${body}.${sig}`;
}

/**
 * Returns the payload if the token is well-formed, signed by `secret`, and
 * not expired (as of `now`). Returns null otherwise — callers should treat
 * null as "show the user a 404", not "log a security alert" (a casual user
 * pasting an old or trimmed URL is the most common cause).
 */
export function verifyShareToken(
  token: string,
  secret: string,
  now: number = Date.now(),
): SharePayload | null {
  if (secret.length === 0) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [version, body, sig] = parts;
  if (version !== TOKEN_VERSION) return null;
  if (!body || !sig) return null;

  const expectedSig = sign(body, secret);

  // Constant-time comparison to avoid timing attacks. Buffers must be the
  // same length for timingSafeEqual to not throw; we reject mismatched
  // lengths upfront (rare and not an attacker advantage).
  const sigBuf = Buffer.from(sig, "base64url");
  const expectedBuf = Buffer.from(expectedSig, "base64url");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!isSharePayload(payload)) return null;
  if (payload.expiresAt < now) return null;

  return payload;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${TOKEN_VERSION}.${body}`)
    .digest("base64url");
}

function encodeBase64Url(buf: Buffer): string {
  return buf.toString("base64url");
}

function isSharePayload(value: unknown): value is SharePayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.workflow === "string" &&
    typeof v.runId === "string" &&
    typeof v.expiresAt === "number" &&
    Number.isFinite(v.expiresAt)
  );
}
