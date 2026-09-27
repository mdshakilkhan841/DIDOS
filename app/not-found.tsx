import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dudos-surface px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-dudos-surface-mint text-dudos-primary shadow-sm mb-6 border border-dudos-primary/20">
        <Search className="h-8 w-8" />
      </div>

      <div className="text-xs font-bold uppercase tracking-widest text-dudos-primary mb-2">
        Error 404
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-dudos-text sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-dudos-text-secondary leading-relaxed">
        The page or module you are attempting to access does not exist or has been relocated within the DUDOS control plane.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" className="gap-2">
            <Home className="h-4 w-4" />
            <span>Return to Portal</span>
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Sign In to Workspace</span>
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-xs text-dudos-text-secondary">
        Daffodil Unified Digital Operating System (DUDOS)
      </div>
    </div>
  );
}
