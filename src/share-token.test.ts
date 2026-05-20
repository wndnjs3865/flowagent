import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  DEFAULT_TTL_MS,
  generateShareToken,
  verifyShareToken,
  type SharePayload,
} from "./share-token";

const SECRET = "test-secret-do-not-use-in-prod";

function makePayload(overrides?: Partial<SharePayload>): SharePayload {
  return {
    workflow: "sales-summary",
    runId: "sales-summary-2026-05-20T09-00-00-000Z-abc",
    expiresAt: Date.now() + DEFAULT_TTL_MS,
    ...overrides,
  };
}

describe("generateShareToken / verifyShareToken", () => {
  it("round-trips a valid payload back through verify", () => {
    const payload = makePayload();
    const token = generateShareToken(payload, SECRET);
    const verified = verifyShareToken(token, SECRET);

    expect(verified).not.toBeNull();
    expect(verified).toEqual(payload);
  });

  it("produces a token in v1.<body>.<sig> shape (period-separated, 3 parts)", () => {
    const token = generateShareToken(makePayload(), SECRET);
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("v1");
    expect(parts[1]?.length).toBeGreaterThan(0);
    expect(parts[2]?.length).toBeGreaterThan(0);
  });

  it("returns null when the secret used to verify differs from the one used to sign", () => {
    const token = generateShareToken(makePayload(), SECRET);
    expect(verifyShareToken(token, "different-secret")).toBeNull();
  });

  it("returns null when the token has been tampered with (body modified)", () => {
    const token = generateShareToken(makePayload(), SECRET);
    const [version, body, sig] = token.split(".");
    // Flip one character in the body — sig won't match anymore.
    const flipped = body!.startsWith("A")
      ? `B${body!.slice(1)}`
      : `A${body!.slice(1)}`;
    const tampered = `${version}.${flipped}.${sig}`;
    expect(verifyShareToken(tampered, SECRET)).toBeNull();
  });

  it("returns null for an expired token (expiresAt < now)", () => {
    const past = Date.now() - 1_000;
    const token = generateShareToken(makePayload({ expiresAt: past }), SECRET);
    expect(verifyShareToken(token, SECRET)).toBeNull();
  });

  it("accepts a token whose expiresAt is exactly `now` is not yet expired by one millisecond margin", () => {
    const now = Date.now();
    const token = generateShareToken(makePayload({ expiresAt: now + 1 }), SECRET);
    expect(verifyShareToken(token, SECRET, now)).not.toBeNull();
  });

  it("returns null for malformed token (not 3 parts)", () => {
    expect(verifyShareToken("only-one-part", SECRET)).toBeNull();
    expect(verifyShareToken("two.parts", SECRET)).toBeNull();
    expect(verifyShareToken("a.b.c.d", SECRET)).toBeNull();
  });

  it("returns null when the version prefix is not v1", () => {
    const token = generateShareToken(makePayload(), SECRET);
    const [, body, sig] = token.split(".");
    const wrongVersion = `v2.${body}.${sig}`;
    expect(verifyShareToken(wrongVersion, SECRET)).toBeNull();
  });

  it("returns null when the body is not valid JSON after base64 decode", () => {
    const garbageBody = Buffer.from("not-json", "utf8").toString("base64url");
    // Sign the garbage body with the real secret to isolate the JSON-decode failure
    // from sig-mismatch failure (which is tested elsewhere).
    const sig = createHmac("sha256", SECRET)
      .update(`v1.${garbageBody}`)
      .digest("base64url");
    expect(verifyShareToken(`v1.${garbageBody}.${sig}`, SECRET)).toBeNull();
  });

  it("returns null when the decoded JSON is missing required fields", () => {
    const incomplete = Buffer.from(
      JSON.stringify({ workflow: "x" }),
      "utf8",
    ).toString("base64url");
    const sig = createHmac("sha256", SECRET)
      .update(`v1.${incomplete}`)
      .digest("base64url");
    expect(verifyShareToken(`v1.${incomplete}.${sig}`, SECRET)).toBeNull();
  });

  it("generateShareToken throws on empty secret", () => {
    expect(() => generateShareToken(makePayload(), "")).toThrow();
  });

  it("verifyShareToken returns null on empty secret (does not throw — keeps disabled path clean)", () => {
    const token = generateShareToken(makePayload(), SECRET);
    expect(verifyShareToken(token, "")).toBeNull();
  });

  it("two tokens for the same payload+secret are byte-identical (deterministic)", () => {
    const payload = makePayload();
    const a = generateShareToken(payload, SECRET);
    const b = generateShareToken(payload, SECRET);
    expect(a).toBe(b);
  });
});
