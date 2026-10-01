import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import { Alert, Avatar, Icon, SkeletonCard, Spinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { postsApi } from "../lib/api.js";
import { fullDate, normalizePostsPayload } from "../lib/format.js";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // No dedicated "my posts" endpoint — filter the latest page client-side.
        const data = await postsApi.list(1, 50);
        const norm = normalizePostsPayload(data);
        if (!alive) return;
        setMine(
          norm.posts.filter((p) => {
            const author = p.authorUsername || p.username;
            return (
              (user?.userId && String(p.user) === String(user.userId)) ||
              (user?.username && author === user.username)
            );
          }),
        );
      } catch (err) {
        if (alive) setError(err.message || "Couldn't load your posts.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.userId, user?.username]);

  const handleDelete = async (id) => {
    try {
      await postsApi.remove(id);
      setMine((prev) => prev.filter((p) => String(p._id || p.id) !== String(id)));
    } catch (err) {
      setError(err.message || "Couldn't delete that post.");
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <div className="space-y-4">
      {/* Google-account style profile header */}
      <section className="g-card animate-fade-up overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#4285F4] via-[#9b72cb] to-[#d96570]" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-3">
            <Avatar name={user?.username || "?"} size={72} ring />
            <button onClick={handleLogout} disabled={signingOut} className="g-btn-outline !py-2 text-sm">
              {signingOut ? <Spinner label="Signing out…" /> : (<><Icon name="logout" size={18} /> Sign out</>)}
            </button>
          </div>
          <h1 className="mt-3 text-[22px] font-normal tracking-tight">{user?.username || "Your profile"}</h1>
          <p className="text-sm text-muted">{user?.email || ""}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["edit_note", String(mine.length), "posts"],
              ["badge", user?.userId ? `…${String(user.userId).slice(-6)}` : "—", "user id"],
              ["event", user?.createdAt ? fullDate(user.createdAt) : "—", "member since"],
            ].map(([icon, value, label]) => (
              <div key={label} className="rounded-2xl bg-container-low px-4 py-3">
                <p className="flex items-center gap-1.5 text-[13px] text-faint">
                  <Icon name={icon} size={16} /> {label}
                </p>
                <p className="mt-0.5 truncate text-[15px] font-medium text-ink" title={value}>{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-faint">GET /v1/auth/me · gateway validates the JWT</p>
        </div>
      </section>

      {error ? <Alert>{error}</Alert> : null}

      <h2 className="px-1 text-[15px] font-medium text-ink">Your posts</h2>
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : mine.length === 0 ? (
        <div className="g-card flex flex-col items-center px-6 py-10 text-center">
          <Icon name="edit_note" size={30} className="text-primary" />
          <p className="mt-2 font-medium">No posts yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Head home and use the composer — your posts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mine.map((p) => (
            <PostCard key={p._id || p.id} post={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
