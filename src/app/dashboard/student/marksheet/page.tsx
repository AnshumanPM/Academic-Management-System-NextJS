"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useLimitStore } from "@/store/useLimitStore";
import { LimitWarning } from "@/components/limit-warning";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const MarksheetViewer = dynamic(
  () =>
    import("@/components/reports/marksheet/MarksheetViewer").then(
      (m) => m.MarksheetViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 text-muted-foreground mt-6 rounded-lg border p-6 text-sm">
        Loading viewer...
      </div>
    ),
  },
);

interface StudentInfo {
  registrationNumber: string;
  studentName: string;
  dob: string;
  gender: string;
  courseName: string;
  instituteName: string;
  photo: string;
}

interface MarksEntry {
  paperTypeCode: string;
  subjectName: string;
  totalFullMark: string;
  totalPassMark: string;
  semYearFullMark: string;
  internalFullMark: string;
  securedTH: string;
  securedIA: string;
  securedTotal: string;
  sortingOrder: number;
}

interface ResultData {
  studentInfo: StudentInfo;
  marksData: MarksEntry[];
  examTypeCode: string;
  result: string;
}

interface ViewerPayload {
  data: ResultData;
  examLabel?: string;
  semester?: string;
}

const semLabel: Record<string, string> = {
  "01": "1st Semester",
  "02": "2nd Semester",
  "03": "3rd Semester",
  "04": "4th Semester",
  "05": "5th Semester",
  "06": "6th Semester",
};

export default function MarksheetPage() {
  const currentYear = new Date().getFullYear();
  const [regd, setRegd] = useState("");
  const [sem, setSem] = useState("");
  const [examCode, setExamCode] = useState("");
  const [viewerPayload, setViewerPayload] = useState<ViewerPayload | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const canOperate = useLimitStore((s) => s.canOperate);
  const doOperation = useLimitStore((s) => s.doOperation);

  const examOptions = useMemo(() => {
    const options: Record<string, string> = {};
    for (let year = currentYear; year >= 2020; year--) {
      options[`${year}05`] = `${year} Summer`;
      options[`${year}12`] = `${year} Winter`;
    }
    return options;
  }, [currentYear]);

  const derivedExamCode = useMemo(() => {
    if (regd.length < 3 || !sem) return "";

    const type = regd[0];
    const batchYY = regd.substring(1, 3);

    if (type !== "F" && type !== "L") return "";

    const batchNum = Number.parseInt(batchYY, 10);
    if (Number.isNaN(batchNum)) return "";

    const academicBatch = type === "F" ? batchNum : batchNum - 1;
    const baseYear = 2000 + academicBatch;

    const semesterNum = Number.parseInt(sem, 10);
    if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 6) {
      return "";
    }

    if (semesterNum % 2 === 1) {
      return `${baseYear + (semesterNum - 1) / 2}12`;
    }

    return `${baseYear + semesterNum / 2}05`;
  }, [regd, sem]);

  const selectedExamCode = examCode || derivedExamCode;

  const fetchResult = async () => {
    if (!regd.trim() || !sem || !selectedExamCode) return;

    if (!canOperate()) {
      setShowLimitWarning(true);
      return;
    }

    setLoading(true);
    setError(null);
    setViewerPayload(null);

    try {
      const response = await axios.post(
        "/api/origin/result",
        { regd, sem, examCode: selectedExamCode },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      const data = response.data;

      if (data.status === 200) {
        doOperation();
        const examLabel =
          `${examOptions[selectedExamCode] ?? selectedExamCode} ${semLabel[sem] ?? ""}`.trim();

        setViewerPayload({
          data: data.data,
          examLabel,
          semester: semLabel[sem],
        });
      } else {
        setError(data.detail?.[0]?.msg || "Failed to fetch result");
      }
    } catch {
      setError("Failed to fetch result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col px-2 py-4">
      {showLimitWarning && (
        <LimitWarning onDismiss={() => setShowLimitWarning(false)} />
      )}
      <h1 className="mb-6 text-center text-2xl font-bold">Student Marksheet</h1>

      <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-center">
        <div className="w-full md:max-w-xs">
          <Input
            type="text"
            placeholder="Registration Number"
            value={regd}
            onChange={(e) => {
              setRegd(e.target.value.toUpperCase());
              setExamCode("");
            }}
            onKeyDown={(e) => e.key === "Enter" && fetchResult()}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <Select
            value={sem}
            onValueChange={(value) => {
              setSem(value);
              setExamCode("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="01">1st Semester</SelectItem>
              <SelectItem value="02">2nd Semester</SelectItem>
              <SelectItem value="03">3rd Semester</SelectItem>
              <SelectItem value="04">4th Semester</SelectItem>
              <SelectItem value="05">5th Semester</SelectItem>
              <SelectItem value="06">6th Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:max-w-xs">
          <Select value={selectedExamCode} onValueChange={setExamCode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Exam Code" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(examOptions)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:max-w-xs">
          <Button
            className="w-full"
            onClick={fetchResult}
            disabled={loading || !regd.trim() || !sem || !selectedExamCode}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "View Marksheet"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {viewerPayload && (
        <div className="mt-6">
          <MarksheetViewer
            data={viewerPayload.data}
            examLabel={viewerPayload.examLabel}
            semester={viewerPayload.semester}
          />
        </div>
      )}
    </div>
  );
}
