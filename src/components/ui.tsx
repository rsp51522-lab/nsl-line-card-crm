import Link from "next/link";
import styles from "./crm.module.css";
import { Activity, Contact, FollowUpStatus } from "@/lib/types";
import { formatCurrency, rankStars, statusLabel } from "@/lib/utils";

export function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className={`${styles.card} ${styles.metricCard}`}>
      <span className={styles.metricLabel}>{label}</span>
      <strong className={styles.metricValue}>{value}</strong>
      {hint ? <span className={styles.metricHint}>{hint}</span> : null}
    </article>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className={styles.tagRow}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function statusClassName(status: FollowUpStatus) {
  switch (status) {
    case "due_today":
      return styles.statusDue;
    case "overdue":
      return styles.statusOverdue;
    case "completed":
      return styles.statusDone;
    default:
      return styles.statusScheduled;
  }
}

export function ContactList({ items }: { items: Contact[] }) {
  return (
    <div className={styles.list}>
      {items.map((contact) => (
        <Link href={`/contacts/${contact.id}`} key={contact.id} className={styles.listItem}>
          <div className={styles.contactHead}>
            <div>
              <h3>{contact.companyName}</h3>
              <p className={styles.contactMeta}>
                {contact.personName} / {contact.position}
              </p>
            </div>
            <span className={statusClassName(contact.followUpStatus)}>{statusLabel(contact.followUpStatus)}</span>
          </div>

          <TagRow tags={contact.tags} />

          <div className={styles.contactHead}>
            <p className={styles.contactMeta}>
              {contact.businessCategory} / {rankStars(contact.customerRank)}
            </p>
            <p className={styles.contactMeta}>
              次回{contact.nextFollowUpType}: {contact.nextFollowUpDate}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ContactDirectoryList({ items }: { items: Contact[] }) {
  return (
    <div className={styles.directoryList}>
      {items.map((contact, index) => (
        <Link href={`/contacts/${contact.id}`} key={contact.id} className={styles.directoryItem}>
          <div className={styles.directoryIndex}>{index + 1}</div>
          <div className={styles.directoryThumb}>
            {contact.frontImageUrl ? (
              <img
                src={contact.frontImageUrl}
                alt={`${contact.companyName} の名刺表面`}
                className={styles.directoryThumbImage}
              />
            ) : (
              <div className={styles.directoryThumbCard}>
                <div className={styles.directoryThumbCompany}>{contact.companyName}</div>
                <div className={styles.directoryThumbName}>{contact.personName}</div>
                <div className={styles.directoryThumbLine} />
                <div className={styles.directoryThumbLineShort} />
              </div>
            )}
          </div>
          <div className={styles.directoryBody}>
            <p className={styles.directoryCompany}>{contact.companyName}</p>
            <h3 className={styles.directoryName}>{contact.personName}</h3>
            <p className={styles.directoryPosition}>{contact.position || contact.department}</p>
            <p className={styles.directoryMeta}>TEL : {contact.mobilePhone || contact.phone || "-"}</p>
            <p className={styles.directoryMeta}>E-mail : {contact.email || "-"}</p>
            <p className={styles.directoryMetaMuted}>
              {contact.frontImageLabel}
              {contact.backImageUrl ? " / 裏面あり" : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Timeline({ items }: { items: Activity[] }) {
  return (
    <div className={styles.timeline}>
      {items.map((item) => (
        <article key={item.id} className={styles.timelineItem}>
          <div className={styles.timelineDate}>{item.date}</div>
          <div className={styles.timelineBody}>
            <h4>{item.title}</h4>
            <p className={styles.helperText}>{item.detail}</p>
            {item.nextAction ? <p className={styles.metricHint}>次回: {item.nextAction}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function SalesTable({ items }: { items: Contact["salesRecords"] }) {
  if (!items.length) {
    return <div className={styles.emptyBox}>売上管理データはまだありません。</div>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <article key={`${item.projectName}-${item.orderDate}`} className={styles.listItem}>
          <div className={styles.contactHead}>
            <strong>{item.projectName}</strong>
            <span className={styles.statusScheduled}>{item.status}</span>
          </div>
          <p className={styles.contactMeta}>受注日: {item.orderDate}</p>
          <strong>{formatCurrency(item.amount)}</strong>
        </article>
      ))}
    </div>
  );
}
