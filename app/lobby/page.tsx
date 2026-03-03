"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { useRouter } from "next/navigation";
import LobbyView from "./_components/LobbyView";

export default function LobbyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
    };
    void run();
  }, [router]);

  return <LobbyView userId={userId} />;
}