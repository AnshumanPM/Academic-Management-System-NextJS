"use client";

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

interface PdfRenderViewerProps {
  pdfUrl: string;
  fileName?: string;
  initialScale?: number;
  showTextLayer?: boolean;
  showAnnotationLayer?: boolean;
}

export function PdfRenderViewer({
  pdfUrl,
  fileName = "document.pdf",
  initialScale = 1,
  showTextLayer = false,
  showAnnotationLayer = false,
}: PdfRenderViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(initialScale);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    setNumPages(0);
    setPageNumber(1);
    setScale(initialScale);
  }, [pdfUrl, initialScale]);

  useEffect(() => {
    const updatePageWidth = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setPageWidth(Math.max(280, width - 48));
        return;
      }

      if (width < 1024) {
        setPageWidth(Math.min(760, width - 80));
        return;
      }

      setPageWidth(820);
    };

    updatePageWidth();
    window.addEventListener("resize", updatePageWidth);

    return () => {
      window.removeEventListener("resize", updatePageWidth);
    };
  }, []);

  const safePageNumber = useMemo(() => {
    if (!numPages) return 1;
    return Math.min(Math.max(pageNumber, 1), numPages);
  }, [pageNumber, numPages]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, "_blank");
    if (!printWindow) return;

    printWindow.focus();

    window.setTimeout(() => {
      try {
        printWindow.print();
      } catch {}
    }, 800);
  };

  return (
    <div className="bg-background text-foreground flex h-[90vh] flex-col overflow-hidden rounded-lg border">
      <div className="bg-card border-b">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!numPages || safePageNumber <= 1}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm disabled:opacity-50"
          >
            Prev
          </button>

          <div className="min-w-24 text-sm tabular-nums">
            {numPages ? `${safePageNumber} / ${numPages}` : "0 / 0"}
          </div>

          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={!numPages || safePageNumber >= numPages}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm disabled:opacity-50"
          >
            Next
          </button>

          <div className="ml-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1)))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm"
            >
              -
            </button>

            <div className="w-16 text-center text-sm tabular-nums">
              {Math.round(scale * 100)}%
            </div>

            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.min(3, +(s + 0.1).toFixed(1)))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => setScale(initialScale)}
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm"
            >
              Reset
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={!pdfUrl}
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm disabled:opacity-50"
            >
              Print
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!pdfUrl}
              className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-md px-3 text-sm disabled:opacity-50"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 flex-1 overflow-auto p-4">
        <div className="mx-auto w-fit rounded-lg border bg-white shadow-sm">
          <Document
            file={pdfUrl}
            options={options}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPageNumber(1);
            }}
            loading={
              <div className="text-muted-foreground p-6 text-center text-sm">
                Loading PDF...
              </div>
            }
            error={
              <div className="text-destructive p-6 text-center text-sm">
                Failed to load PDF.
              </div>
            }
          >
            <Page
              pageNumber={safePageNumber}
              width={pageWidth}
              scale={scale}
              renderTextLayer={showTextLayer}
              renderAnnotationLayer={showAnnotationLayer}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
