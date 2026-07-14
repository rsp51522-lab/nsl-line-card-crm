import { AppShell } from "@/components/app-shell";
import { ActivityCreateForm } from "@/components/forms";
import { getContacts } from "@/lib/repository";
import styles from "@/components/crm.module.css";

export default async function ActivitiesPage() {
  const contacts = await getContacts();
  const activities = contacts.flatMap((contact) =>
    contact.activities.map((activity) => ({
      ...activity,
      companyName: contact.companyName,
      personName: contact.personName,
    })),
  );

  return (
    <AppShell
      title="商談履歴"
      subtitle="営業日報として使えるように、名刺交換から電話、訪問、見積、契約までを時系列で残す前提の画面です。"
    >
      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>履歴タイムライン</h2>
          <div className={styles.list}>
            {activities.map((item) => (
              <article key={`${item.companyName}-${item.id}`} className={styles.listItem}>
                <div className={styles.contactHead}>
                  <strong>{item.date}</strong>
                  <span className={styles.filterChip}>{item.type}</span>
                </div>
                <h3>{item.companyName} / {item.personName}</h3>
                <p className={styles.helperText}>{item.title}</p>
                <p className={styles.contactMeta}>{item.detail}</p>
                {item.nextAction ? <p className={styles.metricHint}>次回: {item.nextAction}</p> : null}
              </article>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>追加テンプレート</h2>
          <ActivityCreateForm contacts={contacts} />
          <div className={styles.list}>
            {[
              "2026/7/14 守成クラブ 名刺交換",
              "7/20 電話",
              "8/5 訪問",
              "見積提出",
              "契約",
            ].map((template) => (
              <div key={template} className={styles.listItem}>
                <strong>{template}</strong>
              </div>
            ))}
          </div>
          <div className={styles.actions} style={{ marginTop: 16 }}>
            <a href="#" className={styles.action}>履歴追加</a>
            <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>音声入力</a>
            <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>AI要約</a>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
