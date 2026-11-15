"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";

interface AppSidebarHeaderProps {
  showContent: boolean;
  /** Student portal: red banner with the portal name and greeting. */
  portal?: { title: string; subtitle?: string; href: string };
}

export default function AppSidebarHeader({
  showContent,
  portal,
}: AppSidebarHeaderProps) {
  return (
    <SidebarHeader className="px-5 py-8">
      <Link
        href={portal?.href ?? "/"}
        className={cn(
          "flex items-center",
          !showContent ? "justify-center" : "justify-start",
        )}
      >
        {showContent ? (
          <>
            {/* Black text for light theme, white text (logo-lite) for dark theme. */}
            <Image
              src="/images/logo/logo-dark.svg"
              alt="God of Graphics"
              width={198}
              height={60}
              priority
              className="h-15 w-auto dark:hidden"
            />
            <Image
              src="/images/logo/logo-lite.svg"
              alt="God of Graphics"
              width={198}
              height={60}
              priority
              className="hidden h-15 w-auto dark:block"
            />
          </>
        ) : (
          <Image
            src="/images/logo/fav.png"
            alt="God of Graphics"
            width={32}
            height={32}
            priority
            className="size-8"
          />
        )}
      </Link>
      {portal && showContent && (
        <div className="student-banner mt-5 rounded-xl px-4 py-3">
          <p className="text-base font-semibold">{portal.title}</p>
          {portal.subtitle && (
            <p className="mt-0.5 truncate text-xs text-white/85">
              {portal.subtitle}
            </p>
          )}
        </div>
      )}
    </SidebarHeader>
  );
}
