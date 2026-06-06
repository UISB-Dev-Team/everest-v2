"use client";

import { useEffect, useState } from "react";
import { dormersData } from "@/features/dormers/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { Room } from "@/features/dormers/data/types";

/**
 * Fetches the room list for the current dormitory from the database.
 * Replaces the old MaboloRoomNumber / SampaguitaRoomNumber constants.
 */
export function useRooms() {
  const { dormitoryId } = useDormitory();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dormersData
      .listRoomsForDormitory(dormitoryId)
      .then((data) => { if (!cancelled) setRooms(data); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [dormitoryId]);

  /** Sorted list of room_number strings (nulls filtered out) */
  const roomNumbers = rooms
    .flatMap((r) => r.room_names?.split(",") ?? [])
    .filter((n): n is string => Boolean(n))
    .sort();

  return { rooms, roomNumbers, loading };
}
