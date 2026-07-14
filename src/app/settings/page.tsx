import { AppShell } from "@/components/app-shell";
import styles from "@/components/crm.module.css";

export default function SettingsPage() {
  return (
    <AppShell
      title="設定 / 連携"
      subtitle="NSL独自の価値として、Googleカレンダー、見積・請求、LINE送信、AI営業アシストの連携を標準機能として設計しています。"
    >
      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>標準連携</h2>
          <div className={styles.list}>
            {[
              "Googleカレンダー連携",
              "LINEテンプレート送信",
              "Googleフォーム・スプレッドシート連携",
              "見積書アプリ連携",
              "請求書アプリ連携",
            ].map((item) => (
              <div key={item} className={styles.listItem}>
                <div className={styles.contactHead}>
                  <strong>{item}</strong>
                  <span className={styles.statusScheduled}>接続前</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>AI営業支援</h2>
          <div className={styles.list}>
            {[
              "お礼メール自動作成",
              "お礼LINE自動作成",
              "商談内容を要約して保存",
              "次回フォロー日の自動提案",
              "この顧客に次に提案すべき内容の提案",
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
