import type { Metadata } from "next";
import { ArrowUpRight, LockKeyhole, Mail, Search, ShieldCheck } from "lucide-react";
import { MailCheckChat } from "@/components/MailCheckChat";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "WISE² Mail Check",
  description: "Private, read-only Gmail check for WISE².",
  robots: { index: false, follow: false },
};

const guardrails = [
  ["Read-only", "Searches headers and snippets only."],
  ["No actions", "Cannot send, delete, archive, label, or mark mail as read."],
  ["Private session", "Authorization is stored in an encrypted, HttpOnly session cookie."],
];

export default function MailCheckPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">W²</span>
          <span>WISE²</span>
        </div>
        <p className={styles.eyebrow}>PRIVATE INBOX UTILITY</p>
        <h1>Mail Check</h1>
        <p className={styles.lede}>
          A quiet, read-only lane into Gmail for checking what matters—without
          turning your inbox into another dashboard template.
        </p>
        <div className={styles.heroMeta}>
          <span><ShieldCheck aria-hidden="true" /> Gmail readonly</span>
          <span><LockKeyhole aria-hidden="true" /> Encrypted session</span>
        </div>
      </section>

      <section className={styles.workspace} aria-label="Mail Check workspace">
        <MailCheckChat />
      </section>

      <section className={styles.details} aria-label="Mail Check privacy details">
        <div className={styles.detailsIntro}>
          <p className={styles.eyebrow}>BUILT FOR FOCUS</p>
          <h2>Only the mail you ask to see.</h2>
          <p>
            Connect your Google account once, then check unread, recent, important,
            or a focused Gmail search. WISE² does not perform mailbox actions.
          </p>
          <a href="/auth/signin" className={styles.accountLink}>
            WISE² account sign-in <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className={styles.guardrails}>
          {guardrails.map(([title, description], index) => {
            const Icon = index === 0 ? Search : index === 1 ? Mail : LockKeyhole;
            return (
              <article key={title} className={styles.guardrail}>
                <Icon aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
