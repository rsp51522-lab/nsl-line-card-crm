import { AppShell } from "@/components/app-shell";
import { ContactDirectoryList } from "@/components/ui";
import { getContacts } from "@/lib/repository";
import styles from "@/components/crm.module.css";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; follow?: string }>;
}) {
  const params = await searchParams;
  const items = await getContacts({
    query: params.q,
    tag: params.tag,
    followUpOnly: params.follow === "1",
  });

  return (
    <AppShell
      title="名刺一覧"
      subtitle="検索して、そのまま読み取り結果のように一覧で確認できる画面へ寄せています。営業向けの余計な説明は外してあります。"
    >
      <section className={styles.compactCard}>
        <form>
          <input
            name="q"
            className={styles.searchBar}
            defaultValue={params.q ?? ""}
            placeholder="会社名・氏名・電話番号・メールで検索"
            aria-label="名刺検索"
          />
        </form>
      </section>

      <section className={styles.compactCard}>
        <h2 className={styles.sectionTitle}>読み取り結果</h2>
        <ContactDirectoryList items={items} />
      </section>
    </AppShell>
  );
}
