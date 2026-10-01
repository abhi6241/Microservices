import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, EmptyState, Icon, SkeletonCard } from "../components/ui.jsx";
import { searchApi } from "../lib/api.js";
import { fullDate, normalizeSearchPayload, timeAgo } from "../lib/format.js";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") || "";
  const [input, setInput] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(Boolean(initial));

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError("");
    const t = setTimeout(async () => {
      try {
        const data = await searchApi.posts(query.trim());
        if (alive) {
          setResults(normalizeSearchPayload(data));
          setSearched(true);
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Search failed. Is search-service running?");
          setSearched(true);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);

  const suggestions = useMemo(
    () => ["microservices", "rabbitmq", "redis", "cloudinary", "gateway"],
    [],
  );

  const submit = (e) => {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
    setQuery(input.trim());
  };

  return (
    <div className="space-y-4">
      <section className="g-card animate-fade-up p-4 sm:p-5">
        <form onSubmit={submit} role="search" className="flex h-12 items-center gap-2 rounded-full bg-container-low px-4 focus-within:bg-white focus-within:shadow-pop focus-within:ring-1 focus-within:ring-hairline">
          <Icon name="search" size={21} className="text-faint" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try “microservices”…"
            className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
            aria-label="Search posts"
          />
          {input ? (
            <button type="button" onClick={() => { setInput(""); setQuery(""); setParams({}); }} className="rounded-full p-1 text-faint hover:bg-container" aria-label="Clear">
              <Icon name="close" size={18} />
            </button>
          ) : null}
          <button type="submit" className="g-btn-primary !px-5 !py-2 text-sm">
            Search
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                setQuery(s);
                setParams({ q: s });
              }}
              className="g-chip"
            >
              <Icon name="trending_up" size={16} />
              {s}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-faint">GET /v1/search/posts?query=… · MongoDB text index</p>
      </section>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !searched ? (
        <EmptyState
          icon="travel_explore"
          title="Search the Pulse"
          body="Full-text search runs on the search-service index, kept fresh by RabbitMQ post events."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="search_off"
          title={`No results for “${query}”`}
          body="Try a different keyword, or create a post containing that word and search again."
        />
      ) : (
        <div className="space-y-3">
          <p className="px-1 text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for <strong className="text-ink">“{query}”</strong>
          </p>
          {results.map((r, i) => {
            const postId = r.postId || r._id || r.id || i;
            return (
              <Link
                key={`${postId}-${i}`}
                to={`/post/${postId}`}
                className="g-card block animate-fade-up p-4 transition hover:shadow-pop sm:p-5"
              >
                <p className="flex items-center gap-2 text-[13px] text-faint">
                  <Icon name="description" size={16} />
                  <span title={fullDate(r.createdAt)}>{timeAgo(r.createdAt) || "indexed result"}</span>
                  <span className="font-mono text-[11px]">· {String(postId).slice(-8)}</span>
                </p>
                <p className="post-content clamp-3 mt-1.5 text-[15px] leading-6 text-ink">{r.content}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-google-blue">
                  Open post <Icon name="arrow_forward" size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
