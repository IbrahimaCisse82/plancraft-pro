import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PresenceUser {
  user_id: string;
  display_name: string;
  color: string;
}

const COLORS = [
  "hsl(43, 55%, 54%)", "hsl(155, 62%, 53%)", "hsl(217, 90%, 64%)",
  "hsl(280, 60%, 55%)", "hsl(340, 70%, 55%)", "hsl(20, 80%, 55%)",
];

export const useRealtimePresence = (planId: string | undefined) => {
  const { user } = useAuth();
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!planId || !user) return;

    const channel = supabase.channel(`plan-${planId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        Object.entries(state).forEach(([key, value]) => {
          if (key !== user.id && Array.isArray(value) && value.length > 0) {
            const v = value[0] as any;
            users.push({
              user_id: key,
              display_name: v.display_name || key.slice(0, 6),
              color: COLORS[users.length % COLORS.length],
            });
          }
        });
        setPresenceUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [planId, user]);

  return presenceUsers;
};
