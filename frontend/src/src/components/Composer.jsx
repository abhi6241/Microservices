import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { mediaApi, postsApi } from "../lib/api.js";
import { Alert, Avatar, Icon, Spinner } from "./ui.jsx";

const MAX_LEN = 5000;

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaIds, setMediaIds] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const remaining = MAX_LEN - content.length;
  const canPost = content.trim().length >= 3 && remaining >= 0 && !posting;

  const attach = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const res = await mediaApi.upload(file);
      // Backend returns { mediaId: <Media doc>, url } — accept every shape.
      const doc = res.mediaId && typeof res.mediaId === "object" ? res.mediaId : res;
      const id = doc._id || doc.id || doc.mediaId || res.mediaId;
      const url = doc.url || res.url;
      setMediaIds((prev) => [...prev, typeof id === "string" ? id : JSON.stringify(id)]);
      if (url) setMediaUrls((prev) => [...prev, url]);
    } catch (err) {
      setError(err.message || "Media upload failed. You can still post text.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!canPost) return;
    setError("");
    setPosting(true);
    try {
      const res = await postsApi.create({ content: content.trim(), mediaIds });
      setContent("");
      setMediaIds([]);
      setMediaUrls([]);
      onPosted?.(res.post || res);
    } catch (err) {
      setError(err.message || "Couldn't publish your post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="g-card animate-fade-up p-4 sm:p-5" aria-label="Create a post">
      <div className="flex gap-3">
        <Avatar name={user?.username || "?"} size={40} />
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            placeholder="Share an update…"
            maxLength={MAX_LEN + 100}
            className="autogrow max-h-56 min-h-[3.5rem] w-full resize-none rounded-2xl bg-container-low px-4 py-3 text-[15px] leading-6 text-ink outline-none transition placeholder:text-faint focus:bg-white focus:shadow-focus focus:ring-1 focus:ring-google-blue"
          />
          {mediaUrls.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {mediaUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Attachment preview"
                  className="h-20 w-20 rounded-xl border border-hairline object-cover"
                />
              ))}
            </div>
          ) : null}
          {mediaIds.length > 0 && mediaUrls.length === 0 ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              <Icon name="attach_file" size={15} />
              {mediaIds.length} attachment{mediaIds.length > 1 ? "s" : ""} linked
            </p>
          ) : null}
          {error ? (
            <div className="mt-3">
              <Alert>{error}</Alert>
            </div>
          ) : null}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center">
              <input ref={fileRef} type="file" className="hidden" onChange={attach} accept="image/*,video/*" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-full p-2 text-google-blue transition hover:bg-primary-soft disabled:opacity-50"
                title="Add photo or video (uploads to media-service)"
              >
                {uploading ? <Spinner label="" /> : <Icon name="add_photo_alternate" size={22} />}
              </button>
              <button
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-container-low"
                title="Emoji (coming soon)"
                onClick={() => setContent((c) => `${c}😊`)}
              >
                <Icon name="mood" size={22} />
              </button>
              <span className={`ml-1 font-mono text-xs ${remaining < 0 ? "text-google-red" : "text-faint"}`}>
                {remaining.toLocaleString()}
              </span>
            </div>
            <button onClick={submit} disabled={!canPost} className="g-btn-primary min-w-[7rem] !py-2">
              {posting ? <Spinner label="Posting…" /> : "Post"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
