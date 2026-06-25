import { Sparkles } from "lucide-react";
import styles from "./AnswerCard.module.css";

/**
 * The grounded answer. Inline [Source N] markers are produced by the model and
 * shown as plain text; the CitationList below maps them to paid sources.
 */
export function AnswerCard({ answer }: { answer: string }) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>
          <Sparkles size={15} />
        </span>
        <h2 className={styles.title}>Grounded answer</h2>
      </div>
      <div className={styles.body}>
        {answer.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
