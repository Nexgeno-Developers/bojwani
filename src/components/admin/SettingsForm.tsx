"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/lib/actions";
import type { FieldDef } from "@/lib/cms-schema";
import ImageField, { type MediaItem } from "./ImageField";

interface Props {
  fields: FieldDef[];
  values: Record<string, string>;
  media: MediaItem[];
}

export default function SettingsForm({ fields, values, media }: Props) {
  const [state, action, pending] = useActionState(saveSettingsAction, null);
  return (
    <form action={action} className="card stack">
      <input type="hidden" name="__keys" value={fields.map((f) => f.key).join(",")} />
      {fields.map((f) => (
        <div className="field" key={f.key}>
          {f.type === "boolean" ? (
            <label className="check">
              <input type="checkbox" name={f.key} defaultChecked={values[f.key] === "1"} /> {f.label}
            </label>
          ) : (
            <>
              <span>{f.label}</span>
              {f.type === "image" ? (
                <ImageField name={f.key} value={values[f.key]} media={media} />
              ) : f.type === "textarea" || f.type === "html" ? (
                <textarea
                  name={f.key}
                  defaultValue={values[f.key]}
                  rows={f.type === "html" ? 3 : Math.min(10, Math.max(3, Math.ceil((values[f.key] || "").length / 90) + 1))}
                  className={f.type === "html" ? "mono" : undefined}
                />
              ) : f.type === "color" ? (
                <input type="color" name={f.key} defaultValue={values[f.key]} className="color" />
              ) : (
                <input type={f.type === "url" ? "url" : "text"} name={f.key} defaultValue={values[f.key]} />
              )}
            </>
          )}
          {f.help && <small className="muted">{f.help}</small>}
        </div>
      ))}
      <div className="save-bar">
        {state && <span className={state.ok ? "alert ok" : "alert err"}>{state.message}</span>}
        <button className="btn primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}
