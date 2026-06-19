import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null as User | null, loading };
}

export function useIsAdmin(user: User | null | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    let active = true;
    if (!user) { setIsAdmin(false); setChecked(true); return; }
    setChecked(false);
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setIsAdmin(!!data);
        setChecked(true);
      });
    return () => { active = false; };
  }, [user?.id]);
  return { isAdmin, checked };
}

export async function signOut() {
  await supabase.auth.signOut();
}
