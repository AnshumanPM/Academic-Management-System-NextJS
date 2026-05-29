"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Printer,
  RotateCcw,
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

interface PdfRenderViewerProps {
  pdfUrl: string;
  fileName?: string;
  showTextLayer?: boolean;
  showAnnotationLayer?: boolean;
}

type PdfStageProps = {
  pdfUrl: string;
  pageNumber: number;
  fitWidth?: number;
  viewMode: "fit" | "actual";
  showTextLayer: boolean;
  showAnnotationLayer: boolean;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
};

const PdfStage = memo(function PdfStage({
  pdfUrl,
  pageNumber,
  fitWidth,
  viewMode,
  showTextLayer,
  showAnnotationLayer,
  onLoadSuccess,
}: PdfStageProps) {
  const options = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    [],
  );

  return (
    <Document
      file={pdfUrl}
      options={options}
      onLoadSuccess={onLoadSuccess}
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
        pageNumber={pageNumber}
        width={viewMode === "fit" ? fitWidth : undefined}
        scale={1}
        renderTextLayer={showTextLayer}
        renderAnnotationLayer={showAnnotationLayer}
      />
    </Document>
  );
});

export function PdfRenderViewer({
  pdfUrl,
  fileName = "document.pdf",
  showTextLayer = false,
  showAnnotationLayer = false,
}: PdfRenderViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [fitWidth, setFitWidth] = useState<number>();
  const [viewMode, setViewMode] = useState<"fit" | "actual">("fit");

  useEffect(() => {
    setNumPages(0);
    setPageNumber(1);
    setViewMode("fit");
  }, [pdfUrl]);

  useEffect(() => {
    const updateFitWidth = () => {
      const el = viewportRef.current;
      if (!el) return;

      const styles = window.getComputedStyle(el);
      const paddingX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const nextWidth = Math.max(260, Math.floor(el.clientWidth - paddingX));

      setFitWidth((prev) => {
        if (prev == null) return nextWidth;
        if (Math.abs(prev - nextWidth) < 8) return prev;
        return nextWidth;
      });
    };

    updateFitWidth();

    const observer = new ResizeObserver(() => {
      updateFitWidth();
    });

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    window.addEventListener("resize", updateFitWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateFitWidth);
    };
  }, []);

  const safePageNumber = useMemo(() => {
    if (!numPages) return 1;
    return Math.min(Math.max(pageNumber, 1), numPages);
  }, [pageNumber, numPages]);

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages((prev) => (prev === numPages ? prev : numPages));
      setPageNumber((prev) => (prev === 1 ? prev : 1));
    },
    [],
  );

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  }, [pdfUrl, fileName]);

  const handlePrint = useCallback(() => {
    if (!pdfUrl) return;

    const printWindow = window.open(pdfUrl, "_blank");
    if (!printWindow) return;

    printWindow.focus();
    printWindow.print();
  }, [pdfUrl]);

  const toggleViewMode = useCallback(() => {
    setViewMode((mode) => (mode === "fit" ? "actual" : "fit"));
  }, []);

  return (
    <div className="bg-background text-foreground flex h-[90vh] min-h-0 min-w-0 flex-col overflow-hidden border">
      <div className="bg-card shrink-0 border-b p-2 sm:p-3">
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
              size="sm"
              className="w-[88px] justify-center"
              onClick={toggleViewMode}
            >
              <RotateCcw className="size-4" />
              {viewMode === "fit" ? "100%" : "Fit"}
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
            <DropdownMenu modal={false}>
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
                <DropdownMenuItem onClick={toggleViewMode}>
                  <RotateCcw className="size-4" />
                  {viewMode === "fit" ? "100%" : "Fit"}
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

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          ref={viewportRef}
          className="bg-muted/30 min-h-0 min-w-0 flex-1 overflow-auto p-2 sm:p-4"
        >
          <div className="mx-auto w-fit max-w-full">
            <PdfStage
              pdfUrl={pdfUrl}
              pageNumber={safePageNumber}
              fitWidth={fitWidth}
              viewMode={viewMode}
              showTextLayer={showTextLayer}
              showAnnotationLayer={showAnnotationLayer}
              onLoadSuccess={handleDocumentLoadSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
