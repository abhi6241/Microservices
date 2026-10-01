import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar, GoogleMark, Icon } from "./ui.jsx";

const NAV = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/search", label: "Explore", icon: "travel_explore" },
  { to: "/media", label: "Media", icon: "photo_library" },
  { to: "/profile", label: "Profile", icon: "person" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Google-style top bar ─────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-app items-center gap-2 px-3 sm:gap-4 sm:px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1.5 hover:bg-container-low">
            <GoogleMark size={24} />
            <span className="hidden text-[19px] font-medium tracking-tight text-ink min-[420px]:block">
              Pulse<span className="text-google-blue">board</span>
            </span>
          </Link>

          {/* Central pill search — the Google signature */}
          <form onSubmit={submitSearch} className="mx-auto w-full max-w-xl flex-1" role="search">
            <label className="group flex h-11 items-center gap-2 rounded-full bg-container-low px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:shadow-pop focus-within:ring-hairline hover:shadow-card">
              <Icon name="search" size={20} className="shrink-0 text-faint" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search posts, topics, people…"
                className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
                aria-label="Search posts"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="rounded-full p-1 text-faint hover:bg-container hover:text-ink"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={18} />
                </button>
              ) : (
                <Icon name="keyboard" size={20} className="hidden text-faint sm:block" />
              )}
            </label>
          </form>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/media"
              className="hidden rounded-full p-2.5 text-muted hover:bg-container-low sm:block"
              title="Upload media"
            >
              <Icon name="add_photo_alternate" size={22} />
            </Link>
            <button
              className="hidden rounded-full p-2.5 text-muted hover:bg-container-low sm:block"
              title="Notifications"
              onClick={() => navigate("/")}
            >
              <Icon name="notifications" size={22} />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 rounded-full p-1 transition hover:bg-container-low"
                aria-haspopup="menu"
                aria-label="Account"
              >
                <Avatar name={user?.username || "?"} size={34} ring />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-12 w-72 animate-fade-in overflow-hidden rounded-2xl border border-hairline bg-white shadow-pop">
                  <div className="flex flex-col items-center px-5 pb-4 pt-6">
                    <Avatar name={user?.username || "?"} size={56} />
                    <p className="mt-2 text-[15px] font-medium text-ink">Hi, {user?.username || "there"}!</p>
                    <p className="max-w-full truncate text-sm text-muted">{user?.email || ""}</p>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="g-btn-outline mt-3 w-full !py-2 text-sm"
                    >
                      Manage your Pulse account
                    </Link>
                  </div>
                  <div className="border-t border-hairline bg-container-low/60 px-2 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-white"
                    >
                      <Icon name="logout" size={20} className="text-muted" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-app gap-5 px-3 pb-24 pt-5 sm:px-5 lg:grid-cols-[15rem_minmax(0,1fr)_19rem] lg:pb-10">
        {/* ── Left nav ── */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-hairline bg-white p-3 shadow-card">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon name={item.icon} filled={isActive} size={22} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
            <div className="mx-2 my-2 border-t border-hairline" />
            <div className="px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">Services</p>
              <ul className="mt-2 space-y-1.5 text-[13px] text-muted">
                {[
                  ["Identity", "3001"],
                  ["Posts", "3002"],
                  ["Media", "3003"],
                  ["Search", "3004"],
                ].map(([name, port]) => (
                  <li key={name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-google-green" />
                      {name}
                    </span>
                    <span className="font-mono text-[11px] text-faint">:{port}</span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* ── Main column ── */}
        <main className="min-w-0">
          <Outlet />
        </main>

        {/* ── Right rail ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <section className="g-card p-5">
              <h3 className="text-[15px] font-medium text-ink">Trending in Pulse</h3>
              <ul className="mt-3 space-y-3">
                {[
                  ["microservices", "12.4K posts"],
                  ["rabbitmq", "8.1K posts"],
                  ["cloudinary", "5.6K posts"],
                  ["redis cache", "3.2K posts"],
                ].map(([tag, count]) => (
                  <li key={tag}>
                    <Link
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="group block rounded-xl px-2 py-1.5 hover:bg-container-low"
                    >
                      <p className="text-[13px] text-faint">Trending</p>
                      <p className="text-[15px] font-medium text-ink group-hover:text-google-blue">#{tag}</p>
                      <p className="text-[13px] text-faint">{count}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className="g-card p-5">
              <h3 className="text-[15px] font-medium text-ink">How it works</h3>
              <ol className="mt-3 space-y-2.5 text-[13px] leading-5 text-muted">
                <li className="flex gap-2.5">
                  <Icon name="edit_square" size={18} className="mt-0.5 shrink-0 text-google-blue" />
                  Compose — stored by post-service, cached in Redis.
                </li>
                <li className="flex gap-2.5">
                  <Icon name="hub" size={18} className="mt-0.5 shrink-0 text-google-blue" />
                  Events fan out over RabbitMQ to search &amp; media.
                </li>
                <li className="flex gap-2.5">
                  <Icon name="travel_explore" size={18} className="mt-0.5 shrink-0 text-google-blue" />
                  Explore indexes stay fresh for full-text search.
                </li>
              </ol>
            </section>
            <p className="px-2 text-xs leading-5 text-faint">
              Gateway :3000 · Terms · Privacy · About
              <br />© 2026 Pulseboard
            </p>
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-1.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium ${
                  isActive ? "text-primary" : "text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`rounded-full px-5 py-1 ${isActive ? "bg-primary-container" : ""}`}>
                    <Icon name={item.icon} filled={isActive} size={22} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
