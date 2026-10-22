import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const settings = vi.hoisted(() => ({
  row: { maintenance_mode: false, maintenance_message: null, free_access_until: "2026-12-31", contact_email: null },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: settings.row }) }) }) }) },
}));

import { refreshAppSettings, useAppSettings } from "@/hooks/useAppSettings";

describe("Application settings propagation", () => {
  it("keeps full access through the configured date and updates existing subscribers on refresh", async () => {
    const { result } = renderHook(() => useAppSettings());
    await waitFor(() => expect(result.current.freeAccessUntil.toISOString()).toBe("2026-12-31T23:59:59.000Z"));
    settings.row.free_access_until = "2027-01-15";
    await act(async () => { await refreshAppSettings(); });
    expect(result.current.freeAccessUntil.toISOString()).toBe("2027-01-15T23:59:59.000Z");
  });
});