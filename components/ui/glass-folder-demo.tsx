"use client"

import React from "react"
import { GlassFolder } from "@/components/ui/glass-folder-cards"

/**
 * Three folders on a dotted desk: milk glass over a long-exposure print with a
 * key that adds files, a plain archive with a menu, and smoked glass over red
 * ink. Hover one to lean its glass toward you, click it to open it.
 */
export function GlassFolderCardsDemo() {
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-[#070A12] px-6 py-12 rounded-2xl border border-slate-200/80 dark:border-slate-800"
      style={{ minHeight: "520px" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-slate-900 dark:text-slate-100 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        <GlassFolder
          label="Sprint 14 Assets"
          art="aurora"
          seed={3}
          appearDelay={0}
          files={[
            { name: "Velocity Burndown", meta: "PNG · 4.8 MB", art: "ember" },
            { name: "Capacity Model.xlsx", meta: "Google Sheet · Live", art: "glacier" },
            { name: "Architecture Specs", meta: "PDF · 1.8 MB", art: "dusk" },
          ]}
        />
        <GlassFolder
          label="Project Archives"
          art="none"
          action="more"
          labelPlacement="top-left"
          appearDelay={140}
          files={[
            { name: "ADR-004 Schema.md", meta: "Markdown · 14 KB", art: "dusk" },
            { name: "Database ERD", meta: "SVG · 420 KB", art: "verdant" },
            { name: "SOC2 Compliance", meta: "PDF · 2.1 MB", art: "ember" },
            { name: "QA Defect Matrix", meta: "Google Sheet · Live" },
          ]}
          menu={[{ label: "Open folder" }, { label: "Share Link" }, { label: "Export Archive" }]}
        />
        <GlassFolder
          label="Live Governance"
          meta="Sprint 14"
          tone="dark"
          art="ember"
          seed={11}
          action="none"
          labelPlacement="top-right"
          appearDelay={280}
          files={[
            { name: "Infrastructure Cost", meta: "Cloudflare D1 · Projections", art: "verdant" },
            { name: "Release Notes v1.4", meta: "TXT · 8 KB" },
            { name: "Sprint Burndown", meta: "Live Chart · 60 FPS", art: "aurora" },
          ]}
        />
      </div>
      <p className="relative mt-10 font-mono text-[11px] tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase">
        Hover to lean · Click to open · + to drop new assets
      </p>
    </div>
  )
}

export default GlassFolderCardsDemo
