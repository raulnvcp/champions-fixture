"use client";

import Image from "next/image";
import { useState } from "react";

interface UserAvatarProps {
  src: string | null;
  name: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function UserAvatar({ src, name }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <Image
        src={src}
        alt={name}
        width={36}
        height={36}
        className="rounded-full h-9 w-9 object-cover shrink-0 ring-1 ring-border"
        unoptimized
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-border">
      {initials(name)}
    </div>
  );
}
