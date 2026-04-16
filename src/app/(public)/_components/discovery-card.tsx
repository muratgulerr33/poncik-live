import Image from "next/image";
import Link from "next/link";

import styles from "./discovery.module.css";

type DiscoveryCardProps = Readonly<{
  kind: "live" | "offline";
  username: string;
  href: string | null;
  coverImageStorageKey: string | null;
}>;

function getInitial(username: string) {
  return username.slice(0, 1).toUpperCase() || "?";
}

export function DiscoveryCard({
  kind,
  username,
  href,
  coverImageStorageKey
}: DiscoveryCardProps) {
  const media = coverImageStorageKey ? (
    <div className={styles.cardMediaFrame}>
      <Image
        src={`/${coverImageStorageKey}`}
        alt={`@${username} kapak görseli`}
        width={300}
        height={300}
        className={styles.cardMedia}
      />
    </div>
  ) : (
    <div className={styles.cardFallback} aria-hidden="true">
      <span className={`t-h2 ${styles.cardFallbackInitial}`}>
        {getInitial(username)}
      </span>
    </div>
  );

  const content = (
    <div
      className={`${styles.cardInner} ${
        kind === "offline" ? styles.cardInnerStatic : ""
      }`.trim()}
    >
      <div className={styles.cardMediaSlot}>
        {media}
        {kind === "live" ? (
          <span className={`t-caption ${styles.cardLivePill}`}>Canlı</span>
        ) : null}
      </div>
      <div className={styles.cardMeta}>
        <div className={styles.cardTopRow}>
          <h2 className={`t-h3 ${styles.cardTitle}`}>@{username}</h2>
        </div>
        {kind === "live" ? (
          <span className={`t-label ${styles.cardAction}`}>Canlı izle</span>
        ) : null}
      </div>
    </div>
  );

  if (kind === "live" && href) {
    return (
      <Link
        href={href}
        className={styles.cardLink}
        aria-label={`@${username} canli yayinini izle`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={styles.cardStatic} aria-label={`@${username} yayıncı kartı`}>
      {content}
    </article>
  );
}
