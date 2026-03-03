"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClients";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace("/lobby");
      } else {
        router.replace("/login");
      }
    };

    run();
  }, [router]);

  return null;
}
