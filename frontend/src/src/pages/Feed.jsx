import { useCallback, useEffect, useState } from "react";
import Composer from "../components/Composer.jsx";
import PostCard from "../components/PostCard.jsx";
import { Alert, EmptyState, Icon, SkeletonCard, Spinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { postsApi } from "../lib/api.js";
import { normalizePostsPayload } from "../lib/format.js";

const PAGE_SIZE = 10;

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("latest");
  const [deletingId, setDeletingId] = useState("");

  const load = useCallback(async (nextPage = 1, append = false) => {
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const data = await postsApi.list(nextPage, PAGE_SIZE);
      const norm = normalizePostsPayload(data);
      setPosts((prev) => (append ? [...prev, ...norm.posts] : norm.posts));
      setPage(norm.currentPage);
      setTotalPages(norm.totalPages);
      setTotal(norm.total);
    } catch (err) {
      setError(err.message || "Couldn't load the feed. Is the gateway running on :3000?");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

  const handlePosted = (post) => {
    if (post && (post._id || post.id)) setPosts((prev) => [post, ...prev]);
    else load(1, false);
  };

  const handleDelete = async (id) => {
    setDeletingId(String(id));
    try {
      await postsApi.remove(id);
      setPosts((prev) => prev.filter((p) => String(p._id || p.id) !== String(id)));
    } catch (err) {
      setError(err.message || "Couldn't delete that post.");
    } finally {
      setDeletingId("");
    }
  };

  const visible =
    tab === "mine" && user
      ? posts.filter((p) => {
          const author = p.authorUsername || p.username;
          return String(p.user) === String(user.userId) || (user.username && author === user.username);
        })
      : posts;

  return (
    <div className="space-y-4">
      {/* Greeting strip like Google Discover */}
      <section className="flex items-center justify-between px-1">
        <div>
          <p className="text-[13px] text-faint">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="text-[22px] font-normal tracking-tight text-ink">
            Good day, {user?.username || "reader"}
          </h1>
        </div>
        <button onClick={() => load(1, false)} className="g-btn-outline !px-4 !py-2 text-[13px]" title="Refresh feed">
          <Icon name="refresh" size={18} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </section>

      <Composer onPosted={handlePosted} />

      {/* Tabs */}
      <div className="g-card flex items-center gap-1 overflow-x-auto p-1.5" role="tablist">
        {[
          ["latest", "Latest", "schedule"],
          ["mine", "Your posts", "person"],
        ].map(([key, label, icon]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`g-chip !border-0 ${tab === key ? "active" : ""}`}
          >
            <Icon name={icon} size={17} />
            {label}
          </button>
        ))}
        <span className="ml-auto hidden whitespace-nowrap px-3 font-mono text-[11px] text-faint sm:block">
          GET /v1/posts/all-posts{typeof total === "number" ? ` · ${total} total` : ""}
        </span>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={tab === "mine" ? "person" : "forum"}
          title={tab === "mine" ? "You haven't posted yet" : "The feed is quiet"}
          body={
            tab === "mine"
              ? "Posts you create will show up here. Say hello with the composer above."
              : "Be the first to post — or check that post-service is running behind the gateway."
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((post) => (
            <PostCard
              key={post._id || post.id || post.postId}
              post={post}
              onDelete={handleDelete}
              deleting={deletingId === String(post._id || post.id)}
            />
          ))}
        </div>
      )}

      {!loading && page < totalPages ? (
        <button
          onClick={() => load(page + 1, true)}
          disabled={loadingMore}
          className="g-btn-tonal w-full !py-3"
        >
          {loadingMore ? <Spinner label="Loading more…" /> : `Load more (page ${page + 1} of ${totalPages})`}
        </button>
      ) : null}
    </div>
  );
}
