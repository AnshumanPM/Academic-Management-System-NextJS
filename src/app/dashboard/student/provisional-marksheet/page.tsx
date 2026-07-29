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
import type { ProvisionalData } from "@/components/reports/provisional-marksheet/MarksheetDocument";

const ProvisionalMarksheetViewer = dynamic(
  () =>
    import("@/components/reports/provisional-marksheet/MarksheetViewer").then(
      (m) => m.ProvisionalMarksheetViewer,
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

const SEMESTERS = ["01", "02", "03", "04", "05", "06"] as const;
const semLabel: Record<string, string> = {
  "01": "1st Semester",
  "02": "2nd Semester",
  "03": "3rd Semester",
  "04": "4th Semester",
  "05": "5th Semester",
  "06": "6th Semester",
};

function deriveExamCode(regd: string, sem: string): string {
  if (regd.length < 3 || !sem) return "";

  const type = regd[0];
  const batchYY = regd.substring(1, 3);

  if (type !== "F" && type !== "L") return "";

  const batchNum = Number.parseInt(batchYY, 10);
  if (Number.isNaN(batchNum)) return "";

  const academicBatch = type === "F" ? batchNum : batchNum - 1;
  const baseYear = 2000 + academicBatch;

  const semesterNum = Number.parseInt(sem, 10);
  if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 6)
    return "";

  if (semesterNum % 2 === 1) {
    return `${baseYear + (semesterNum - 1) / 2}12`;
  }

  return `${baseYear + semesterNum / 2}05`;
}

function examCodeToLabel(code: string): string {
  if (!code || code.length < 6) return code;
  const year = code.slice(0, 4);
  const month = code.slice(4);
  return month === "05" ? `${year} Summer` : `${year} Winter`;
}

export default function MarksheetPage() {
  const currentYear = new Date().getFullYear();
  const [regd, setRegd] = useState("");
  const [examCodeOverrides, setExamCodeOverrides] = useState<
    Record<string, string>
  >({});
  const [provisionalData, setProvisionalData] =
    useState<ProvisionalData | null>(null);
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

  const derivedCodes = useMemo(() => {
    const result: Record<string, string> = {};
    for (const sem of SEMESTERS) {
      result[sem] = deriveExamCode(regd, sem);
    }
    return result;
  }, [regd]);

  const effectiveCodes = useMemo(() => {
    const result: Record<string, string> = {};
    for (const sem of SEMESTERS) {
      result[sem] = examCodeOverrides[sem] || derivedCodes[sem];
    }
    return result;
  }, [examCodeOverrides, derivedCodes]);

  const canFetch =
    regd.trim().length >= 3 && SEMESTERS.every((sem) => effectiveCodes[sem]);

  const [fetchProgress, setFetchProgress] = useState<string>("");

  const fetchWithRetry = async (
    sem: string,
    examCode: string,
    retries = 3,
  ): Promise<{ data: unknown } | null> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const resp = await axios.post(
          "/api/origin/result",
          { regd: regd.trim(), sem, examCode },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );
        return resp;
      } catch {
        if (attempt === retries) return null;
      }
    }
    return null;
  };

  const fetchResult = async () => {
    if (!canFetch) return;

    if (!canOperate()) {
      setShowLimitWarning(true);
      return;
    }

    setLoading(true);
    setError(null);
    setProvisionalData(null);
    setFetchProgress("");

    try {
      const semData: ProvisionalData["semData"] = {};
      let lastStudentInfo: ProvisionalData["studentInfo"] | null = null;

      for (const sem of SEMESTERS) {
        setFetchProgress(`Fetching ${semLabel[sem]}...`);
        const resp = await fetchWithRetry(sem, effectiveCodes[sem]);
        const d = (
          resp as {
            data?: {
              status?: number;
              data?: {
                marksData: unknown;
                examTypeCode: string;
                result: string;
                studentInfo: ProvisionalData["studentInfo"];
              };
            };
          } | null
        )?.data;
        if (d?.status === 200 && d.data) {
          semData[sem] = {
            marksData: d.data
              .marksData as ProvisionalData["semData"][string]["marksData"],
            examTypeCode: d.data.examTypeCode,
            result: d.data.result,
          };
          lastStudentInfo = d.data.studentInfo;
        }
      }

      doOperation();
      setFetchProgress("");

      if (!lastStudentInfo) {
        setError("No result data found for this registration number.");
        return;
      }

      const overriddenSems = new Set(Object.keys(examCodeOverrides));
      const examSession = effectiveCodes["06"] ?? "";

      setProvisionalData({
        semData,
        studentInfo: lastStudentInfo,
        examSession,
        overriddenSems,
      });
    } catch {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
      setFetchProgress("");
    }
  };

  return (
    <div className="flex w-full flex-col px-2 py-4">
      {showLimitWarning && (
        <LimitWarning onDismiss={() => setShowLimitWarning(false)} />
      )}
      <h1 className="mb-6 text-center text-2xl font-bold">
        Provisional Marksheet
      </h1>

      <div className="mb-4 flex w-full justify-center">
        <div className="w-full md:max-w-sm">
          <Input
            type="text"
            placeholder="Registration Number (e.g. F23015007001)"
            value={regd}
            onChange={(e) => {
              setRegd(e.target.value.toUpperCase());
              setExamCodeOverrides({});
            }}
            onKeyDown={(e) => e.key === "Enter" && fetchResult()}
          />
        </div>
      </div>

      <div className="mb-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {SEMESTERS.map((sem) => {
          const effective = effectiveCodes[sem];
          return (
            <div key={sem} className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">
                {semLabel[sem]}
              </label>
              <Select
                value={effective}
                onValueChange={(val) =>
                  setExamCodeOverrides((prev) => ({ ...prev, [sem]: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Session for ${semLabel[sem]}`}>
                    {effective
                      ? examCodeToLabel(effective)
                      : `Session for ${semLabel[sem]}`}
                  </SelectValue>
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
          );
        })}
      </div>

      <div className="flex w-full justify-center">
        <Button
          className="w-full md:max-w-sm"
          onClick={fetchResult}
          disabled={loading || !canFetch}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {fetchProgress || "Fetching..."}
            </>
          ) : (
            "View Marksheet"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {provisionalData && (
        <div className="mt-6">
          <ProvisionalMarksheetViewer data={provisionalData} />
        </div>
      )}
    </div>
  );
}
