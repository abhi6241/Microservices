import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, EmptyState, Icon, SkeletonCard, Spinner } from "../components/ui.jsx";
import { mediaApi } from "../lib/api.js";
import { fullDate } from "../lib/format.js";

function fileLabel(m) {
  return m.originalName || m.originalname || m.name || "upload";
}

export default function Media() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await mediaApi.list();
      setItems(Array.isArray(data) ? data : data.results || data.medias || []);
    } catch (err) {
      setError(err.message || "Couldn't load media. Is media-service running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("That file is over the 5 MB multer limit. Pick something smaller.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      await mediaApi.upload(file);
      await load();
    } catch (err) {
      setError(err.message || "Upload failed. Check Cloudinary credentials on media-service.");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (m) => {
    if (!m.url) return;
    try {
      await navigator.clipboard.writeText(m.url);
      setCopied(m._id || m.url);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      window.prompt("Copy URL:", m.url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload dropzone */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        className={`g-card animate-fade-up border-2 border-dashed p-6 text-center transition sm:p-8 ${
          dragOver ? "!border-google-blue bg-primary-soft" : ""
        }`}
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-container">
          <Icon name="cloud_upload" size={28} className="text-primary" />
        </span>
        <h1 className="mt-3 text-xl font-normal tracking-tight">Media library</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Files go to <span className="font-mono text-[13px]">POST /v1/media/upload</span>, land in Cloudinary,
          and are tracked in MongoDB. Max 5 MB.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="g-btn-primary">
            {uploading ? <Spinner label="Uploading…" /> : (<><Icon name="upload" size={18} /> Choose file</>)}
          </button>
          <button onClick={load} className="g-btn-outline">
            <Icon name="refresh" size={18} /> Refresh
          </button>
        </div>
        <p className="mt-2 text-xs text-faint">…or drag &amp; drop a file here</p>
      </section>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="photo_library"
          title="No media yet"
          body="Upload your first image or video — then paste its id into a post via the composer."
        />
      ) : (
        <>
          <p className="px-1 text-sm text-muted">{items.length} file{items.length === 1 ? "" : "s"} · GET /v1/media/get</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((m) => {
              const key = m._id || m.id || m.url;
              const isImage = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(m.url || "") || (m.mimeType || "").startsWith("image/");
              return (
                <figure key={key} className="g-card group overflow-hidden">
                  {isImage && m.url ? (
                    <img src={m.url} alt={fileLabel(m)} loading="lazy" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-container-low">
                      <Icon name="movie" size={36} className="text-faint" />
                    </div>
                  )}
                  <figcaption className="p-3">
                    <p className="truncate text-[13px] font-medium text-ink" title={fileLabel(m)}>{fileLabel(m)}</p>
                    <p className="font-mono text-[11px] text-faint">{m.createdAt ? fullDate(m.createdAt) : (m.mimeType || "file")}</p>
                    <div className="mt-2 flex gap-1.5">
                      {m.url ? (
                        <a href={m.url} target="_blank" rel="noreferrer" className="g-btn-text !px-3 !py-1.5 text-[13px]">
                          <Icon name="open_in_new" size={16} /> Open
                        </a>
                      ) : null}
                      {m.url ? (
                        <button onClick={() => copyUrl(m)} className="g-btn-text !px-3 !py-1.5 text-[13px]">
                          <Icon name={copied === (m._id || m.url) ? "check" : "content_copy"} size={16} />
                          {copied === (m._id || m.url) ? "Copied" : "Copy URL"}
                        </button>
                      ) : null}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
