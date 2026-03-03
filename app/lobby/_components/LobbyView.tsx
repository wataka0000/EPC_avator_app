"use client";

import LobbyDashboardView from "./LobbyDashboardView";

export default function LobbyView({ userId }: { userId: string | null }) {
  return <LobbyDashboardView userId={userId} />;
}
