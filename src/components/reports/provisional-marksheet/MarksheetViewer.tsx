"use client";

import { useMemo } from "react";
import { usePDF } from "@react-pdf/renderer";
import {
  ProvisionalMarksheetDocument,
  type ProvisionalData,
} from "@/components/reports/provisional-marksheet/MarksheetDocument";
import { PdfRenderViewer } from "@/components/reports/PdfRenderViewer";

interface MarksheetViewerProps {
  data: ProvisionalData;
}

export function ProvisionalMarksheetViewer({ data }: MarksheetViewerProps) {
  const pdfDocument = useMemo(
    () => <ProvisionalMarksheetDocument data={data} />,
    [data],
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
    <div>
      <PdfRenderViewer
        pdfUrl={instance.url}
        fileName={`Provisional-Marksheet-${data.studentInfo.registrationNumber}.pdf`}
        showTextLayer={true}
        showAnnotationLayer={false}
      />
      <div className="mt-4 w-full">
        <p className="text-muted-foreground text-center text-xs">
          *This marksheet is generated for reference purposes only and is not an
          official document.
        </p>
      </div>
    </div>
  );
}
