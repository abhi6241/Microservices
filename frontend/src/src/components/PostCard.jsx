import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fullDate, isProbablyUrl, timeAgo } from "../lib/format.js";
import { Avatar, Icon } from "./ui.jsx";

export default function PostCard({ post, onDelete, deleting = false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const id = post._id || post.id || post.postId;
  const author = post.authorUsername || post.username || "unknown";
  const createdAt = post.createdAt || post.timestamp;
  const mine = user && (String(post.user) === String(user.userId) || author === user.username);
  const mediaIds = Array.isArray(post.mediaIds) ? post.mediaIds : [];

  const share = async () => {
    const url = `${window.location.origin}/post/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <article className="g-card animate-fade-up p-4 transition hover:shadow-pop sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar name={author} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-medium text-ink">{author}</span>
            <span className="shrink-0 text-[13px] text-faint" title={fullDate(createdAt)}>
              · {timeAgo(createdAt)}
            </span>
          </div>
          <p className="font-mono text-[11px] text-faint">id {String(id).slice(-8)}</p>
        </div>
        {mine ? (
          <div className="relative shrink-0">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="rounded-full p-2 text-faint hover:bg-container-low hover:text-google-red"
                title="Delete post"
              >
                <Icon name="delete" size={20} />
              </button>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-[#fce8e6] p-1 pl-3 text-xs font-medium text-[#a50e0e]">
                Delete?
                <button
                  onClick={() => onDelete?.(id)}
                  disabled={deleting}
                  className="rounded-full bg-google-red px-3 py-1.5 text-xs font-medium text-white hover:brightness-95 disabled:opacity-60"
                >
                  {deleting ? "…" : "Yes"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-full px-2 py-1.5 hover:bg-white"
                >
                  No
                </button>
              </span>
            )}
          </div>
        ) : null}
      </div>

      <Link to={`/post/${id}`} className="mt-2.5 block">
        <p className="post-content text-[15px] leading-6 text-ink">{post.content}</p>
      </Link>

      {mediaIds.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {mediaIds.slice(0, 4).map((m) => (
            <div key={String(m)} className="overflow-hidden rounded-xl border border-hairline bg-container-low">
              {isProbablyUrl(m) ? (
                <img src={m} alt="Post attachment" loading="lazy" className="h-40 w-full object-cover" />
              ) : (
                <span className="flex h-16 items-center gap-2 px-3 font-mono text-[11px] text-muted">
                  <Icon name="attach_file" size={16} className="shrink-0 text-faint" />
                  <span className="truncate">{String(m)}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Google-style action bar */}
      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-1.5">
        <button
          onClick={() => setLiked((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition ${
            liked ? "text-google-red" : "text-muted hover:bg-container-low"
          }`}
          aria-pressed={liked}
        >
          <Icon name="favorite" filled={liked} size={19} />
          {liked ? "Loved" : "Like"}
        </button>
        <Link
          to={`/post/${id}`}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-muted transition hover:bg-container-low"
        >
          <Icon name="chat_bubble" size={19} />
          Open
        </Link>
        <button
          onClick={share}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-muted transition hover:bg-container-low"
        >
          <Icon name="share" size={19} />
          Share
        </button>
        <button
          className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-muted transition hover:bg-container-low sm:flex"
          title="Save (local only)"
        >
          <Icon name="bookmark" size={19} />
          Save
        </button>
      </div>
    </article>
  );
}
