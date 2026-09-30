import { getAuthToken } from "@/lib/dudos/assessment-sync";

export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

/** build: charged in credits for a project · credit: top-up pack sold for money · public: marketing card. */
export type PackageKind = "build" | "credit" | "public";

export interface DudosPackage {
    id: string;
    kind: PackageKind;
    slug?: string | null;
    name: string;
    nameBn?: string | null;
    description?: string | null;
    descriptionBn?: string | null;
    features: string[];
    credits?: number | null;
    /** Name of the amount in `credits`, e.g. "Credits" or "Tokens". */
    unit?: string | null;
    priceBdt?: number | null;
    priceUsd?: number | null;
    badge?: string | null;
    sortOrder: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Active packages of one kind, or null when the backend is unreachable. */
export async function fetchPackages(kind: PackageKind): Promise<DudosPackage[] | null> {
    try {
        const res = await fetch(`${API_BASE}/packages?kind=${kind}`, { cache: "no-store" });
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
    } catch {
        return null;
    }
}

export function authHeaders(json = false): Record<string, string> {
    const token = getAuthToken();
    return {
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export const formatBdt = (value?: number | null) =>
    value === null || value === undefined ? "" : `৳${value.toLocaleString()}`;
export const formatUsd = (value?: number | null) =>
    value === null || value === undefined ? "" : `$${value.toLocaleString()}`;

export const DEFAULT_UNIT = "Credits";
export const UNIT_SUGGESTIONS = ["Credits", "Tokens", "Points", "Coins"];

/** "1,000 Tokens" — the package amount with its unit. */
export const formatAmount = (value?: number | null, unit?: string | null) =>
    `${(value || 0).toLocaleString()} ${unit || DEFAULT_UNIT}`;

/** Unit name for display; the default unit has a Bangla translation. */
export const unitLabel = (unit: string | null | undefined, lang: string) =>
    lang === "bn" && (!unit || unit === DEFAULT_UNIT) ? "ক্রেডিট" : unit || DEFAULT_UNIT;

export const packageName = (pkg: DudosPackage, lang: string) =>
    (lang === "bn" && pkg.nameBn) || pkg.name;
export const packageDescription = (pkg: DudosPackage, lang: string) =>
    (lang === "bn" && pkg.descriptionBn) || pkg.description || "";
