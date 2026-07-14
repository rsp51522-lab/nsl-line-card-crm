import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AIInsightPanel, ThankYouGenerator } from "@/components/forms";
import { ContactList, SalesTable, TagRow, Timeline } from "@/components/ui";
import { getContactById, getContacts } from "@/lib/repository";
import { rankStars } from "@/lib/utils";
import styles from "@/components/crm.module.css";

export async function generateStaticParams() {
  const contacts = await getContacts();
  return contacts.map((contact) => ({ id: contact.id }));
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) notFound();

  return (
    <AppShell
      title={`${contact.companyName} / ${contact.personName}`}
      subtitle="名刺詳細を顧客カルテとして使う前提で、基本情報、ワンタップ導線、次回アクション、商談履歴、売上管理、OCR確認まで1画面に集約しています。"
    >
      <section className={styles.heroCard}>
        <div className={styles.contactHead}>
          <div>
            <div className={styles.eyebrow}>{contact.businessCategory}</div>
            <h2 className={styles.sectionTitle}>
              {contact.personName} / {contact.position}
            </h2>
            <p className={styles.heroLead}>紹介者: {contact.referrer}</p>
          </div>
          <strong>{rankStars(contact.customerRank)}</strong>
        </div>
        <TagRow tags={contact.tags} />
        <div className={styles.actions}>
          <a className={styles.action} href={`tel:${contact.phone}`}>電話</a>
          <a className={styles.action} href={`mailto:${contact.email}`}>メール</a>
          <a className={styles.action} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noreferrer">GoogleMap</a>
          <a className={styles.action} href={contact.lineUrl} target="_blank" rel="noreferrer">LINE</a>
          <a className={styles.action} href={contact.websiteUrl} target="_blank" rel="noreferrer">ホームページ</a>
          <a className={styles.action} href={contact.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </section>

      <section className={`${styles.grid} ${styles.threeColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>基本情報</h2>
          <div className={styles.split}>
            <div className={styles.field}><span className={styles.fieldLabel}>会社名</span><span className={styles.fieldValue}>{contact.companyName}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>氏名</span><span className={styles.fieldValue}>{contact.personName}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>部署</span><span className={styles.fieldValue}>{contact.department}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>役職</span><span className={styles.fieldValue}>{contact.position}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>郵便番号</span><span className={styles.fieldValue}>{contact.postalCode}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>住所</span><span className={styles.fieldValue}>{contact.address}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>メール</span><span className={styles.fieldValue}>{contact.email}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>電話</span><span className={styles.fieldValue}>{contact.phone}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>携帯</span><span className={styles.fieldValue}>{contact.mobilePhone}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>FAX</span><span className={styles.fieldValue}>{contact.fax}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>会社HP</span><span className={styles.fieldValue}>{contact.websiteUrl}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>Facebook</span><span className={styles.fieldValue}>{contact.facebookUrl}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>名刺交換日</span><span className={styles.fieldValue}>{contact.exchangedAt}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>イベント</span><span className={styles.fieldValue}>{contact.eventName}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>初回登録日</span><span className={styles.fieldValue}>{contact.firstRegisteredAt}</span></div>
            <div className={styles.field}><span className={styles.fieldLabel}>最終更新日</span><span className={styles.fieldValue}>{contact.updatedAt}</span></div>
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>次回アクション</h2>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <strong>
                {contact.nextFollowUpDate} {contact.nextFollowUpType}予定
              </strong>
              <p className={styles.helperText}>今日電話予定があります、という表示をホームと詳細の両方に出します。</p>
            </div>
            <div className={styles.actions}>
              <a className={styles.action} href="#">予定を変更</a>
              <a className={`${styles.action} ${styles.actionSecondary}`} href="#">完了</a>
              <a className={`${styles.action} ${styles.actionSecondary}`} href="#">カレンダー登録</a>
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: 22 }}>メモ</h2>
          <div className={styles.listItem}>
            <p className={styles.helperText}>{contact.memo}</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <ThankYouGenerator contact={contact} />
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>AI要約</h2>
          <div className={styles.list}>
            {contact.aiSummary.map((point) => (
              <div key={point} className={styles.listItem}>
                <strong>{point}</strong>
              </div>
            ))}
          </div>
          <div className={styles.actions} style={{ marginTop: 16 }}>
            <a className={styles.action} href="#">お礼メール作成</a>
            <a className={`${styles.action} ${styles.actionSecondary}`} href="#">お礼LINE作成</a>
          </div>
          <div style={{ marginTop: 16 }}>
            <AIInsightPanel contact={contact} />
          </div>
        </article>
      </section>

      <section className={`${styles.grid} ${styles.twoColumn}`}>
        <article className={styles.card}>
          <h2 className={styles.sectionTitle}>商談履歴</h2>
          <Timeline items={contact.activities} />
        </article>

        <div className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.sectionTitle}>名刺画像</h2>
            <div className={styles.split}>
              <div className={styles.imageCard}>{contact.frontImageLabel}</div>
              <div className={styles.imageCard}>{contact.backImageLabel}</div>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.sectionTitle}>OCR誤読候補</h2>
            {contact.ocrWarnings.length ? (
              <div className={styles.warningList}>
                {contact.ocrWarnings.map((warning) => (
                  <div className={styles.warningItem} key={`${warning.field}-${warning.value}`}>
                    {warning.field}: {warning.value} / confidence {warning.confidence}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyBox}>誤読候補はありません。</div>
            )}
            <p className={styles.helperText} style={{ marginTop: 14 }}>
              低信頼項目だけ赤表示し、全修正ではなく「疑わしい箇所だけ」直すUXを想定しています。
            </p>
          </article>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.contactHead}>
          <h2 className={styles.sectionTitle}>売上管理</h2>
          <Link href="/settings" className={styles.action}>見積・請求連携</Link>
        </div>
        <SalesTable items={contact.salesRecords} />
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>関連名刺</h2>
        <ContactList items={(await getContacts({ businessCategory: contact.businessCategory })).filter((item) => item.id !== contact.id).slice(0, 3)} />
      </section>
    </AppShell>
  );
}
