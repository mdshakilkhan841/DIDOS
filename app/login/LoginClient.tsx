"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/dudos-ui";
import { useAuth } from "@/context/auth-context";

const HIGHLIGHTS = [
  "Save drafts and send requests to DUDOS",
  "Track replies in one place",
  "Invite your team to a shared workspace",
];

export function LoginClient({
  initialMode = "signin",
  returnTo = "/",
}: {
  initialMode?: "signin" | "signup";
  returnTo?: string;
}) {
  const pathname = usePathname();
  const isRegisterPath = pathname.includes("/register") || initialMode === "signup";
  const [mode, setMode] = useState<"signin" | "signup">(isRegisterPath ? "signup" : "signin");

  useEffect(() => {
    if (pathname.includes("/register")) {
      setMode("signup");
    } else if (pathname.includes("/login")) {
      setMode("signin");
    } else {
      setMode(initialMode);
    }
  }, [pathname, initialMode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signin") {
        const ok = await login(email, password);
        if (!ok) throw new Error("Sign-in failed. Please check your credentials.");
      } else {
        const ok = await register({
          email,
          displayName,
          password,
          role: "client",
        });
        if (!ok) throw new Error("Registration failed. Please try again.");
      }
      window.location.replace(returnTo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left — brand panel, hidden on small screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[var(--primary)] px-14 py-12 text-white md:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-black/10 blur-3xl"
        />

        <a href="/" className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-xl font-bold">
            D
          </span>
          <span>
            DUDOS<span className="text-white/70">.</span>
          </span>
        </a>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Your digital work,<br />organized in one workspace.
          </h1>
          <p className="mt-4 text-white/80">
            Sign in to manage drafts, track requests and collaborate with your team — all under your own account.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 className="h-5 w-5 flex-none text-white/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} DUDOS</p>
      </div>

      {/* Right — the actual sign-in / sign-up form */}
      <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 sm:px-12 md:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <a href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-xl font-bold text-white">
              D
            </span>
            <span>
              DUDOS<span className="text-[var(--primary)]">.</span>
            </span>
          </a>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in to your workspace" : "Create your DUDOS account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Use the email and password for your DUDOS account."
              : "Set up an account to save drafts and send requests."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="display-name">Full name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={200}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            {error && <Notice tone="error">{error}</Notice>}
            <Button disabled={busy} type="submit" className="w-full">
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                No account yet?{" "}
                <Link
                  href={returnTo && returnTo !== "/app" ? `/register?return_to=${encodeURIComponent(returnTo)}` : "/register"}
                  className="font-medium text-[var(--primary)] hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href={returnTo && returnTo !== "/app" ? `/login?return_to=${encodeURIComponent(returnTo)}` : "/login"}
                  className="font-medium text-[var(--primary)] hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </Link>
              </>
            )}
          </p>

          <a href="/" className="mt-10 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Back to DUDOS <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginClient;
