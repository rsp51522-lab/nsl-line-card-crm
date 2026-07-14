import { AppShell } from "@/components/app-shell";
import { ContactList } from "@/components/ui";
import { getContacts, getSearchMeta, getTagSummaries } from "@/lib/repository";
import styles from "@/components/crm.module.css";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const [items, meta, tags] = await Promise.all([
    getContacts({
      query: params.q,
      tag: params.tag,
      businessCategory: params.category,
    }),
    getSearchMeta(),
    getTagSummaries(),
  ]);

  return (
    <AppShell
      title="検索"
      subtitle="会社名、氏名、住所、業種、タグ、紹介者を横断検索する前提で、営業現場でよく使う切り口を最初から並べています。"
    >
      <section className={styles.card}>
        <form className={styles.list}>
          <input name="q" className={styles.searchBar} defaultValue={params.q ?? ""} placeholder="キーワードを入力" aria-label="キーワード検索" />
        </form>
        <div className={styles.filterRow} style={{ marginTop: 16 }}>
          {meta.searchableFields.map((field) => (
            <span key={field} className={styles.filterChip}>
              {field}
            </span>
          ))}
        </div>
      </section>

      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>保存フィルタ候補</h2>
          <div className={styles.list}>
            {[
              "守成クラブ × 建設業",
              "紹介案件 × Aランク以上",
              "今週フォロー予定",
              "見積提出済み",
            ].map((preset) => (
              <div key={preset} className={styles.listItem}>
                <strong>{preset}</strong>
              </div>
            ))}
          </div>
          <div className={styles.filterRow} style={{ marginTop: 16 }}>
            {tags.slice(0, 5).map((tag) => (
              <span key={tag.name} className={styles.filterChip}>
                {tag.name}
              </span>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>検索結果サンプル</h2>
          <ContactList items={items} />
        </article>
      </section>
    </AppShell>
  );
}
