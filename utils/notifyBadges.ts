// utils/notifyBadges.ts
import { popJustUnlocked } from "../utils/badgesEngine";
import { pushBadgeUnlocked } from "../utils/notificationStore";
import defs from "../assets/data/badges.json";

export async function notifyAllJustUnlocked(
  extra?: Partial<{ borgoId: string; borgoName: string; regionId: string }>
) {
  while (true) {
    const id = await popJustUnlocked();
    if (!id) break;
    const def = (defs as any).badges.find((b: any) => b.id === id);
    const title = def?.title ?? "Nuovo badge";
    await pushBadgeUnlocked(id, title, extra);
  }
}
