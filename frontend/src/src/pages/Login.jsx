import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { Alert } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Field({ label, error, ...props }) {
  const [focused, setFocused] = useState(false);
  const filled = Boolean(props.value) || focused;
  return (
    <div className={`g-field relative ${filled ? "filled" : ""} ${error ? "error" : ""}`}>
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className="g-input"
        placeholder={label}
      />
      <label className="g-label">{label}</label>
      {error ? <p className="mt-1 text-xs text-google-red">{error}</p> : null}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setBusy(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="to continue to Pulseboard"
      footer={
        <>
          New to Pulseboard?{" "}
          <Link to="/register" className="font-medium text-google-blue hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        <Field label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="relative">
          <Field
            label="Password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-faint hover:bg-container-low"
            aria-label={show ? "Hide password" : "Show password"}
          >
            <span className="material-symbols-rounded text-[20px]">{show ? "visibility_off" : "visibility"}</span>
          </button>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted">Gateway: /v1/auth/login</span>
          <button type="submit" disabled={busy} className="g-btn-primary min-w-[6.5rem]">
            {busy ? "Signing in…" : "Next"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
