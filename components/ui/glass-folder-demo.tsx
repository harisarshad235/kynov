"use client"

import React, { useState, useRef } from "react"
import { GlassFolder, FolderFile } from "@/components/ui/glass-folder-cards"
import { FileText, Download, ExternalLink, X, Check, Upload, Sparkles, AlertCircle } from "lucide-react"

const NEW_ASSETS_POOL: FolderFile[] = [
  { name: "Sprint 14 Retro Summary.pdf", meta: "PDF · 1.4 MB", art: "dusk" },
  { name: "Burndown Model v2.xlsx", meta: "Google Sheet · Live", art: "glacier" },
  { name: "WebSocket Architecture.svg", meta: "Vector · 380 KB", art: "verdant" },
  { name: "Security Audit Checklist.md", meta: "Markdown · 22 KB", art: "ember" },
  { name: "Release Candidate v1.4.tar", meta: "Binary · 14.2 MB", art: "aurora" },
]

/**
 * Three folders on a dotted desk: milk glass over a long-exposure print with a
 * key that adds files, a plain archive with a menu, and smoked glass over red
 * ink. Hover one to lean its glass toward you, click it to open it.
 */
export function GlassFolderCardsDemo() {
  const [folder1Files, setFolder1Files] = useState<FolderFile[]>([
    { name: "Velocity Burndown", meta: "PNG · 4.8 MB", art: "ember" },
    { name: "Capacity Model.xlsx", meta: "Google Sheet · Live", art: "glacier" },
    { name: "Architecture Specs", meta: "PDF · 1.8 MB", art: "dusk" },
  ])

  const [folder2Files, setFolder2Files] = useState<FolderFile[]>([
    { name: "ADR-004 Schema.md", meta: "Markdown · 14 KB", art: "dusk" },
    { name: "Database ERD", meta: "SVG · 420 KB", art: "verdant" },
    { name: "SOC2 Compliance", meta: "PDF · 2.1 MB", art: "ember" },
    { name: "QA Defect Matrix", meta: "Google Sheet · Live" },
  ])

  const [folder3Files, setFolder3Files] = useState<FolderFile[]>([
    { name: "Infrastructure Cost", meta: "Cloudflare D1 · Projections", art: "verdant" },
    { name: "Release Notes v1.4", meta: "TXT · 8 KB" },
    { name: "Sprint Burndown", meta: "Live Chart · 60 FPS", art: "aurora" },
  ])

  // Selected file preview
  const [selectedFile, setSelectedFile] = useState<{ file: FolderFile; folderName: string } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const targetFolderIndexRef = useRef<number>(0)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 3500)
  }

  const handleAddPreset = (folderIdx: number): FolderFile => {
    const list = folderIdx === 0 ? folder1Files : folderIdx === 1 ? folder2Files : folder3Files
    const available = NEW_ASSETS_POOL[(list.length) % NEW_ASSETS_POOL.length]
    const newFile: FolderFile = {
      name: `${available.name.replace(/(\.[a-z0-9]+)$/i, '')} (${list.length + 1})${available.name.match(/(\.[a-z0-9]+)$/i)?.[0] || ''}`,
      meta: available.meta || 'Just now',
      art: available.art || 'aurora',
    }

    const folderNames = ['Sprint 14 Assets', 'Project Archives', 'Live Governance']
    showToast(`Added "${newFile.name}" to ${folderNames[folderIdx]}`)
    return newFile
  }

  const handleDeviceUploadClick = (folderIdx: number) => {
    targetFolderIndexRef.current = folderIdx
    fileInputRef.current?.click()
  }

  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / 1048576).toFixed(1)} MB`
    }

    const newFile: FolderFile = {
      name: file.name,
      meta: `${file.type.split('/')[1]?.toUpperCase() || 'FILE'} · ${formatSize(file.size)}`,
      art: 'aurora',
    }

    const targetIdx = targetFolderIndexRef.current
    if (targetIdx === 0) setFolder1Files((prev) => [...prev, newFile])
    else if (targetIdx === 1) setFolder2Files((prev) => [...prev, newFile])
    else setFolder3Files((prev) => [...prev, newFile])

    const folderNames = ['Sprint 14 Assets', 'Project Archives', 'Live Governance']
    showToast(`Uploaded "${file.name}" to ${folderNames[targetIdx]}`)
    e.target.value = ''
  }

  return (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-[#070A12] px-6 py-12 rounded-2xl border border-slate-200/80 dark:border-slate-800"
      style={{ minHeight: "540px" }}
    >
      {/* Hidden file uploader for native file upload support */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleNativeFileChange}
      />

      {/* Real-time Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-4 z-50 flex items-center gap-2 bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200 border border-white/10 dark:border-slate-900/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-950 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-slate-900 dark:text-slate-100 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {/* FOLDER 1 */}
        <div className="flex flex-col items-center">
          <GlassFolder
            label="Sprint 14 Assets"
            art="aurora"
            seed={3}
            action="add"
            appearDelay={0}
            files={folder1Files}
            onAdd={() => handleAddPreset(0)}
            onFilesChange={setFolder1Files}
            onFileSelect={(file) => setSelectedFile({ file, folderName: "Sprint 14 Assets" })}
          />
        </div>

        {/* FOLDER 2 */}
        <div className="flex flex-col items-center">
          <GlassFolder
            label="Project Archives"
            art="none"
            action="more"
            labelPlacement="top-left"
            appearDelay={140}
            files={folder2Files}
            onFilesChange={setFolder2Files}
            onFileSelect={(file) => setSelectedFile({ file, folderName: "Project Archives" })}
            menu={[
              {
                label: "Add Next Deliverable",
                onSelect: () => {
                  const added = handleAddPreset(1)
                  setFolder2Files((prev) => [...prev, added])
                },
              },
              {
                label: "Upload from Computer...",
                onSelect: () => handleDeviceUploadClick(1),
              },
              {
                label: "Export Archive (.zip)",
                onSelect: () => showToast("Exporting Project Archives archive bundle..."),
              },
            ]}
          />
        </div>

        {/* FOLDER 3 */}
        <div className="flex flex-col items-center">
          <GlassFolder
            label="Live Governance"
            meta="Sprint 14"
            tone="dark"
            art="ember"
            seed={11}
            action="add"
            labelPlacement="top-right"
            appearDelay={280}
            files={folder3Files}
            onAdd={() => handleAddPreset(2)}
            onFilesChange={setFolder3Files}
            onFileSelect={(file) => setSelectedFile({ file, folderName: "Live Governance" })}
          />
        </div>
      </div>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
        <p className="font-mono text-[11px] tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase">
          Click folder to open · Click + to drop new assets · Click any fanned sheet to inspect
        </p>
      </div>

      {/* Selected File Inspection Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedFile(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedFile.file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedFile.folderName} · {selectedFile.file.meta || "Asset file"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#141B2D] border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-medium">Container:</span>
                <span className="font-semibold">{selectedFile.folderName}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-medium">Type & Details:</span>
                <span className="font-mono">{selectedFile.file.meta || "Ready for sync"}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-medium">Storage Engine:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Edge D1 / R2 Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  showToast(`Downloading "${selectedFile.file.name}"...`)
                  setSelectedFile(null)
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlassFolderCardsDemo
