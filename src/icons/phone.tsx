import { IconProps } from ".";

export function PhoneIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 16.42v3.04a1.5 1.5 0 01-1.64 1.5A17.9 17.9 0 013.04 4.64 1.5 1.5 0 014.53 3h3.05a1.5 1.5 0 011.47 1.2l.55 2.73a1.5 1.5 0 01-.43 1.38l-1.4 1.4a14 14 0 006.52 6.52l1.4-1.4a1.5 1.5 0 011.38-.43l2.73.55A1.5 1.5 0 0121 16.42z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
