"use client";

import { useState } from "react";

interface DriverAvatarProps {
  code?: string;
  firstName: string;
  lastName: string;
  headshot: string | null;
  teamColor?: string;
  size?: number;
}

export default function DriverAvatar({
  firstName,
  lastName,
  headshot,
  teamColor = "#888",
  size = 40,
}: DriverAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = `${firstName[0]}${lastName[0]}`;

  const showFallback = !headshot || imgError;

  if (showFallback) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 border-2"
        style={{
          width: size,
          height: size,
          backgroundColor: teamColor + "33",
          borderColor: teamColor,
          color: teamColor,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="rounded-full overflow-hidden shrink-0 border-2"
      style={{ width: size, height: size, borderColor: teamColor }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={headshot}
        alt={`${firstName} ${lastName}`}
        width={size}
        height={size}
        className="object-cover object-top w-full h-full"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
