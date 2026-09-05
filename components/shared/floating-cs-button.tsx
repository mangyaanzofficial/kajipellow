"use client";

import { MessageCircle } from "lucide-react";

export function FloatingCsButton() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6283160763111";
  return (
    <a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-3 text-white shadow-2xl shadow-primary/30 transition-transform hover:scale-105"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline text-sm font-medium">Hubungi CS</span>
    </a>
  );
}
