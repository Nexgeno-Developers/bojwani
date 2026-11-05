import { notFound } from "next/navigation";
import { SETTING_GROUPS } from "@/lib/cms-schema";
import { getSettings } from "@/lib/content";
import { getMediaList } from "@/lib/media";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const g = SETTING_GROUPS.find((x) => x.slug === group);
  if (!g) notFound();
  const [values, media] = await Promise.all([getSettings(), getMediaList()]);
  return (
    <div className="stack">
      <header className="page-head">
        <h1>{g.title}</h1>
        <p className="muted">{g.description}</p>
      </header>
      <SettingsForm key={g.slug} fields={g.fields} values={values} media={media} />
    </div>
  );
}
