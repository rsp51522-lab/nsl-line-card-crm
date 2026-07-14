import { AppShell } from "@/components/app-shell";
import styles from "@/components/crm.module.css";
import { getLineWebhookUrl, hasLineMessagingEnv } from "@/lib/line";
import { DEFAULT_OWNER_ID, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";

export default async function SettingsPage() {
  const lineConnected = hasLineMessagingEnv();
  let ownerLineLinked = false;

  if (hasSupabaseEnv()) {
    try {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase
        .from("users")
        .select("line_user_id")
        .eq("id", DEFAULT_OWNER_ID)
        .maybeSingle();
      ownerLineLinked = Boolean(data?.line_user_id);
    } catch {
      ownerLineLinked = false;
    }
  }

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
          <h2 className={styles.sectionTitle}>LINE連携状況</h2>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div className={styles.contactHead}>
                <strong>お礼LINE共有</strong>
                <span className={styles.statusDone}>利用可能</span>
              </div>
              <p className={styles.helperText}>AIで文面生成後、LINE共有または公式アカウントのチャット画面へ渡せます。</p>
            </div>
            <div className={styles.listItem}>
              <div className={styles.contactHead}>
                <strong>LINE Bot自動送信</strong>
                <span className={lineConnected ? styles.statusDone : styles.statusScheduled}>
                  {lineConnected ? "設定済み" : "設定待ち"}
                </span>
              </div>
              <p className={styles.helperText}>必要項目: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`</p>
            </div>
            <div className={styles.listItem}>
              <div className={styles.contactHead}>
                <strong>自分のLINEアカウント連携</strong>
                <span className={ownerLineLinked ? styles.statusDone : styles.statusScheduled}>
                  {ownerLineLinked ? "連携済み" : "未連携"}
                </span>
              </div>
              <p className={styles.helperText}>
                友だち追加後に Bot へ `NSL連携` と送ると、このアカウントへPush送信できるようになります。
              </p>
            </div>
            <div className={styles.listItem}>
              <strong>Webhook URL</strong>
              <p className={styles.helperText}>{getLineWebhookUrl()}</p>
            </div>
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
