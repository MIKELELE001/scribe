import { FilePlus2 } from "lucide-react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { SourceList } from "@/components/sources/SourceList";
import styles from "./SourcesPage.module.css";

export default function SourcesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Sources</h1>
          <p className={styles.subtitle}>
            Registered work the Scribe agent can cite and pay for.
          </p>
        </div>
        <ButtonLink href="/sources/new" leftIcon={<FilePlus2 size={16} />}>
          Add source
        </ButtonLink>
      </header>

      <SourceList />
    </div>
  );
}
