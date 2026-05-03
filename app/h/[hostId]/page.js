"use client";
import { use } from "react";
import LoftAI from "@/app/LoftAI";

export default function HostChatPage({ params }) {
  const { hostId } = use(params);
  return <LoftAI hostId={hostId} />;
}
