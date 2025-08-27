import { useEffect, useState } from "react";
import { getUnreadCount } from "../utils/notificationStore";
import { notificationsBus } from "../utils/notificationStore";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    (async () => setCount(await getUnreadCount()))();
    const h = async () => setCount(await getUnreadCount());
    notificationsBus.on("changed", h);
    return () => notificationsBus.off("changed", h);
  }, []);
  return count;
}
