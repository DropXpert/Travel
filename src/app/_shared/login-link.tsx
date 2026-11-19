"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authHref } from "@/navigation/auth";

export function LoginLink({ className }: { className: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const href = authHref("login", pathname ?? "/");

  return (
    <Link href={href} className={className} onNavigate={(event) => {
      const { pathname, search, hash } = window.location;
      const destination = authHref("login", pathname + search + hash);
      if (destination !== href) {
        event.preventDefault();
        router.push(destination);
      }
    }}>
      Login
    </Link>
  );
}
