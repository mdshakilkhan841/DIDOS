import { Metadata } from "next";
import { LoginClient } from "../login/LoginClient";

export const metadata: Metadata = {
  title: "Create Account — DUDOS Operations & Workspace",
  description: "Join the Daffodil Unified Digital Operating System ecosystem.",
};

export default function RegisterPage() {
  return <LoginClient initialMode="signup" returnTo="/app" />;
}
