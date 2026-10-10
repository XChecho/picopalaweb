"use client";

import { PrivateRoomView } from "@/components/views/PrivateRoomView";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function RoomPage() {
  const isAuthenticated = useRequireAuth();
  if (!isAuthenticated) return null;
  return <PrivateRoomView />;
}
