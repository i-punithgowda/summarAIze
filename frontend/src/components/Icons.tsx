import React from "react";

type IconProps = { className?: string };

export const LogoMark: React.FC<IconProps> = ({ className = "w-7 h-7" }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
        <rect x="3" y="3" width="26" height="26" rx="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 18.5c0-4 2.2-7 6-7 2.4 0 4 1.1 4.8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="20.5" cy="20.5" r="2.2" fill="currentColor" />
    </svg>
);

export const IconFolder: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4.2l1.6 1.8H19a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V7.5Z" />
    </svg>
);

export const IconGit: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="7" cy="12" r="2.2" />
        <circle cx="17" cy="7" r="2.2" />
        <circle cx="17" cy="17" r="2.2" />
        <path d="M9.1 11.2 14.8 8.2M9.1 12.8l5.7 3" />
    </svg>
);

export const IconUp: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconRefresh: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M20 12a8 8 0 1 1-2.2-5.5" strokeLinecap="round" />
        <path d="M20 5v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconSpark: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M12 3.5 13.6 9l5.9 1.1L15 13.8l1.4 5.7L12 16.6 7.6 19.5 9 13.8 4.5 10.1 10.4 9 12 3.5Z" strokeLinejoin="round" />
    </svg>
);

export const IconAlert: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M12 9.2v4.2M12 16.7h.01" strokeLinecap="round" />
        <path d="M11.1 4.8 3.4 18.2A1.2 1.2 0 0 0 4.4 20h15.2a1.2 1.2 0 0 0 1-1.8L12.9 4.8a1 1 0 0 0-1.8 0Z" />
    </svg>
);

export const IconCheck: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M5 12.5 10 17.5 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconArrowLeft: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M19 12H6M11 6.5 5.5 12 11 17.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconFile: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M7 3.5h6.5L19 9v11.5H7V3.5Z" />
        <path d="M13.5 3.5V9H19" />
    </svg>
);

export const IconBranch: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="6.5" cy="6.5" r="2" />
        <circle cx="6.5" cy="17.5" r="2" />
        <circle cx="17.5" cy="12" r="2" />
        <path d="M6.5 8.5v7M8.4 7.6c3 .4 6.1 1.4 9.1 4.2" />
    </svg>
);

export const IconRules: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M6 5.5h12v13H6z" />
        <path d="M9 9.5h6M9 12.5h6M9 15.5h3.5" strokeLinecap="round" />
    </svg>
);

export const IconUpload: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M12 16V6.5M8 9.5 12 5.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 18.5h14" strokeLinecap="round" />
    </svg>
);

export const Spinner: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
);
