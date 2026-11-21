import type { Metadata } from "next";
import { SiteShell } from "../../_shared/site-shell";
import { HostWorkspace } from "./host-workspace";

export const metadata: Metadata = {
  title: "Host workspace demo",
  description: "Try reviewing fictional join requests and managing places for a sample Share Yarana trip.",
};

export default async function HostWorkspacePage({ searchParams }: { searchParams: Promise<{ trip?: string | string[] }> }) {
  const { trip } = await searchParams;
  return (
    <SiteShell isDashboard="detail">
      <HostWorkspace tripId={typeof trip === "string" ? trip : "trip-sinhagad"} />
    </SiteShell>
  );
}
