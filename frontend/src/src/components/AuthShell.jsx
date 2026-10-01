import { Link } from "react-router-dom";
import { GoogleMark } from "./ui.jsx";

/**
 * Google accounts-style centered auth shell: white card on a clean canvas,
 * G mark, product name, and a contextual side panel on large screens.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="m-auto w-full max-w-4xl px-4 py-10">
        <div className="overflow-hidden rounded-[1.75rem] border border-hairline bg-white shadow-card">
          <div className="grid md:grid-cols-[1fr_1.15fr]">
            {/* Brand panel */}
            <div className="hidden flex-col justify-between bg-[#f8fafd] p-10 md:flex">
              <div>
                <div className="flex items-center gap-2.5">
                  <GoogleMark size={26} />
                  <span className="text-[19px] font-medium tracking-tight text-ink">
                    Pulse<span className="text-google-blue">board</span>
                  </span>
                </div>
                <h1 className="mt-10 text-[32px] font-normal leading-[2.5rem] tracking-tight text-ink">
                  Share short updates across your services.
                </h1>
                <p className="mt-3 max-w-xs text-[15px] leading-6 text-muted">
                  Posts, media uploads and full-text search — all flowing through one API gateway.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-muted">
                {[
                  ["bolt", "Fast Redis-cached feed"],
                  ["cloud_upload", "Cloudinary media pipeline"],
                  ["travel_explore", "RabbitMQ-powered search index"],
                ].map(([icon, label]) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-[20px] text-google-blue">{icon}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form panel */}
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-2.5 md:hidden">
                <GoogleMark size={24} />
                <span className="text-lg font-medium tracking-tight">
                  Pulse<span className="text-google-blue">board</span>
                </span>
              </div>
              <h2 className="mt-4 text-[26px] font-normal tracking-tight text-ink md:mt-0">{title}</h2>
              {subtitle ? <p className="mt-1 text-[15px] text-muted">{subtitle}</p> : null}
              <div className="mt-6">{children}</div>
              {footer ? <div className="mt-6 text-sm text-muted">{footer}</div> : null}
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-faint">
          Protected by gateway rate-limiting &amp; JWT auth ·{" "}
          <Link to="/login" className="text-google-blue hover:underline">
            Help
          </Link>{" "}
          · Privacy · Terms
        </p>
      </div>
    </div>
  );
}
