import React from "react";
import * as Icons from "@heroicons/react/24/outline";

export default function DynamicHeroIcon({ name, className = "w-5 h-5" }) {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} aria-hidden="true" />;
}
