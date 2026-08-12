/**
 * Dedicated E2E test account (email confirmation already validated on the
 * backend for this address). Credentials can be overridden via env vars.
 */
export const TEST_USER = {
  email: process.env.E2E_EMAIL || "e2e.tester@plancraft.test",
  password: process.env.E2E_PASSWORD || "E2ePlanCraft!2026",
};

export const AUTH_STATE_FILE = "e2e/.auth/user.json";
