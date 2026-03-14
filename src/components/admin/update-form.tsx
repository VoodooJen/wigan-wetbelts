"use client";

import { useState } from "react";

export function UpdateForm({ bookingId }: { bookingId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCustomerVisible, setIsCustomerVisible] = useState(true);

  async function submit() {
    const response = await fetch(`/api/admin/bookings/${bookingId}/updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, body, isCustomerVisible })
    });

    if (!response.ok) {
      alert("Unable to save update");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="panel-soft p-5">
      <h3 className="text-lg font-semibold">Post booking update</h3>
      <div className="mt-4 grid gap-3">
        <input className="field" placeholder="Update title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <textarea
          className="field min-h-28"
          placeholder="Write a progress update for the customer"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm subtle">
          <input
            type="checkbox"
            checked={isCustomerVisible}
            onChange={(event) => setIsCustomerVisible(event.target.checked)}
          />
          Visible to customer
        </label>
        <button className="btn-primary" onClick={submit}>
          Save update
        </button>
      </div>
    </div>
  );
}
