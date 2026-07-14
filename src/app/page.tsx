import { AppShell } from "@/components/app-shell";
import { ContactList, MetricCard, TagRow } from "@/components/ui";
import { getContacts, getDashboardMetrics, getSearchMeta } from "@/lib/repository";
import styles from "@/components/crm.module.css";

export default async function HomePage() {
  const [metrics, recentContacts, meta] = await Promise.all([
    getDashboardMetrics(),
    getContacts(),
    getSearchMeta(),
  ]);

  return (
    <AppShell
      title="営業が前に進む名刺CRM"
      subtitle="Eightの使いやすさを参考にしつつ、NSL相談所の強みであるAI営業支援、次回フォロー提案、商談メモ要約まで最初から入れたホーム画面です。"
    >
      <section className={`${styles.grid} ${styles.metricGrid}`}>
        <MetricCard label="名刺" value={`${metrics.totalCards}件`} />
        <MetricCard label="今日登録" value={`${metrics.todayRegistered}件`} hint={`OCR未確認 ${metrics.ocrPending}件`} />
        <MetricCard label="今月登録" value={`${metrics.monthRegistered}件`} />
        <MetricCard label="要フォロー" value={`${metrics.needFollowUp}件`} hint={`今日中 ${metrics.dueToday}件`} />
        <MetricCard label="次回訪問予定" value={`${metrics.nextVisits}件`} />
      </section>

      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.heroCard}>
          <div>
            <div className={styles.eyebrow}>今日の営業アシスト</div>
            <h2 className={styles.sectionTitle}>今日やることが最初に見える</h2>
            <p className={styles.heroLead}>
              営業担当者が朝いちで確認する画面です。次回連絡、訪問予定、未送信のお礼文、OCR確認待ちをまとめて出し、一覧より先に行動へつなげます。
            </p>
          </div>
          <div className={styles.list}>
            {meta.todayTasks.map((task) => (
              <div key={task} className={styles.listItem}>
                <strong>{task}</strong>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            {meta.quickActions.map((action) => (
              <a href={action.href} key={action.label} className={styles.action}>
                {action.label}
              </a>
            ))}
          </div>
        </article>

        <div className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.sectionTitle}>AI提案</h2>
            <div className={styles.list}>
              {meta.aiSuggestions.map((suggestion) => (
                <div key={suggestion} className={styles.listItem}>
                  <strong>{suggestion}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.sectionTitle}>今週の重点タグ</h2>
            <TagRow tags={["守成クラブ", "建設業", "紹介案件", "重要顧客", "税理士"]} />
          </article>
        </div>
      </section>

      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>最近追加した名刺</h2>
          <ContactList items={recentContacts.slice(0, 3)} />
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>ホームで見えるべき項目</h2>
          <div className={styles.list}>
            {[
              "今日連絡予定があります",
              "見積提出後7日以上の案件があります",
              "お礼LINE未送信があります",
              "OCRで誤読候補が2件あります",
            ].map((item) => (
              <div key={item} className={styles.listItem}>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
