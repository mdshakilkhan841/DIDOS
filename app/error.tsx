"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="not-found">
      <h1>We couldn’t load this page.</h1>
      <p>Please retry. Unsaved changes may need to be entered again.</p>
      <button onClick={reset}>Try again</button>
      <Link href="/en/app">Return to workspace</Link>
    </main>
  );
}
