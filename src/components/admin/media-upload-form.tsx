"use client";

import { useState } from "react";

export function MediaUploadForm({ bookingId }: { bookingId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [visible, setVisible] = useState(true);

  async function upload() {
    if (!file) {
      alert("Choose a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    formData.append("isCustomerVisible", String(visible));

    const response = await fetch(`/api/admin/bookings/${bookingId}/media`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      alert("Upload failed");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="panel-soft p-5">
      <h3 className="text-lg font-semibold">Upload photo or video</h3>
      <div className="mt-4 grid gap-3">
        <input className="field" type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <input className="field" placeholder="Caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
        <label className="flex items-center gap-2 text-sm subtle">
          <input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />
          Visible to customer
        </label>
        <button className="btn-primary" onClick={upload}>
          Upload
        </button>
      </div>
    </div>
  );
}
