"use client";

import React from "react";
import { MascotVector } from "@/components/atomic/MascotVector";
import { Button3D } from "@/components/atomic/Button3D";
import { PillBadge } from "@/components/atomic/PillBadge";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center gap-6 animate-smooth-reveal">
      <div className="duo-card p-6 bg-slate-900 border border-slate-800 flex flex-col items-center gap-4 max-w-sm w-full shadow-2xl">
        <MascotVector mood="pumped" size={130} />
        
        <PillBadge variant="red" icon={<Compass className="w-3.5 h-3.5" />}>
          404 — Route Lost
        </PillBadge>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Flexy Couldn't Find That Path!
        </h1>

        <p className="text-xs font-semibold text-slate-300 leading-relaxed">
          Looks like this training route has been delisted or relocated. Let's get you back to the main Home Hub.
        </p>

        <Link href="/" className="w-full">
          <Button3D variant="green" fullWidth>
            <Home className="w-4 h-4" /> Return to Home Hub
          </Button3D>
        </Link>
      </div>
    </div>
  );
}
