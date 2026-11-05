/**
 * Every editable "single value" on the website.
 * The admin panel builds its forms from this list, and the seed script
 * writes these defaults (the original page content) into MySQL.
 */
export type FieldType = "text" | "textarea" | "html" | "image" | "url" | "color" | "boolean";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  default: string;
  help?: string;
}

export interface FieldGroup {
  slug: string;
  title: string;
  description: string;
  fields: FieldDef[];
}

export const SETTING_GROUPS: FieldGroup[] = [
  {
    slug: "general",
    title: "General & SEO",
    description: "Browser title, SEO description, logo text and shared labels.",
    fields: [
      { key: "site_title", label: "Browser / SEO title", type: "text", default: "The Grand - Lower Parel" },
      { key: "meta_description", label: "SEO meta description", type: "textarea", default: "The Grand, Lower Parel — thoughtfully crafted 4 & 5 bed residences on 4.6 acres of freehold land in South Mumbai." },
      { key: "theme_color", label: "Mobile browser theme color", type: "color", default: "#0d0d0d" },
      { key: "logo_text", label: "Logo text (top menu)", type: "text", default: "THE GRAND" },
      { key: "nav_home_label", label: "Menu 'Home' label", type: "text", default: "Home" },
      { key: "artist_impression_label", label: "Image tag text", type: "text", default: "Artist Impression", help: "Small label shown on rendered images." },
    ],
  },
  {
    slug: "hero",
    title: "Hero (first screen)",
    description: "The full-screen intro with the big title and the Experience button.",
    fields: [
      { key: "hero_title", label: "Title", type: "text", default: "THE GRAND" },
      { key: "hero_eyebrow", label: "Location line", type: "text", default: "Lower Parel" },
      { key: "hero_sub", label: "Tagline", type: "text", default: "Thoughtfully crafted homes" },
      { key: "hero_button", label: "Button text", type: "text", default: "Experience" },
      { key: "hero_image", label: "Background image", type: "image", default: "/uploads/hero.jpg" },
    ],
  },
  {
    slug: "experience",
    title: "Experience index",
    description: "The menu page shown after pressing Experience (its links are managed under Navigation).",
    fields: [
      { key: "experience_image", label: "Background image", type: "image", default: "/uploads/experience-bg.jpg" },
      { key: "rera_button_label", label: "RERA button text", type: "text", default: "RERA Details" },
      { key: "legal_button_label", label: "Legal button text", type: "text", default: "Legal" },
    ],
  },
  {
    slug: "residences",
    title: "Residences",
    description: "Heading under the residences slider (slides are managed under Residence Slides).",
    fields: [
      { key: "show_residences", label: "Show this section", type: "boolean", default: "1" },
      { key: "residences_heading", label: "Heading", type: "text", default: "The Residences" },
      { key: "swipe_hint_text", label: "Swipe hint text", type: "text", default: "Swipe for more" },
    ],
  },
  {
    slug: "highlights",
    title: "Highlights",
    description: "Status seal and intro text (cards are managed under Highlight Cards).",
    fields: [
      { key: "show_highlights", label: "Show this section", type: "boolean", default: "1" },
      { key: "highlights_seal", label: "Status seal text", type: "text", default: "Tower 1 Nearing Completion" },
      { key: "highlights_intro", label: "Intro paragraph", type: "textarea", default: "A quick look at what sets the address apart — from the land it stands on to the life it makes possible." },
    ],
  },
  {
    slug: "location",
    title: "Location",
    description: "Address, map image and directions link.",
    fields: [
      { key: "show_location", label: "Show this section", type: "boolean", default: "1" },
      { key: "location_heading", label: "Heading", type: "text", default: "In the Heart of South Mumbai: Lower Parel" },
      { key: "location_address", label: "Address", type: "html", default: "The Grand,<br>Shankar Rao Naram Path, Lower Parel West, Mumbai 400013, Maharashtra", help: "Use <br> for a line break." },
      { key: "location_para", label: "Paragraph", type: "textarea", default: "Minutes from Mumbai's top business hubs and finest lifestyle destinations, with every corner of the city within easy reach." },
      { key: "location_map_url", label: "Google Maps link", type: "url", default: "https://maps.app.goo.gl/o37YPUHj4muynPPFA" },
      { key: "location_directions_label", label: "Directions button text", type: "text", default: "Get Directions" },
      { key: "location_map_image", label: "Map image", type: "image", default: "/uploads/location-map.jpg" },
      { key: "location_map_alt", label: "Map image description (alt)", type: "text", default: "Map showing The Grand in Lower Parel, near the Bandra-Worli Sea Link, St. Regis, Four Seasons and Phoenix Palladium" },
      { key: "location_map_caption", label: "Map caption", type: "text", default: "Image captured on 12 October 2026" },
    ],
  },
  {
    slug: "amenities",
    title: "Amenities",
    description: "Title, background and closing line (the list is managed under Amenity List).",
    fields: [
      { key: "show_amenities", label: "Show this section", type: "boolean", default: "1" },
      { key: "amenities_title", label: "Title", type: "text", default: "Some experiences are best discovered in person." },
      { key: "amenities_more", label: "Closing line", type: "text", default: "and many more world-class amenities…" },
      { key: "amenities_image", label: "Background image", type: "image", default: "/uploads/amenities-bg.jpg" },
    ],
  },
  {
    slug: "legacy",
    title: "Legacy",
    description: "Developer legacy section.",
    fields: [
      { key: "show_legacy", label: "Show this section", type: "boolean", default: "1" },
      { key: "legacy_heading", label: "Heading", type: "text", default: "Over 55 years of legacy in Mumbai's Real Estate." },
      { key: "legacy_body", label: "Text", type: "textarea", default: "Under the leadership of Samir N. Bhojwani, the firm’s direction has always been — prominent locations and lavish layouts, blending thoughtful design with superior amenities, trusted by the top business and media industry leaders.\n\nThe firm has landmark projects on the way – at Carter Road, Pali Hill and South Mumbai.", help: "Leave an empty line between paragraphs." },
      { key: "legacy_image", label: "Background image", type: "image", default: "/uploads/legacy-bg.jpg" },
    ],
  },
  {
    slug: "legal",
    title: "Legal & Footer",
    description: "Fine-print heading, contact dialog and footer (accordions are managed under Legal Content).",
    fields: [
      { key: "show_legal", label: "Show this section", type: "boolean", default: "1" },
      { key: "legal_heading", label: "Heading", type: "text", default: "The fine print." },
      { key: "legal_intro", label: "Intro paragraph", type: "textarea", default: "Please read the following before making any purchase decision, and verify all project details independently." },
      { key: "contact_button_label", label: "Contact button text", type: "text", default: "Contact Us" },
      { key: "contact_title", label: "Contact dialog title", type: "text", default: "Contact Us" },
      { key: "contact_text", label: "Contact dialog text", type: "html", default: "You may contact us through a trusted channel partner.", help: "Basic HTML allowed, e.g. <a href=\"tel:...\">." },
      { key: "footer_address", label: "Footer address line", type: "text", default: "THE GRAND, TOWER 1 (NEARING COMPLETION), SHANKAR RAO NARAM PATH, LOWER PAREL WEST, MUMBAI 400013, MAHARASHTRA" },
      { key: "footer_rera", label: "Footer RERA line", type: "text", default: "MahaRERA Registration No. P51900076793 · maharerait.maharashtra.gov.in" },
    ],
  },
  {
    slug: "rera",
    title: "RERA dialog",
    description: "Popup opened by the RERA Details button.",
    fields: [
      { key: "rera_number", label: "Registration text", type: "text", default: "MahaRERA P51900076793" },
      { key: "rera_qr_image", label: "QR code image", type: "image", default: "/uploads/rera-qr.jpg" },
      { key: "rera_qr_alt", label: "QR image description (alt)", type: "text", default: "Scan to verify this project on the official MahaRERA portal" },
      { key: "rera_note_before", label: "Note text (before link)", type: "text", default: "Scan the code, or visit" },
      { key: "rera_url", label: "RERA portal link", type: "url", default: "https://maharerait.maharashtra.gov.in" },
      { key: "rera_link_label", label: "Link text", type: "text", default: "maharerait.maharashtra.gov.in" },
      { key: "rera_note_after", label: "Note text (after link)", type: "text", default: "for registration details." },
    ],
  },
];

export const ALL_FIELDS: FieldDef[] = SETTING_GROUPS.flatMap((g) => g.fields);

export type Settings = Record<string, string>;

export function defaultSettings(): Settings {
  return Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.default]));
}
