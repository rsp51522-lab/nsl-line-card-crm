import { AppShell } from "@/components/app-shell";
import { ContactCreateForm } from "@/components/forms";
import { contacts } from "@/data/mock-data";
import styles from "@/components/crm.module.css";

const sample = contacts[0];

export default function OcrPage() {
  return (
    <AppShell
      title="名刺登録 / AI OCR確認"
      subtitle="会社名、名前、部署、役職、住所、郵便番号、メール、電話番号、携帯番号、FAX、URL を高精度抽出し、誤読候補だけ赤で確認できる画面です。"
    >
      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>名刺画像</h2>
          <div className={styles.split}>
            <div className={styles.imageCard}>名刺 表</div>
            <div className={styles.imageCard}>名刺 裏</div>
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>保存前の追加入力</h2>
          <div className={styles.list}>
            <div className={styles.listItem}><strong>タグ</strong><p className={styles.helperText}>守成クラブ / 建設業 / 紹介案件</p></div>
            <div className={styles.listItem}><strong>担当者ランク</strong><p className={styles.helperText}>★★★★★</p></div>
            <div className={styles.listItem}><strong>次回連絡日</strong><p className={styles.helperText}>2026-07-20 電話</p></div>
          </div>
        </article>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>OCR結果</h2>
        <div className={styles.split}>
          {[
            ["会社名", sample.companyName],
            ["名前", sample.personName],
            ["部署", sample.department],
            ["役職", sample.position],
            ["住所", sample.address],
            ["郵便番号", sample.postalCode],
            ["メール", sample.email],
            ["電話番号", sample.phone],
            ["携帯番号", sample.mobilePhone],
            ["FAX", sample.fax],
            ["URL", sample.websiteUrl],
          ].map(([label, value]) => (
            <div key={label} className={styles.field}>
              <span className={styles.fieldLabel}>{label}</span>
              <span className={styles.fieldValue}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>誤読候補だけ赤表示</h2>
        <div className={styles.warningList}>
          {sample.ocrWarnings.map((warning) => (
            <div key={warning.field} className={styles.warningItem}>
              {warning.field}: {warning.value} / confidence {warning.confidence}
            </div>
          ))}
        </div>
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <a href="#save-contact" className={styles.action}>保存</a>
          <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>再OCR</a>
          <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>手入力修正</a>
        </div>
      </section>

      <section className={styles.card} id="save-contact">
        <h2 className={styles.sectionTitle}>名刺データ保存</h2>
        <p className={styles.helperText}>LINEで開いたままカメラ撮影できます。撮影後はこのURL側へ先に保存され、そのまま名刺データと紐づきます。</p>
        <ContactCreateForm contact={sample} />
      </section>
    </AppShell>
  );
}
