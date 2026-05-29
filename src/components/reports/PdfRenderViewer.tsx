"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Printer,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const containerRef = useRef<HTMLDivElement | null>(null);

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
        setPageWidth(Math.max(260, width - 24));
        return;
      }

      if (width < 1024) {
        setPageWidth(Math.min(760, width - 48));
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const isDesktop = window.innerWidth >= 1024;
      const wantsZoom = e.ctrlKey || e.metaKey;

      if (!isDesktop || !wantsZoom) return;

      e.preventDefault();

      setScale((prev) => {
        const next = e.deltaY < 0 ? prev + 0.1 : prev - 0.1;
        return Math.min(3, Math.max(0.5, +next.toFixed(1)));
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const safePageNumber = useMemo(() => {
    if (!numPages) return 1;
    return Math.min(Math.max(pageNumber, 1), numPages);
  }, [pageNumber, numPages]);

  const zoomOut = () => {
    setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1)));
  };

  const zoomIn = () => {
    setScale((s) => Math.min(3, +(s + 0.1).toFixed(1)));
  };

  const resetZoom = () => {
    setScale(initialScale);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    const printWindow = window.open(pdfUrl, "_blank");
    if (!printWindow) return;

    if (isMobileDevice()) {
      return;
    }

    let printed = false;

    const printOnce = () => {
      if (printed) return;
      printed = true;

      try {
        printWindow.focus();
        printWindow.print();
      } catch {}
    };

    try {
      printWindow.addEventListener("load", printOnce, { once: true });
    } catch {}

    window.setTimeout(printOnce, 1200);
  };

  return (
    <div className="bg-background text-foreground flex h-[90vh] min-h-0 flex-col overflow-hidden rounded-xl border">
      <div className="bg-card border-b p-2 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={!numPages || safePageNumber <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="text-muted-foreground min-w-[72px] text-center text-sm tabular-nums">
              {numPages ? `${safePageNumber} / ${numPages}` : "0 / 0"}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={!numPages || safePageNumber >= numPages}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={zoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-4" />
            </Button>

            <div className="text-muted-foreground w-14 text-center text-sm tabular-nums">
              {Math.round(scale * 100)}%
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={zoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetZoom}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!pdfUrl}
            >
              <Printer className="size-4" />
              Print
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              disabled={!pdfUrl}
            >
              <Download className="size-4" />
              Download
            </Button>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open toolbar menu"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={zoomOut}>
                  <ZoomOut className="size-4" />
                  Zoom out
                </DropdownMenuItem>
                <DropdownMenuItem onClick={zoomIn}>
                  <ZoomIn className="size-4" />
                  Zoom in
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetZoom}>
                  <RotateCcw className="size-4" />
                  Reset zoom
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint} disabled={!pdfUrl}>
                  <Printer className="size-4" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload} disabled={!pdfUrl}>
                  <Download className="size-4" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-muted/30 flex-1 overflow-auto p-2 sm:p-4"
      >
        <div className="mx-auto w-fit max-w-full rounded-lg border bg-white shadow-sm">
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
