import { FileUp, Upload } from 'lucide-react'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'

export function DropZone({
  isDragging,
  isImporting,
  openFilePicker,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  inputRef,
  onInputChange,
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative overflow-hidden rounded-[1.75rem] border border-dashed transition duration-300 ${
        isDragging
          ? 'border-gilt bg-gilt/10 shadow-[0_0_0_1px_rgba(201,166,107,0.25)]'
          : 'border-white/12 bg-ink-850/70 hover:border-gilt/35'
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(500px 220px at 50% 0%, rgba(201,166,107,0.14), transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-14">
        <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-white/8 bg-ink-900 text-gilt">
          {isImporting ? <Spinner label="Importing PDF" /> : <Upload className="size-6" />}
        </div>

        <h2 className="font-display text-3xl text-ink-100 sm:text-4xl">
          {isDragging ? 'Drop to open' : 'Open a PDF as a book'}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-300 sm:text-base">
          Drag a file here or choose one from your device. PDFs stay on this browser — nothing is
          uploaded to a server.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={openFilePicker} disabled={isImporting}>
            <FileUp className="size-4" />
            {isImporting ? 'Preparing book…' : 'Upload PDF'}
          </Button>
          <span className="text-xs tracking-wide text-ink-500 uppercase">or drop a .pdf file</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={onInputChange}
      />
    </div>
  )
}
