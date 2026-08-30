"use client";

import { type FormEvent } from "react";
import { trackSundafEvent } from "@/lib/analytics-events";
import styles from "./CleanHome.module.css";

export type HomeSearchOption = {
  value: string;
  label: string;
};

export default function HomeSearchForm({
  destinations,
  months,
}: {
  destinations: HomeSearchOption[];
  months: HomeSearchOption[];
}) {
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    event.currentTarget
      .querySelectorAll<HTMLInputElement>('input[data-campaign-field="true"]')
      .forEach((input) => input.remove());
    const campaign = new URLSearchParams(window.location.search);
    campaign.forEach((value, key) => {
      if (!key.toLowerCase().startsWith("utm_")) return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      input.dataset.campaignField = "true";
      event.currentTarget.appendChild(input);
    });
    trackSundafEvent("home_search_submit", {
      destination: String(data.get("destination") || "all"),
      month: String(data.get("month") || "all"),
    });
  }

  return (
    <form
      className={styles.finderCard}
      action="/tours"
      method="get"
      onSubmit={submitSearch}
      aria-label="Cari rute yang pas"
    >
      <label className={styles.finderField}>
        <span>
          <small>TUJUAN</small>
          <select name="destination" defaultValue="all">
            <option value="all">Semua destinasi</option>
            {destinations.map((destination) => (
              <option key={destination.value} value={destination.value}>
                {destination.label}
              </option>
            ))}
          </select>
        </span>
      </label>

      <label className={styles.finderField}>
        <span>
          <small>WAKTU BERANGKAT</small>
          <select name="month" defaultValue="all">
            <option value="all">Semua bulan</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </span>
      </label>

      <button type="submit">
        Lihat perjalanan
      </button>
    </form>
  );
}
