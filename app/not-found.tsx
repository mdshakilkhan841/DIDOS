import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">DUDOS · 404</span>
      <h1>This page isn’t here.</h1>
      <p>Choose a solution or return to your workspace.</p>
      <Link href="/en">Explore DUDOS</Link>
      <Link href="/en/app">Open workspace</Link>
    </main>
  );
}
