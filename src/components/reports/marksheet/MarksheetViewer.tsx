"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  MarksheetDocument,
  MarksheetData,
} from "@/components/reports/marksheet/MarksheetDocument";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false },
);

interface MarksheetViewerProps {
  data: MarksheetData;
  examLabel?: string;
  semester?: string;
}

const BASE_WIDTH = 794;
const BASE_HEIGHT = 1123;

export function MarksheetViewer({
  data,
  examLabel,
  semester,
}: MarksheetViewerProps) {
  const [zoom, setZoom] = useState(1);

  const viewerSize = useMemo(
    () => ({
      width: Math.round(BASE_WIDTH * zoom),
      height: Math.round(BASE_HEIGHT * zoom),
    }),
    [zoom],
  );

  const handleExportPDF = async () => {
    const blob = await pdf(
      <MarksheetDocument
        data={data}
        examLabel={examLabel}
        semester={semester}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marksheet-${data.studentInfo.registrationNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    const blob = await pdf(
      <MarksheetDocument
        data={data}
        examLabel={examLabel}
        semester={semester}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const win = window.open(url);

    if (!win) return;

    win.addEventListener("load", () => {
      win.print();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="bg-background text-foreground flex h-screen flex-col">
      {/* <div className="border-b bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-sm font-semibold tracking-tight">
            Marksheet Viewer
          </span>

          <button
            onClick={handlePrint}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Print
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Export PDF
          </button>

          <div className="ml-auto flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1">
            <span className="px-1 text-xs font-medium text-muted-foreground">
              Zoom
            </span>

            <button
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              -
            </button>

            <span className="w-14 text-center text-xs font-medium tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(1)))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              +
            </button>

            <button
              onClick={() => setZoom(1)}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      </div> */}

      <div className="bg-muted/30 flex flex-1 justify-center overflow-auto p-6">
        <div
          className="border-border bg-background overflow-hidden rounded-lg border shadow-sm"
          style={{
            // width: viewerSize.width,
            // height: viewerSize.height,
            // minWidth: viewerSize.width,
            width: "100%",
            height: "100%",
          }}
        >
          <PDFViewer
            width={"100%"}
            height={"100%"}
            // showToolbar={false}
          >
            <MarksheetDocument
              data={data}
              examLabel={examLabel}
              semester={semester}
            />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
