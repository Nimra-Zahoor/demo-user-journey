"use client";

import { trackAction } from "user-journey-analytics";

interface TrackButtonProps {
  action: string;
  metadata?: Record<string, unknown>;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function TrackButton({ 
  action, 
  metadata, 
  className = "", 
  children,
  onClick 
}: TrackButtonProps) {
  const handleClick = () => {
    trackAction(action, metadata);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

