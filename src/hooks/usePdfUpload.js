import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'

export function usePdfUpload() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { importPdfFile, isImporting, importError, importWarning, setImportError } =
    useLibrary()
  const [isDragging, setIsDragging] = useState(false)

  const openFilePicker = useCallback(() => {
    setImportError(null)
    inputRef.current?.click()
  }, [setImportError])

  const handleFiles = useCallback(
    async (fileList) => {
      const file = fileList?.[0]
      if (!file) return null

      const book = await importPdfFile(file)
      navigate(`/reader/${book.id}`)
      return book
    },
    [importPdfFile, navigate],
  )

  const onInputChange = useCallback(
    async (event) => {
      try {
        await handleFiles(event.target.files)
      } finally {
        event.target.value = ''
      }
    },
    [handleFiles],
  )

  const onDragEnter = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
      await handleFiles(event.dataTransfer.files)
    },
    [handleFiles],
  )

  return {
    inputRef,
    isDragging,
    isImporting,
    importError,
    importWarning,
    openFilePicker,
    onInputChange,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
