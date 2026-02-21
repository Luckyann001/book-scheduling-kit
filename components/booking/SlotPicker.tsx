"use client";

import { formatInTimezone } from "../../lib/booking/time";
import type { Slot } from "../../lib/booking/types";

interface SlotPickerProps {
  timezone: string;
  slots: Slot[];
  selectedStartUtc?: string;
  onSelect: (startUtc: string) => void;
}

export function SlotPicker({ timezone, slots, selectedStartUtc, onSelect }: SlotPickerProps) {
  return (
    <section>
      <h2 className="section-title">Choose a time</h2>
      <div className="slot-grid">
        {slots.map((slot) => {
          const selected = slot.startUtc === selectedStartUtc;
          const disabled = slot.status === "booked";
          return (
            <button
              key={slot.startUtc}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(slot.startUtc)}
              className={`slot-btn ${selected ? "selected" : ""} ${disabled ? "booked" : ""}`}
            >
              <div>{formatInTimezone(slot.startUtc, timezone)}</div>
              <small className="slot-status">{disabled ? "Unavailable" : "Available"}</small>
            </button>
          );
        })}
      </div>
      {slots.length === 0 ? <p className="subtle-note">No slots available for this date.</p> : null}
    </section>
  );
}
