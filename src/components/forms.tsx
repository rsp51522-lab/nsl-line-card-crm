"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./crm.module.css";
import { buildLineOaMessageUrl, buildLineShareUrl } from "@/lib/line";
import { Contact } from "@/lib/types";

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { error?: string; message?: string; fallbackMessage?: string };
  if (!response.ok) {
    const error = new Error(data.error || "処理に失敗しました。") as Error & {
      fallbackMessage?: string;
    };
    error.fallbackMessage = data.fallbackMessage;
    throw error;
  }
  return data;
}

export function TagCreateForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className={styles.inlineForm}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            const result = await postJson("/api/tags", {
              name: String(form.get("name") || ""),
              color: String(form.get("color") || ""),
            });
            setMessage(result.message || "保存しました。");
            event.currentTarget.reset();
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
          }
        });
      }}
    >
      <input className={styles.textInput} name="name" placeholder="例: 重要顧客" />
      <input className={styles.textInput} name="color" placeholder="#163a70" />
      <button className={styles.actionButton} disabled={isPending} type="submit">
        {isPending ? "送信中..." : "タグ追加"}
      </button>
      {message ? <p className={styles.formMessage}>{message}</p> : null}
    </form>
  );
}

export function ActivityCreateForm({ contacts }: { contacts: Contact[] }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className={styles.stackedForm}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            const result = await postJson("/api/activities", {
              contactId: String(form.get("contactId") || ""),
              activityDate: String(form.get("activityDate") || ""),
              activityType: String(form.get("activityType") || ""),
              title: String(form.get("title") || ""),
              detail: String(form.get("detail") || ""),
              nextAction: String(form.get("nextAction") || ""),
              nextFollowUpDate: String(form.get("nextFollowUpDate") || ""),
            });
            setMessage(result.message || "保存しました。");
            event.currentTarget.reset();
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
          }
        });
      }}
    >
      <div className={styles.formGrid}>
        <select className={styles.textInput} name="contactId" defaultValue="">
          <option value="" disabled>名刺を選択</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.companyName} / {contact.personName}
            </option>
          ))}
        </select>
        <input className={styles.textInput} name="activityDate" type="date" />
        <select className={styles.textInput} name="activityType" defaultValue="call">
          {["exchange", "call", "line", "visit", "proposal", "quote", "contract"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input className={styles.textInput} name="title" placeholder="例: 電話フォロー" />
      </div>
      <textarea className={styles.textArea} name="detail" placeholder="内容" rows={4} />
      <div className={styles.formGrid}>
        <input className={styles.textInput} name="nextAction" placeholder="次回アクション" />
        <input className={styles.textInput} name="nextFollowUpDate" type="date" />
      </div>
      <button className={styles.actionButton} disabled={isPending} type="submit">
        {isPending ? "送信中..." : "履歴を追加"}
      </button>
      {message ? <p className={styles.formMessage}>{message}</p> : null}
    </form>
  );
}

export function ContactCreateForm({ contact }: { contact: Contact }) {
  const [message, setMessage] = useState("");
  const [frontImagePath, setFrontImagePath] = useState("");
  const [frontImageMimeType, setFrontImageMimeType] = useState("");
  const [frontPreviewUrl, setFrontPreviewUrl] = useState("");
  const [backImagePath, setBackImagePath] = useState("");
  const [backImageMimeType, setBackImageMimeType] = useState("");
  const [backPreviewUrl, setBackPreviewUrl] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, startUploadTransition] = useTransition();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function uploadCardImage(side: "front" | "back", file: File) {
    const formData = new FormData();
    formData.append("side", side);
    formData.append("file", file);

    const response = await fetch("/api/card-images", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      error?: string;
      message?: string;
      storagePath?: string;
      mimeType?: string;
      publicUrl?: string;
    };

    if (!response.ok || !data.storagePath) {
      throw new Error(data.error || "画像保存に失敗しました。");
    }

    if (side === "front") {
      setFrontImagePath(data.storagePath);
      setFrontImageMimeType(data.mimeType || "");
      setFrontPreviewUrl(data.publicUrl || "");
    } else {
      setBackImagePath(data.storagePath);
      setBackImageMimeType(data.mimeType || "");
      setBackPreviewUrl(data.publicUrl || "");
    }

    setUploadMessage(data.message || "画像を保存しました。");
  }

  return (
    <form
      className={styles.stackedForm}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            const result = await postJson("/api/contacts", {
              companyName: String(form.get("companyName") || ""),
              personName: String(form.get("personName") || ""),
              department: String(form.get("department") || ""),
              position: String(form.get("position") || ""),
              postalCode: String(form.get("postalCode") || ""),
              address: String(form.get("address") || ""),
              email: String(form.get("email") || ""),
              phone: String(form.get("phone") || ""),
              mobilePhone: String(form.get("mobilePhone") || ""),
              fax: String(form.get("fax") || ""),
              websiteUrl: String(form.get("websiteUrl") || ""),
              eventName: String(form.get("eventName") || ""),
              exchangedAt: String(form.get("exchangedAt") || ""),
              nextFollowUpDate: String(form.get("nextFollowUpDate") || ""),
              nextFollowUpType: String(form.get("nextFollowUpType") || ""),
              memo: String(form.get("memo") || ""),
              frontImagePath: String(form.get("frontImagePath") || ""),
              frontImageMimeType: String(form.get("frontImageMimeType") || ""),
              backImagePath: String(form.get("backImagePath") || ""),
              backImageMimeType: String(form.get("backImageMimeType") || ""),
            });
            setMessage(result.message || "保存しました。");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
          }
        });
      }}
    >
      <div className={styles.captureGrid}>
        {[
          {
            label: "表面を撮影",
            previewUrl: frontPreviewUrl,
            side: "front" as const,
            storagePath: frontImagePath,
          },
          {
            label: "裏面を撮影",
            previewUrl: backPreviewUrl,
            side: "back" as const,
            storagePath: backImagePath,
          },
        ].map((item) => (
          <label key={item.side} className={styles.captureCard}>
            {item.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={item.label} className={styles.capturePreview} src={item.previewUrl} />
            ) : (
              <div className={styles.capturePlaceholder}>{item.label}</div>
            )}
            <input
              accept="image/*"
              capture="environment"
              className={styles.captureInput}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) return;
                startUploadTransition(async () => {
                  try {
                    await uploadCardImage(item.side, file);
                  } catch (error) {
                    setUploadMessage(error instanceof Error ? error.message : "画像保存に失敗しました。");
                  }
                });
              }}
              type="file"
            />
            <span className={styles.captureButton}>
              {isUploading ? "保存中..." : item.storagePath ? "撮り直す" : "LINEカメラで撮影"}
            </span>
          </label>
        ))}
      </div>
      <input name="frontImagePath" type="hidden" value={frontImagePath} />
      <input name="frontImageMimeType" type="hidden" value={frontImageMimeType} />
      <input name="backImagePath" type="hidden" value={backImagePath} />
      <input name="backImageMimeType" type="hidden" value={backImageMimeType} />
      {uploadMessage ? <p className={styles.formMessage}>{uploadMessage}</p> : null}
      <div className={styles.formGrid}>
        <input className={styles.textInput} name="companyName" defaultValue={contact.companyName} placeholder="会社名" />
        <input className={styles.textInput} name="personName" defaultValue={contact.personName} placeholder="氏名" />
        <input className={styles.textInput} name="department" defaultValue={contact.department} placeholder="部署" />
        <input className={styles.textInput} name="position" defaultValue={contact.position} placeholder="役職" />
        <input className={styles.textInput} name="postalCode" defaultValue={contact.postalCode} placeholder="郵便番号" />
        <input className={styles.textInput} name="address" defaultValue={contact.address} placeholder="住所" />
        <input className={styles.textInput} name="email" defaultValue={contact.email} placeholder="メール" />
        <input className={styles.textInput} name="phone" defaultValue={contact.phone} placeholder="電話番号" />
        <input className={styles.textInput} name="mobilePhone" defaultValue={contact.mobilePhone} placeholder="携帯番号" />
        <input className={styles.textInput} name="fax" defaultValue={contact.fax} placeholder="FAX" />
        <input className={styles.textInput} name="websiteUrl" defaultValue={contact.websiteUrl} placeholder="URL" />
        <input className={styles.textInput} name="eventName" defaultValue={contact.eventName} placeholder="イベント名" />
        <input className={styles.textInput} name="exchangedAt" defaultValue={contact.exchangedAt} type="date" />
        <input className={styles.textInput} name="nextFollowUpDate" defaultValue={contact.nextFollowUpDate} type="date" />
        <input className={styles.textInput} name="nextFollowUpType" defaultValue={contact.nextFollowUpType} placeholder="次回連絡種別" />
      </div>
      <textarea className={styles.textArea} name="memo" defaultValue={contact.memo} rows={4} />
      <button className={styles.actionButton} disabled={isPending} type="submit">
        {isPending ? "保存中..." : "名刺データを保存"}
      </button>
      {message ? <p className={styles.formMessage}>{message}</p> : null}
    </form>
  );
}

export function ThankYouGenerator({ contact }: { contact: Contact }) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [isPending, startTransition] = useTransition();

  const lineShareUrl = message ? buildLineShareUrl(message) : "";
  const lineDirectUrl = message ? buildLineOaMessageUrl(contact.lineUrl, message) : "";

  return (
    <div className={styles.stackedForm}>
      <button
        className={styles.actionButton}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              const result = await postJson("/api/ai/thank-you", {
                companyName: contact.companyName,
                personName: contact.personName,
                eventName: contact.eventName,
                memo: contact.memo,
                nextAction: contact.activities[0]?.nextAction || contact.nextFollowUpType,
              });
              setMessage(result.message || "");
            } catch (error) {
              if (error instanceof Error && "fallbackMessage" in error && typeof error.fallbackMessage === "string") {
                setMessage(`${error.message}\n\n代替文面:\n${error.fallbackMessage}`);
                return;
              }
              setMessage(error instanceof Error ? error.message : "生成に失敗しました。");
            }
          })
        }
        type="button"
      >
        {isPending ? "生成中..." : "お礼文を生成"}
      </button>
      {message ? <textarea className={styles.textArea} readOnly rows={8} value={message} /> : null}
      {message ? (
        <div className={styles.actions}>
          <a className={styles.action} href={lineDirectUrl || lineShareUrl} target="_blank" rel="noreferrer">
            {lineDirectUrl ? "LINEで送る" : "LINE共有を開く"}
          </a>
          <button
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
            onClick={() =>
              startTransition(async () => {
                await navigator.clipboard.writeText(message);
                setCopied("本文をコピーしました。");
              })
            }
            type="button"
          >
            コピー
          </button>
        </div>
      ) : null}
      {message ? (
        <p className={styles.helperText}>
          {lineDirectUrl
            ? "相手のLINE公式アカウントが登録されていれば、そのまま入力欄付きで開きます。"
            : "LINE送信先が未登録でも、共有画面から友だちやKeepへ送れます。"}
        </p>
      ) : null}
      {copied ? <p className={styles.formMessage}>{copied}</p> : null}
    </div>
  );
}

export function AIInsightPanel({ contact }: { contact: Contact }) {
  const [summary, setSummary] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [isPending, startTransition] = useTransition();

  async function generate(url: string, setter: (value: string) => void) {
    try {
      const result = await postJson(url, {
        companyName: contact.companyName,
        personName: contact.personName,
        businessCategory: contact.businessCategory,
        memo: contact.memo,
        referrer: contact.referrer,
        nextFollowUpType: contact.nextFollowUpType,
        nextFollowUpDate: contact.nextFollowUpDate,
      });
      setter(result.message || "");
    } catch (error) {
      if (error instanceof Error && "fallbackMessage" in error && typeof error.fallbackMessage === "string") {
        setter(`${error.message}\n\n代替結果:\n${error.fallbackMessage}`);
        return;
      }
      setter(error instanceof Error ? error.message : "生成に失敗しました。");
    }
  }

  return (
    <div className={styles.stackedForm}>
      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await generate("/api/ai/summary", setSummary);
            })
          }
          type="button"
        >
          {isPending ? "生成中..." : "AI要約を更新"}
        </button>
        <button
          className={styles.actionButton}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await generate("/api/ai/follow-up", setFollowUp);
            })
          }
          type="button"
        >
          {isPending ? "生成中..." : "AIフォロー提案"}
        </button>
      </div>
      {summary ? <textarea className={styles.textArea} readOnly rows={6} value={summary} /> : null}
      {followUp ? <textarea className={styles.textArea} readOnly rows={7} value={followUp} /> : null}
    </div>
  );
}
