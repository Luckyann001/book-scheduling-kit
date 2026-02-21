"use client";

import { useState } from "react";

interface BookingFormValues {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface BookingFormProps {
  selectedStartUtc?: string;
  timezone: string;
  onSubmit: (values: BookingFormValues) => Promise<void>;
  submitting: boolean;
  onAiAssist: (message: string) => Promise<string[]>;
}

export function BookingForm({ selectedStartUtc, timezone, onSubmit, submitting, onAiAssist }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>({ name: "", email: "", phone: "", notes: "" });
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleAiSuggest() {
    if (!message.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const next = await onAiAssist(message);
      setSuggestions(next);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Failed to fetch AI suggestions.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section>
      <h2 className="section-title">Book selected slot</h2>
      <p className="subtle-note">Timezone: {timezone}</p>
      <form
        className="booking-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit(values);
        }}
      >
        <input
          required
          placeholder="Full name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <input
          placeholder="Phone (optional, for SMS reminders)"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        />
        <textarea
          placeholder="Notes (optional)"
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
        />
        <button className="primary-btn" type="submit" disabled={!selectedStartUtc || submitting}>
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
      </form>

      <div className="assistant-block">
        <h3>AI scheduling assistant</h3>
        <textarea
          placeholder="Example: I prefer late afternoon next week."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="button" onClick={handleAiSuggest} disabled={aiLoading}>
          {aiLoading ? "Thinking..." : "Suggest times"}
        </button>
        {suggestions.length > 0 ? (
          <ul className="suggestion-list">
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {aiError ? <p className="error-text">{aiError}</p> : null}
      </div>
    </section>
  );
}
