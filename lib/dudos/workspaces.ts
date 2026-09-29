import { getAuthToken } from "@/lib/dudos/assessment-sync";

export interface WorkspaceSummary {
    id: string;
    name: string;
    [key: string]: unknown;
}

/**
 * Return the signed-in user's authoritative workspace list.
 * `null` means the backend was unavailable; an empty array is an authoritative
 * response and should not be replaced with stale local workspace data.
 */
export async function fetchAuthenticatedWorkspaces(): Promise<
    WorkspaceSummary[] | null
> {
    const token = getAuthToken();
    if (!token) return null;

    const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

    try {
        const response = await fetch(`${apiBase}/workspaces`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return null;

        const workspaces: unknown = await response.json();
        return Array.isArray(workspaces)
            ? (workspaces as WorkspaceSummary[])
            : null;
    } catch {
        return null;
    }
}
