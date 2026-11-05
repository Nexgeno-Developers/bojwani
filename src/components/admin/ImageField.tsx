"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMediaAction } from "@/lib/actions";

export interface MediaItem {
  id: number;
  url: string;
  originalName: string;
}

interface Props {
  name?: string;
  value: string;
  media: MediaItem[];
  onChange?: (url: string) => void;
}

export default function ImageField({ name, value, media, onChange }: Props) {
  const [url, setUrl] = useState(value);
  const [lib, setLib] = useState(media);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (u: string) => {
    setUrl(u);
    onChange?.(u);
  };

  const upload = (f: File) => {
    const fd = new FormData();
    fd.append("file", f);
    setErr("");
    start(async () => {
      const r = await uploadMediaAction(fd);
      if (r.ok && r.url) {
        set(r.url);
        setLib((l) => [{ id: Date.now(), url: r.url!, originalName: f.name }, ...l]);
      } else setErr(r.message);
    });
  };

  return (
    <div className="img-field">
      {name && <input type="hidden" name={name} value={url} />}
      <div className="img-row">
        <div className="img-prev">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" /> : <span className="muted tiny">No image</span>}
        </div>
        <div className="img-actions">
          <input className="mono" value={url} onChange={(e) => set(e.target.value)} placeholder="/uploads/image.jpg" />
          <div className="row">
            <button type="button" className="btn small" disabled={pending} onClick={() => fileRef.current?.click()}>
              {pending ? "Uploading…" : "Upload new"}
            </button>
            <button type="button" className="btn small ghost" onClick={() => setOpen((o) => !o)}>
              {open ? "Close library" : "Choose from library"}
            </button>
          </div>
          {err && <div className="alert err tiny">{err}</div>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {open && (
        <div className="lib-grid">
          {lib.length === 0 && <span className="muted tiny">Library is empty.</span>}
          {lib.map((m) => (
            <button
              type="button"
              key={m.id}
              className={m.url === url ? "lib-item on" : "lib-item"}
              title={m.originalName}
              onClick={() => {
                set(m.url);
                setOpen(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.originalName} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
