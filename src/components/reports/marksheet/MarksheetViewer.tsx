"use client";

import { useMemo } from "react";
import { usePDF } from "@react-pdf/renderer";
import {
  MarksheetDocument,
  MarksheetData,
} from "@/components/reports/marksheet/MarksheetDocument";
import { PdfRenderViewer } from "@/components/reports/PdfRenderViewer";

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
  const pdfDocument = useMemo(
    () => (
      <MarksheetDocument
        data={data}
        examLabel={examLabel}
        semester={semester}
      />
    ),
    [data, examLabel, semester],
  );

  const [instance] = usePDF({ document: pdfDocument });

  if (instance.loading) {
    return (
      <div className="bg-muted/30 text-muted-foreground rounded-lg border p-6 text-sm">
        Generating preview...
      </div>
    );
  }

  if (!instance.url) {
    return (
      <div className="text-destructive rounded-lg border p-6 text-sm">
        Failed to generate preview.
      </div>
    );
  }

  return (
    <PdfRenderViewer
      pdfUrl={instance.url}
      fileName={`Marksheet-${examLabel}-${data.studentInfo.registrationNumber}.pdf`}
      showTextLayer={false}
      showAnnotationLayer={false}
    />
  );
}
