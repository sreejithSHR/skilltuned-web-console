"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/Icon";

export default function ViewAsBanner() {
  const { viewingAs, exitViewAs } = useAuth();
  const router = useRouter();

  if (!viewingAs) return null;

  return (
    <div className="bg-cc-purple text-white text-sm px-4 py-2.5 flex items-center justify-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-2">
        <Icon name="institution" size={16} />
        Viewing as <strong>{viewingAs}</strong> — acting as this institution&apos;s admin
      </span>
      <button
        onClick={() => {
          exitViewAs();
          router.replace("/institutions");
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 font-medium transition-colors"
      >
        <Icon name="logout" size={14} /> Exit view-as
      </button>
    </div>
  );
}
