import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Client = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true });
    if (error) toast.error(error.message);
    else setClients((data || []) as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchClients();
  }, [user, fetchClients]);

  const createClient = useCallback(
    async (payload: Partial<Client>) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          name: (payload.name || "").trim(),
          company: payload.company?.trim() || null,
          email: payload.email?.trim() || null,
          phone: payload.phone?.trim() || null,
          notes: payload.notes?.trim() || null,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      await fetchClients();
      return data as Client;
    },
    [user, fetchClients]
  );

  const updateClient = useCallback(
    async (id: string, patch: Partial<Client>) => {
      const { error } = await supabase
        .from("clients")
        .update({
          name: patch.name,
          company: patch.company ?? null,
          email: patch.email ?? null,
          phone: patch.phone ?? null,
          notes: patch.notes ?? null,
        })
        .eq("id", id);
      if (error) toast.error(error.message);
      else await fetchClients();
    },
    [fetchClients]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) toast.error(error.message);
      else await fetchClients();
    },
    [fetchClients]
  );

  return { clients, loading, fetchClients, createClient, updateClient, deleteClient };
}
