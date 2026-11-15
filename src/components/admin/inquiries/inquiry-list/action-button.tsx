"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const TONES = {
  gray: "border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5",
  brand:
    "border-brand-100 bg-brand-50 text-brand-500 hover:bg-brand-100 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20",
  orange:
    "border-orange-100 bg-orange-50 text-orange-500 hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20",
  sky: "border-sky-100 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20",
  red: "border-red-100 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20",
} as const;

interface ActionButtonProps {
  label: string;
  tone: keyof typeof TONES;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

// Small tinted square icon button for table row actions.
export default function ActionButton({
  label,
  tone,
  onClick,
  href,
  disabled,
  loading,
  children,
}: ActionButtonProps) {
  const className = cn("size-8 rounded-lg border [&_svg]:size-4", TONES[tone]);
  if (href) {
    return (
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={label}
        title={label}
        className={className}
        nativeButton={false}
        render={<a href={href} />}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      className={className}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      {children}
    </Button>
  );
}
