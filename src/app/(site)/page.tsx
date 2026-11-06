import { Fragment } from "react";
import Script from "next/script";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const cssUrl = (u: string) => `url("${u.replace(/["\\\n\r]/g, "")}")`;
const on = (v?: string) => v === "1" || v === "true";

/** Renders "a.b.c" as a.<wbr>b.c like the original RERA link (break points after all but the last dot). */
function wbrDots(text: string) {
  const parts = text.split(".");
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && "."}
      {i < parts.length - 2 && <wbr />}
    </Fragment>
  ));
}

export default async function HomePage() {
  const { settings: s, nav, slides, highlights, amenities, legal } = await getSiteContent();

  const visible: Record<string, boolean> = {
    residences: on(s.show_residences),
    highlights: on(s.show_highlights),
    location: on(s.show_location),
    amenities: on(s.show_amenities),
    legacy: on(s.show_legacy),
    legal: on(s.show_legal),
  };
  const navOk = (t: string) => visible[t] !== false;
  const menu = nav.filter((n) => n.showInNav && navOk(n.target));
  const index = nav.filter((n) => n.showInIndex && navOk(n.target));
  const dot = (id: string) => nav.find((n) => n.target === id)?.label;

  const rootVars = `:root{--img-hero:${cssUrl(s.hero_image)};--img-experience:${cssUrl(s.experience_image)};--img-amenities:${cssUrl(s.amenities_image)};--img-legacy:${cssUrl(s.legacy_image)}}`;
  const legacyParas = (s.legacy_body || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const ai = s.artist_impression_label;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: rootVars }} />
      <div className="page-dots" id="pageDots" aria-label="Pages"></div>
      <div className="up-toast" id="upToast" aria-hidden="true"></div>
      <button type="button" className="fs-btn" id="fsBtn" aria-label="Full screen" title="Full screen">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path className="fs-in" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          <path className="fs-out" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        </svg>
      </button>

      <nav>
        <a href="#" className="logo nav-home" data-home="" aria-label="Back to home">{s.logo_text}</a>
        <input type="checkbox" id="navToggle" className="nav-toggle" />
        <label htmlFor="navToggle" className="nav-burger" aria-label="Open menu"><span></span><span></span><span></span></label>
        <div className="links">
          <a href="#" className="home-link" data-home="">{s.nav_home_label}</a>
          {menu.map((n) => (
            <a key={n.id} href={`#${n.target}`}>{n.label}</a>
          ))}
        </div>
      </nav>

      <header className="hero hero-black">
        {/* Phones + tablets only: full (uncropped) hero image. The 1px source stops desktops from downloading it. */}
        <picture className="hero-pic">
          <source media="(min-width: 1024px)" srcSet="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.hero_image} alt="" fetchPriority="high" />
          <span className="ai-tag">{ai}</span>
        </picture>
        <div className="hero-text">
          <h1>{s.hero_title}</h1>
          <div className="eyebrow">{s.hero_eyebrow}</div>
          <div className="sub">{s.hero_sub}</div>
        </div>
        <div className="ai-tag hero-ai">{ai}</div>
        <button type="button" className="enter-btn" id="enterBtn">
          {s.hero_button} <span aria-hidden="true">{"→"}</span>
        </button>
      </header>

      <section id="experience" className="experience" aria-label="Experience">
        <button type="button" className="hero-rera ex-rera" data-open-dialog="reraModal">{s.rera_button_label}</button>
        <a href="#legal" className="hero-rera ex-rera ex-legal">{s.legal_button_label}</a>
        <div className="ex-in">
          <ol className="ex-list">
            {index.map((n) => (
              <li key={n.id}>
                <a href={`#${n.target}`}>
                  <span className="ex-n">{n.number}</span>
                  <span className="ex-t">{n.label}</span>
                  <span className="ex-a" aria-hidden="true">{"→"}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {visible.residences && (
        <section id="residences" data-dot={dot("residences")}>
          <div className="visual">
            <div className="swipe-hint" aria-hidden="true">
              <span className="sh-hand">
                <svg viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.7-2.3L4.4 15a1.6 1.6 0 0 1 2.4-2.1L9 15" /></svg>
              </span>
              <span className="sh-txt">{s.swipe_hint_text}</span>
              <span className="sh-arr">{"››"}</span>
            </div>
            <div className="sl-count" aria-hidden="true"></div>
            <div className="visual-track" id="resTrack">
              {slides.map((sl) => (
                <div
                  key={sl.id}
                  className="visual-slide rimg"
                  role="img"
                  aria-label={sl.alt}
                  style={{ backgroundImage: cssUrl(sl.image), ...(sl.position ? { backgroundPosition: sl.position } : {}) }}
                ></div>
              ))}
            </div>
            <div className="ai-tag">{ai}</div>
            <button type="button" className="visual-arrow visual-arrow-prev" aria-label="Previous image" data-slide="prev">{"‹"}</button>
            <button type="button" className="visual-arrow visual-arrow-next" aria-label="Next image" data-slide="next">{"›"}</button>
            <div className="visual-dots" id="resDots"></div>
          </div>
          <div className="res-cap res-below"><h2>{s.residences_heading}</h2></div>
        </section>
      )}

      {visible.highlights && (
        <section id="highlights" data-dot={dot("highlights")}>
          <div className="intro">
            <div className="status-seals">
              <div className="seal">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>
                <div><b>{s.highlights_seal}</b></div>
              </div>
            </div>
            <p>{s.highlights_intro}</p>
          </div>
          <div className="facts">
            {highlights.map((h) => (
              <div className="fact" key={h.id}>
                <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: h.icon }} />
                <b>{h.title}</b>
                <span>{h.subtitle}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {visible.location && (
        <section id="location" className="g-loc" aria-label="Location" data-dot={dot("location")}>
          <div className="gl-grid">
            <div className="gl-text">
              <h2>{s.location_heading}</h2>
              <p className="gl-addr">
                <a href={s.location_map_url} target="_blank" rel="noopener" dangerouslySetInnerHTML={{ __html: s.location_address }} />
              </p>
              <p className="gl-para">{s.location_para}</p>
              <a className="dir-btn gl-dir" href={s.location_map_url} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
                {s.location_directions_label}
                <span aria-hidden="true">{"→"}</span>
              </a>
            </div>
            <figure className="gl-map">
              <a href={s.location_map_url} target="_blank" rel="noopener" aria-label="Open in Google Maps">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.location_map_image} alt={s.location_map_alt} />
              </a>
              {s.location_map_caption && <figcaption>{s.location_map_caption}</figcaption>}
            </figure>
          </div>
        </section>
      )}

      {visible.amenities && (
        <section id="amenities" className="g-amen" aria-label="Amenities" data-dot={dot("amenities")}>
          <div className="gm-in">
            <h2 className="gm-title">{s.amenities_title}</h2>
            <ul className="gm-list">
              {amenities.map((a) => (
                <li key={a.id}>
                  <span className="gm-mono">
                    <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: a.icon }} />
                  </span>
                  <span className="gm-name">{a.name}</span>
                </li>
              ))}
            </ul>
            {s.amenities_more && <p className="gm-more">{s.amenities_more}</p>}
          </div>
          <div className="ai-tag gm-ai">{ai}</div>
        </section>
      )}

      {visible.legacy && (
        <section id="legacy" className="g-marble" data-dot={dot("legacy")}>
          <div className="intro">
            <h2>{s.legacy_heading}</h2>
            {legacyParas.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {visible.legal && (
        <section id="legal" className="legal" data-dot={s.legal_button_label}>
          <div className="intro">
            <h2>{s.legal_heading}</h2>
            <p>{s.legal_intro}</p>
          </div>
          <div className="legal-list">
            {legal.map((sec) => {
              let n = 0;
              return (
                <details key={sec.id}>
                  <summary>
                    {sec.title}
                    <span className="legal-toggle"></span>
                  </summary>
                  {sec.paragraphs.map((p) => {
                    if (p.kind === "heading") {
                      n = 0;
                      return <p key={p.id} className="legal-h" dangerouslySetInnerHTML={{ __html: p.content }} />;
                    }
                    if (p.kind === "numbered") {
                      n += 1;
                      return (
                        <p key={p.id} dangerouslySetInnerHTML={{ __html: `<span class="legal-num">${n}.</span> ${p.content}` }} />
                      );
                    }
                    return <p key={p.id} dangerouslySetInnerHTML={{ __html: p.content }} />;
                  })}
                </details>
              );
            })}
          </div>

          <div className="g-contact-row">
            <button type="button" className="hero-rera g-contact-btn" data-open-dialog="contactDlg">{s.contact_button_label}</button>
          </div>
          <footer className="g-foot">
            <div className="footer-top"><span>{s.footer_address}</span></div>
            <div className="footer-rera">{s.footer_rera}</div>
          </footer>
        </section>
      )}

      <dialog id="contactDlg" className="contact-dlg" aria-label={s.contact_title} data-backdrop-close="">
        <div className="cd-in">
          <button type="button" className="cd-close" aria-label="Close" data-close-dialog="">{"×"}</button>
          <h3>{s.contact_title}</h3>
          <span className="cd-rule" aria-hidden="true"></span>
          <p dangerouslySetInnerHTML={{ __html: s.contact_text }} />
        </div>
      </dialog>

      <dialog id="reraModal" className="rera-modal">
        <div className="rera-modal-inner">
          <button type="button" className="rera-close" data-close-dialog="" aria-label="Close">{"×"}</button>
          <p className="rera-number">{s.rera_number}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rera-qr" src={s.rera_qr_image} alt={s.rera_qr_alt} />
          <p className="rera-note">
            {s.rera_note_before}{" "}
            <a href={s.rera_url} target="_blank" rel="noopener">{wbrDots(s.rera_link_label)}</a>{" "}
            {s.rera_note_after}
          </p>
        </div>
      </dialog>

      <Script src="/site.js?v=4" strategy="afterInteractive" />
    </>
  );
}
