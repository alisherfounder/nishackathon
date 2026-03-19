"use client";

import dynamic from "next/dynamic";

const CitizensMapClient = dynamic(() => import("./CitizensMapClient"), { ssr: false });

export default function CitizensMapPage() {
  return <CitizensMapClient />;
}
