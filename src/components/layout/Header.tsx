import { DevModeBadge } from "@/components/shared/DevModeBadge";
import styles from "./Header.module.css";

/**
 * Top bar of the app shell. Server component — reads the server-only
 * PAYMENT_MODE so the global mock badge appears whenever the agent is paying
 * with mock receipts (CLAUDE.md section 6).
 */
export function Header() {
  const isMock = process.env.PAYMENT_MODE !== "real";

  return (
    <header className={styles.header}>
      <div className={styles.network}>
        <span className={styles.dot} aria-hidden />
        <span>Arc testnet</span>
        <span className={styles.divider} aria-hidden>
          ·
        </span>
        <span>USDC</span>
      </div>
      {isMock && <DevModeBadge />}
    </header>
  );
}
