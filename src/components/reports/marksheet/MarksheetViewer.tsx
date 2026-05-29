"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  MarksheetDocument,
  MarksheetData,
} from "@/components/reports/marksheet/MarksheetDocument";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

interface MarksheetViewerProps {
  data: MarksheetData;
  examLabel?: string;
  semester?: string;
}

export function MarksheetViewer({
  data,
  examLabel,
  semester,
}: MarksheetViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const previousUrlRef = useRef<string | null>(null);

  const docElement = useMemo(
    () => (
      <MarksheetDocument
        data={data}
        examLabel={examLabel}
        semester={semester}
      />
    ),
    [data, examLabel, semester],
  );

  useEffect(() => {
    let active = true;
    setLoadingPdf(true);
    setNumPages(0);
    setPageNumber(1);

    pdf(docElement)
      .toBlob()
      .then((blob) => {
        if (!active) return;
        const nextUrl = URL.createObjectURL(blob);
        if (previousUrlRef.current) {
          URL.revokeObjectURL(previousUrlRef.current);
        }
        previousUrlRef.current = nextUrl;
        setFileUrl(nextUrl);
        setLoadingPdf(false);
      })
      .catch(() => {
        if (!active) return;
        setFileUrl(null);
        setLoadingPdf(false);
      });

    return () => {
      active = false;
    };
  }, [docElement]);

  useEffect(() => {
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `marksheet-${data.studentInfo.registrationNumber}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    if (!fileUrl) return;
    const win = window.open(fileUrl, "_blank");
    if (!win) return;
    win.addEventListener("load", () => {
      win.print();
    });
  };

  return (
    <div className="bg-background text-foreground flex h-[90vh] flex-col overflow-hidden rounded-lg border">
      <div className="bg-card border-b">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!numPages || pageNumber <= 1}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm disabled:opacity-50"
          >
            Prev
          </button>

          <div className="min-w-24 text-sm tabular-nums">
            {numPages ? `${pageNumber} / ${numPages}` : "0 / 0"}
          </div>

          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={!numPages || pageNumber >= numPages}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm disabled:opacity-50"
          >
            Next
          </button>

          <div className="ml-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.max(0.6, +(s - 0.1).toFixed(1)))
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
                setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(1)))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => setScale(1.2)}
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm"
            >
              Reset
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={!fileUrl}
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm disabled:opacity-50"
            >
              Print
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!fileUrl}
              className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-md px-3 text-sm disabled:opacity-50"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 flex-1 overflow-auto p-4">
        {loadingPdf ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Generating preview...
          </div>
        ) : fileUrl ? (
          <div className="mx-auto w-fit rounded-lg border bg-white shadow-sm">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPageNumber(1);
              }}
              options={options}
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
                scale={scale}
                renderAnnotationLayer
                renderTextLayer
              />
            </Document>
          </div>
        ) : (
          <div className="text-destructive flex h-full items-center justify-center text-sm">
            Failed to generate preview.
          </div>
        )}
      </div>
    </div>
  );
}
