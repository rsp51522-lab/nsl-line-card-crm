import { AppShell } from "@/components/app-shell";
import { TagCreateForm } from "@/components/forms";
import { getTagSummaries } from "@/lib/repository";
import styles from "@/components/crm.module.css";

export default async function TagsPage() {
  const tags = await getTagSummaries();

  return (
    <AppShell
      title="タグ管理"
      subtitle="自由追加だけでなく、統合と件数表示を前提にして、営業リストを作りやすいタグ管理へ寄せています。"
    >
      <section className={styles.card}>
        <div className={styles.contactHead}>
          <div>
            <h2 className={styles.sectionTitle}>タグ一覧</h2>
            <p className={styles.helperText}>業種、コミュニティ、案件温度、紹介経路をタグで分ける運用を想定しています。</p>
          </div>
        </div>
        <TagCreateForm />

        <div className={styles.list}>
          {tags.map((tag) => (
            <article key={tag.name} className={styles.listItem}>
              <div className={styles.contactHead}>
                <strong>{tag.name}</strong>
                <span className={styles.contactMeta}>{tag.count}件</span>
              </div>
              <div className={styles.actions}>
                <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>編集</a>
                <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>統合</a>
                <a href="#" className={`${styles.action} ${styles.actionSecondary}`}>削除</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
