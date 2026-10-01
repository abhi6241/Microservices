import { Link } from "react-router-dom";
import { GoogleMark, Icon } from "../components/ui.jsx";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <GoogleMark size={40} />
      <p className="mt-6 font-mono text-sm text-faint">404</p>
      <h1 className="mt-1 text-3xl font-normal tracking-tight text-ink">That page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted">
        The link may be broken, or the page was moved. Let&apos;s get you back to the feed.
      </p>
      <Link to="/" className="g-btn-primary mt-6">
        <Icon name="home" size={18} /> Go home
      </Link>
    </div>
  );
}
