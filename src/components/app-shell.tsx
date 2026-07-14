"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./crm.module.css";

const navItems = [
  { href: "/contacts", label: "名刺一覧" },
  { href: "/ocr", label: "登録/OCR" },
  { href: "/search", label: "検索" },
  { href: "/tags", label: "タグ管理" },
  { href: "/activities", label: "商談履歴" },
  { href: "/settings", label: "設定" },
];

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: Props) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.eyebrow}>NSL相談所 標準機能 / AI営業支援つき</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <aside className={styles.utilityCard}>
            <span className={styles.utilityCardTitle}>今日の営業忘れ防止</span>
            <strong className={styles.utilityCardStrong}>電話予定 2件</strong>
            <p className={styles.helperText}>フォロー予定はホームと詳細の両方で必ず見える設計です。</p>
          </aside>
        </header>

        <nav className={styles.nav} aria-label="主要ナビゲーション">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`.trim()}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
