import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import styles from "@/components/crm.module.css";

export default function NotFound() {
  return (
    <AppShell title="該当データが見つかりません" subtitle="削除済み、またはURLが誤っている可能性があります。">
      <section className={styles.card}>
        <p className={styles.helperText}>名刺一覧に戻って、会社名や氏名から再検索してください。</p>
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <Link href="/contacts" className={styles.action}>
            名刺一覧へ戻る
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
