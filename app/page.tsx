import { getPublicContent } from "@/lib/dudos/cms-server";
import { HomePublicLayout } from "@/components/home/HomePublicLayout";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getPublicContent();
  return <HomePublicLayout content={content} lang="en" />;
}
