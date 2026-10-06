import type { Metadata } from "next";
import {
  Cloud,
  Github,
  Globe2,
  Mail,
  MessageCircle,
  Shield,
  Box,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "WISE² Email Master Reference Sheet",
  description: "WISE² email addresses, ownership, integrations, and mail flow.",
  robots: { index: false, follow: false },
};

type Status = "Active" | "Needs Verification" | "Planned" | "Issue";
type Account = {
  group: string;
  email: string;
  owner: string;
  purpose: string;
  forward: string;
  connected: string;
  contact: boolean;
  status: Status;
  notes: string;
};

const accounts: Account[] = [
  [
    "Personal",
    "dwise03@gmail.com",
    "Daniel",
    "Primary Google / Infrastructure",
    "N/A",
    "111111",
    "No",
    "Active",
    "Main Google account. Keep active.",
  ],
  [
    "Executive",
    "daniel@wise2.net",
    "Daniel",
    "Executive / Business",
    "→ dwise03@gmail.com",
    "110001",
    "Yes",
    "Planned",
    "Primary business email for Daniel.",
  ],
  [
    "Executive",
    "darrin@wise2.net",
    "Darrin",
    "Executive / Business",
    "→ (TBD)",
    "000000",
    "Yes",
    "Planned",
    "Create when ready.",
  ],
  [
    "Admin",
    "dwise@wise2.net",
    "Daniel (Admin)",
    "WISE² Admin Identity",
    "→ dwise03@gmail.com",
    "010001",
    "No",
    "Issue",
    "Works as WISE² login. Email delivery previously failed.",
  ],
  [
    "Admin",
    "admin@wise2.net",
    "System",
    "Infrastructure / Administration",
    "→ dwise03@gmail.com",
    "000000",
    "No",
    "Needs Verification",
    "Referenced in configs/materials.",
  ],
  [
    "Support",
    "support@wise2.net",
    "Support Team",
    "Customer Support",
    "→ dwise03@gmail.com",
    "000000",
    "Yes",
    "Needs Verification",
    "Used for customer support / remote support.",
  ],
  [
    "Business",
    "contact@wise2.net",
    "WISE²",
    "General Business Contact",
    "→ dwise03@gmail.com",
    "000000",
    "Yes",
    "Needs Verification",
    "Public contact address.",
  ],
  [
    "Business",
    "info@wise2.net",
    "WISE²",
    "General / Invoices",
    "→ dwise03@gmail.com",
    "000000",
    "Yes",
    "Planned",
    "General company communication.",
  ],
  [
    "Business",
    "hello@wise2.net",
    "WISE²",
    "Sales / Marketing",
    "→ dwise03@gmail.com",
    "000000",
    "Yes",
    "Planned",
    "Marketing and new inquiries.",
  ],
  [
    "Legal",
    "privacy@wise2.net",
    "Legal",
    "Privacy / Legal Requests",
    "→ dwise03@gmail.com",
    "000000",
    "Yes",
    "Active",
    "Published contact.",
  ],
  [
    "Legal",
    "legal@wise2.net",
    "Legal",
    "Legal / Compliance",
    "→ dwise03@gmail.com",
    "000000",
    "Yes",
    "Planned",
    "For legal notices, GDPR, etc.",
  ],
  [
    "Automated",
    "notifications@wise2.net",
    "System",
    "System Notifications",
    "(Service-specific)",
    "000000",
    "No",
    "Planned",
    "Automated system emails.",
  ],
  [
    "Automated",
    "noreply@wise2.net",
    "System",
    "No-Reply / Automated",
    "(Service-specific)",
    "000000",
    "No",
    "Planned",
    "Do not monitor. Used for automated emails.",
  ],
  [
    "Automated",
    "alerts@wise2.net",
    "System",
    "System Alerts",
    "→ dwise03@gmail.com",
    "000000",
    "No",
    "Planned",
    "Monitoring and alert notifications.",
  ],
  [
    "Automated",
    "security@wise2.net",
    "System",
    "Security Notifications",
    "→ dwise03@gmail.com",
    "000000",
    "No",
    "Planned",
    "Security-related alerts.",
  ],
  [
    "Profile",
    "dw@wise2.net",
    "Daniel",
    "Profile Address",
    "→ dwise03@gmail.com",
    "000000",
    "No",
    "Needs Verification",
    "Appears in WISE² UI materials.",
  ],
  [
    "Demo",
    "demo@wise2.net",
    "Demo User",
    "WISE² Demo Account",
    "(TBD)",
    "000001",
    "No",
    "Needs Verification",
    "Confirmed WISE² app account. Mailbox unverified.",
  ],
].map(
  ([
    group,
    email,
    owner,
    purpose,
    forward,
    connected,
    contact,
    status,
    notes,
  ]) => ({
    group,
    email,
    owner,
    purpose,
    forward,
    connected,
    contact: contact === "Yes",
    status: status as Status,
    notes,
  }),
);

const groupCounts = accounts.reduce<Record<string, number>>(
  (result, account) => {
    result[account.group] = (result[account.group] ?? 0) + 1;
    return result;
  },
  {},
);

const domainDetails = [
  ["Primary Domain", "wise2.net"],
  ["Email Provider", "Google Workspace (Gmail)"],
  ["DNS Provider", "Cloudflare"],
  ["SMTP (Outbound)", "smtp.gmail.com (TLS, 587)"],
  ["IMAP/POP (Inbound)", "imap.gmail.com (993)"],
  ["SPF", "v=spf1 include:_spf.google.com ~all"],
  ["DKIM", "Enabled (Google Workspace)"],
  ["DMARC", "v=DMARC1; p=quarantine; rua=mailto:admin@wise2.net"],
];

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

function Connection({ value, issue }: { value: string; issue: boolean }) {
  const label = issue ? "Issue" : value === "1" ? "Connected" : "Not connected";
  return (
    <span
      aria-label={label}
      title={label}
      className={`${styles.connection} ${issue ? styles.connectionIssue : value === "1" ? styles.connectionActive : styles.connectionNone}`}
    >
      {issue ? "!" : value === "1" ? "✓" : "−"}
    </span>
  );
}

function BrandIcon({ brand }: { brand: string }) {
  if (brand === "Google") return <span className={styles.googleIcon}>G</span>;
  if (brand === "Cloudflare")
    return <Cloud className={styles.cloudflareIcon} />;
  if (brand === "GitHub") return <Github />;
  if (brand === "Stripe") return <span className={styles.stripeIcon}>S</span>;
  if (brand === "Discord")
    return <MessageCircle className={styles.discordIcon} />;
  return <Box className={styles.appIcon} />;
}

const brands = [
  "Google",
  "Cloudflare",
  "GitHub",
  "Stripe",
  "Discord",
  "WISE² App",
];

export default function EmailReferencePage() {
  let previousGroup = "";
  return (
    <main className={styles.page}>
      <div className={styles.canvas}>
        <div className={styles.hero}>
          <div className={styles.heroBrand}>
            <span
              className={styles.brandMark}
              role="img"
              aria-label="WISE² mark"
            />
            <div>
              <div className={styles.wordmark}>
                WISE<sup>2</sup>
              </div>
              <h1>Email Master Reference Sheet</h1>
              <p>
                Complete inventory of WISE² email addresses, purposes,
                ownership, integrations, and status.
              </p>
            </div>
          </div>
          <Panel title="Domain Information" className={styles.domainPanel}>
            <dl className={styles.domainList}>
              {domainDetails.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Status Legend" className={styles.legendPanel}>
            <ul className={styles.legendList}>
              {(
                [
                  ["Active", "Confirmed working"],
                  ["Needs Verification", "Setup or test pending"],
                  ["Planned", "Not yet created/verified"],
                  ["Issue", "Known problem"],
                  ["Retired", "No longer in use"],
                ] as const
              ).map(([status, description]) => (
                <li key={status}>
                  <span
                    className={`${styles.legendDot} ${styles["dot" + status.replace(" ", "")]}`}
                  />
                  <strong>{status}</strong> – {description}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className={styles.content}>
          <h2>WISE² Email Accounts (Master List)</h2>
          <p className={styles.scrollHint}>
            Scroll sideways to view every column.
          </p>
          <div
            className={styles.tableScroll}
            tabIndex={0}
            aria-label="Email accounts table; scroll horizontally for all columns"
          >
            <table className={styles.accountTable}>
              <colgroup>
                {[
                  83, 148, 94, 162, 140, 56, 56, 56, 56, 56, 56, 116, 68, 108,
                  259,
                ].map((width, index) => (
                  <col key={index} style={{ width }} />
                ))}
              </colgroup>
              <thead>
                <tr className={styles.tableTopHead}>
                  <th rowSpan={2} scope="col">
                    <span className={styles.srOnly}>Group</span>
                  </th>
                  <th rowSpan={2} scope="col">
                    Email Address
                  </th>
                  <th rowSpan={2} scope="col">
                    Display Name /<br />
                    Owner
                  </th>
                  <th rowSpan={2} scope="col">
                    Department / Purpose
                  </th>
                  <th rowSpan={2} scope="col">
                    Forward To / Aliases
                  </th>
                  <th
                    colSpan={6}
                    scope="colgroup"
                    className={styles.connectedHeading}
                  >
                    Connected To
                  </th>
                  <th rowSpan={2} scope="col">
                    SMTP / IMAP
                  </th>
                  <th rowSpan={2} scope="col">
                    Public
                    <br />
                    Contact
                  </th>
                  <th rowSpan={2} scope="col">
                    Status
                  </th>
                  <th rowSpan={2} scope="col">
                    Notes
                  </th>
                </tr>
                <tr className={styles.iconHead}>
                  {brands.map((brand) => (
                    <th scope="col" key={brand}>
                      <BrandIcon brand={brand} />
                      {brand}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const first = account.group !== previousGroup;
                  previousGroup = account.group;
                  return (
                    <tr key={account.email}>
                      {first && (
                        <th
                          rowSpan={groupCounts[account.group]}
                          scope="rowgroup"
                          className={`${styles.groupCell} ${styles["group" + account.group]}`}
                        >
                          {account.group}
                        </th>
                      )}
                      <th scope="row" className={styles.emailCell}>
                        {account.email}
                      </th>
                      <td>{account.owner}</td>
                      <td>{account.purpose}</td>
                      <td>{account.forward}</td>
                      {[...account.connected].map((value, index) => (
                        <td className={styles.centerCell} key={index}>
                          <Connection
                            value={value}
                            issue={
                              account.email === "dwise@wise2.net" && index === 0
                            }
                          />
                        </td>
                      ))}
                      <td>Google SMTP/IMAP</td>
                      <td className={styles.centerCell}>
                        {account.contact ? "Yes" : "No"}
                      </td>
                      <td className={styles.centerCell}>
                        <span
                          className={`${styles.statusBadge} ${styles["status" + account.status.replace(" ", "")]}`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td>{account.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={styles.bottomGrid}>
            <Panel title="Recommended Email Structure">
              <div className={styles.structure}>
                <div>
                  <strong>Executive</strong>
                  <span>
                    daniel@wise2.net
                    <br />
                    darrin@wise2.net
                  </span>
                </div>
                <div>
                  <strong>Operations</strong>
                  <span>
                    admin@wise2.net
                    <br />
                    support@wise2.net
                    <br />
                    billing@wise2.net
                  </span>
                </div>
                <div>
                  <strong>Business</strong>
                  <span>
                    contact@wise2.net
                    <br />
                    sales@wise2.net
                    <br />
                    info@wise2.net
                    <br />
                    hello@wise2.net
                  </span>
                </div>
                <div>
                  <strong>Legal</strong>
                  <span>
                    privacy@wise2.net
                    <br />
                    legal@wise2.net
                  </span>
                </div>
                <div>
                  <strong>Automated</strong>
                  <span>
                    notifications@wise2.net
                    <br />
                    noreply@wise2.net
                    <br />
                    alerts@wise2.net
                    <br />
                    security@wise2.net
                  </span>
                </div>
              </div>
            </Panel>
            <Panel title="Account Integration Map">
              <div className={styles.integrationMap}>
                <div className={styles.integrationCard}>
                  <BrandIcon brand="Cloudflare" />
                  <strong>Cloudflare</strong>
                  <span>
                    DNS
                    <br />
                    Email Routing
                    <br />
                    Domain Records
                  </span>
                </div>
                <div className={styles.integrationCard}>
                  <Shield className={styles.appIcon} />
                  <strong>WISE² Application</strong>
                  <span>
                    User Logins
                    <br />
                    System Notifications
                  </span>
                </div>
                <div className={styles.integrationCard}>
                  <BrandIcon brand="GitHub" />
                  <strong>GitHub</strong>
                  <span>
                    Code Repositories
                    <br />
                    CI/CD Notifications
                  </span>
                </div>
                <div className={styles.integrationCard}>
                  <BrandIcon brand="Stripe" />
                  <strong>Stripe</strong>
                  <span>
                    Billing & Payments
                    <br />
                    Receipts / Invoices
                  </span>
                </div>
                <div
                  className={`${styles.integrationCard} ${styles.googleWorkspace}`}
                >
                  <BrandIcon brand="Google" />
                  <strong>Google Workspace</strong>
                  <span>
                    Email Hosting (Gmail)
                    <br />
                    <br />
                    smtp.gmail.com
                    <br />
                    imap.gmail.com
                  </span>
                </div>
                <div className={styles.integrationCard}>
                  <BrandIcon brand="Discord" />
                  <strong>Discord</strong>
                  <span>
                    Community
                    <br />
                    Bot Notifications
                  </span>
                </div>
              </div>
            </Panel>
            <Panel title="Mail Flow Diagram">
              <div className={styles.mailFlow}>
                <div>
                  <Globe2 />
                  <strong>Internet / Senders</strong>
                  <span>Customer, Partners, Services</span>
                </div>
                <span className={styles.flowArrow}>↓</span>
                <div>
                  <BrandIcon brand="Cloudflare" />
                  <strong>Cloudflare (DNS)</strong>
                  <span>MX Records → Google</span>
                </div>
                <span className={styles.flowArrow}>↓</span>
                <div>
                  <BrandIcon brand="Google" />
                  <strong>Google Workspace (Gmail)</strong>
                  <span>Receive, Filter, Store</span>
                </div>
                <span className={styles.flowArrow}>↓</span>
                <div className={styles.flowBranches}>
                  <div>
                    <Mail />
                    <strong>User Mailboxes</strong>
                    <span>
                      Access via Gmail
                      <br />
                      Web / Mobile / IMAP
                    </span>
                  </div>
                  <div>
                    <Mail />
                    <strong>Forwarding / Aliases</strong>
                    <span>
                      Route to primary
                      <br />
                      service accounts
                    </span>
                  </div>
                </div>
              </div>
            </Panel>
            <Panel title="Key Notes">
              <ol className={styles.notes}>
                <li>
                  Keep <strong>dwise03@gmail.com</strong> active – it is tied to
                  Google/Cloudflare and other WISE² access.
                </li>
                <li>
                  <strong>dwise@wise2.net</strong> is a working WISE² login, but
                  email delivery previously failed.
                </li>
                <li>
                  Verify and activate all planned mailboxes in Google Workspace.
                </li>
                <li>
                  Use forwarding to consolidate to dwise03@gmail.com where
                  appropriate.
                </li>
                <li>
                  Maintain SPF, DKIM, and DMARC via Google Workspace and
                  Cloudflare.
                </li>
                <li>
                  Use role-based addresses (support, admin, etc.) for
                  professional communication.
                </li>
                <li>
                  Update this sheet whenever a new email address is created,
                  modified, or retired.
                </li>
              </ol>
            </Panel>
          </div>
          <footer>
            WISE²&nbsp; | &nbsp;Email Master Reference Sheet&nbsp; | &nbsp;v1.0
          </footer>
        </div>
      </div>
    </main>
  );
}
