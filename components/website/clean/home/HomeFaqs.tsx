"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { HomeFaqItem } from "@/lib/home-faqs";
import styles from "./CleanHome.module.css";

export default function HomeFaqs({ items }: { items: HomeFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.faqList}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const triggerId = `home-faq-trigger-${index}`;
        const panelId = `home-faq-panel-${index}`;

        return (
          <article className={styles.faqItem} key={item.id || item.question}>
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <ChevronDown aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              className={styles.faqPanel}
              data-open={isOpen}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
            >
              <div>
                <p>{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
