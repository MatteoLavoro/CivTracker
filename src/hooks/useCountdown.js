// Countdown synced with a server timestamp
import { useEffect, useState } from "react";

/**
 * Returns the remaining seconds (float) of a countdown that started at
 * `startAt` (ISO string). The value is computed from the timestamp, so all
 * clients see the same countdown even if they open the page late.
 *
 * @param {string|null} startAt - ISO timestamp of the countdown start
 * @param {Object} options
 * @param {number} options.seconds - Countdown length in seconds (default: 5)
 * @param {boolean} options.enabled - Whether the countdown should run
 * @returns {number} Remaining seconds, clamped between 0 and `seconds`
 */
export function useCountdown(startAt, { seconds = 5, enabled = true } = {}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!enabled || !startAt) return;

    let frameId;
    const startMs = new Date(startAt).getTime();

    const tick = () => {
      const left = Math.max(0, seconds - (Date.now() - startMs) / 1000);
      setRemaining(left);
      if (left > 0) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [startAt, seconds, enabled]);

  return remaining;
}
