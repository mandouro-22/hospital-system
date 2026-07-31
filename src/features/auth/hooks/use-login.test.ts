import assert from "node:assert/strict";
import test from "node:test";
import { loginUser } from "./use-login";

test("loginUser resolves a successful auth response", async () => {
  const originalFetch = global.fetch;

  global.fetch = (async () =>
    new Response(
      JSON.stringify({
        success: true,
        message: "Logged in successfully",
        data: {},
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )) as typeof fetch;

  try {
    const result = await loginUser({
      email: "user@example.com",
      password: "secret123",
    });
    assert.equal(result.success, true);
    assert.equal(result.message, "Logged in successfully");
  } finally {
    global.fetch = originalFetch;
  }
});

test("loginUser throws for failed auth responses", async () => {
  const originalFetch = global.fetch;

  global.fetch = (async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: { message: "Invalid credentials" },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    )) as typeof fetch;

  try {
    await assert.rejects(
      () => loginUser({ email: "user@example.com", password: "wrong" }),
      /Invalid credentials/,
    );
  } finally {
    global.fetch = originalFetch;
  }
});
