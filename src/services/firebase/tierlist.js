// Tier List Service - Global shared tier list for all users
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { app } from "./config";

const db = getFirestore(app);
const TIER_IDS = ["S", "A", "B", "C", "D", "E", "F", "unranked"];

const getTierlistRef = () => doc(db, "tierlist", "global");

// Subscribe to real-time tier list updates
export const subscribeTierList = (callback) => {
  return onSnapshot(getTierlistRef(), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
};

// Create tier list if missing, or add new leaders to unranked
export const initTierList = async (leaderIds) => {
  try {
    const snap = await getDoc(getTierlistRef());

    if (!snap.exists()) {
      await setDoc(getTierlistRef(), {
        tiers: {
          S: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: [],
          F: [],
          unranked: [...leaderIds],
        },
        updatedAt: new Date().toISOString(),
      });
      return { error: null };
    }

    const data = snap.data();
    const allAssigned = new Set(TIER_IDS.flatMap((t) => data.tiers?.[t] || []));
    const missing = leaderIds.filter((id) => !allAssigned.has(id));

    if (missing.length > 0) {
      await updateDoc(getTierlistRef(), {
        "tiers.unranked": [...(data.tiers?.unranked || []), ...missing],
        updatedAt: new Date().toISOString(),
      });
    }

    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
};

// Move a leader from one tier to another, optionally at a specific position
export const moveTierListLeader = async (
  leaderId,
  fromTier,
  toTier,
  insertIndex, // raw UI index before source removal
  userId,
  userName,
) => {
  try {
    const snap = await getDoc(getTierlistRef());
    if (!snap.exists()) return { error: "Tier list non trovata" };

    const data = snap.data();
    const tiers = {};
    TIER_IDS.forEach((t) => {
      tiers[t] = [...(data.tiers?.[t] || [])];
    });

    const fromIndex = tiers[fromTier].indexOf(leaderId);
    tiers[fromTier] = tiers[fromTier].filter((id) => id !== leaderId);

    // Adjust index when reordering within the same tier
    let adjusted =
      insertIndex !== undefined && insertIndex !== null
        ? insertIndex
        : tiers[toTier].length;
    if (fromTier === toTier && fromIndex < adjusted) adjusted -= 1;
    adjusted = Math.max(0, Math.min(adjusted, tiers[toTier].length));
    tiers[toTier].splice(adjusted, 0, leaderId);

    await setDoc(getTierlistRef(), {
      tiers,
      lastUpdatedBy: userId,
      lastUpdatedByName: userName,
      updatedAt: new Date().toISOString(),
    });

    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
};

// Reset all leaders back to unranked
export const resetTierList = async (leaderIds) => {
  try {
    await setDoc(getTierlistRef(), {
      tiers: {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        E: [],
        F: [],
        unranked: [...leaderIds],
      },
      updatedAt: new Date().toISOString(),
    });
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
};
