import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import { Alert, EmptyState, Icon, SkeletonCard } from "../components/ui.jsx";
import { postsApi } from "../lib/api.js";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await postsApi.get(id);
        // Backend returns the doc directly (cached or fresh).
        const doc = data.post || data;
        if (alive) setPost(doc && (doc._id || doc.id || doc.content) ? doc : null);
      } catch (err) {
        if (alive) setError(err.message || "Couldn't open that post.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleDelete = async () => {
    try {
      await postsApi.remove(id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Couldn't delete that post.");
    }
  };

  return (
    <div className="space-y-4">
      <Link to="/" className="g-chip w-fit">
        <Icon name="arrow_back" size={17} />
        Back to Home
      </Link>
      {loading ? (
        <SkeletonCard />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : !post ? (
        <EmptyState
          icon="find_in_page"
          title="Post not found"
          body="It may have been deleted, or the id in the URL is wrong."
          action={
            <Link to="/" className="g-btn-primary mt-5">
              Go home
            </Link>
          }
        />
      ) : (
        <>
          <PostCard post={post} onDelete={handleDelete} />
          <p className="px-1 font-mono text-[11px] text-faint">GET /v1/posts/{id} · cached 5 min in Redis</p>
        </>
      )}
    </div>
  );
}
