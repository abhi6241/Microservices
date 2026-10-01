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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (username.trim().length < 3) next.username = "Username needs at least 3 characters.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err.message || "Couldn't create your account. Try a different username or email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="to start posting on Pulseboard"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-google-blue hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {formError ? <Alert>{formError}</Alert> : null}
        <Field label="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} />
        <Field label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Password (min 6 characters)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted">Gateway: /v1/auth/register</span>
          <button type="submit" disabled={busy} className="g-btn-primary min-w-[6.5rem]">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
