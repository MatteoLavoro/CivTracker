// Shared body scroll lock for overlapping modals
import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

/**
 * Locks the page scroll while at least one modal is open.
 * Using a shared counter avoids an inner modal unlocking the scroll
 * while another modal is still visible.
 * @param {boolean} active - Whether this modal currently locks the scroll
 */
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = "100%";
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [active]);
}
