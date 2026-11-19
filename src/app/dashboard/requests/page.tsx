import type { Metadata } from "next";
import { getHostWorkspaceDemo } from "@/data/host-workspace";
import { SiteShell } from "../../_shared/site-shell";
import { HostWorkspace } from "./host-workspace";

export const metadata: Metadata = {
  title: "Host workspace demo | SideTrail",
  description: "Try reviewing fictional join requests and managing places for a sample SideTrail trip.",
};

export default function HostWorkspacePage() {
  const { listing, requests } = getHostWorkspaceDemo();
  return (
    <SiteShell isDashboard="detail">
      <HostWorkspace listing={listing} initialRequests={requests} />
    </SiteShell>
  );
}
