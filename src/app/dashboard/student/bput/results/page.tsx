"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle } from "lucide-react";

interface StudentInfo {
  rollNo: string;
  studentName: string;
  batch: string;
  branchId: string;
  studentPhoto: string;
  branchName: string;
  courseName: string;
  collegeCode: string;
  collegeName: string;
  semId: string | null;
  maxYear: string | null;
  leet: string | null;
}

interface GradeData {
  semester: string;
  course: string | null;
  semId: string;
  branchName: string | null;
  rollNo: string;
  subjectCODE: string;
  subjectTP: string;
  subjectName: string;
  subjectCredits: number;
  grade: string;
  points: number;
  creditPoints: number;
  recheck: number;
}

interface SgpaDetails {
  credits: number;
  totalGradePoints: number;
  sgpa: string;
}

interface ResultsResponse {
  grades: GradeData[];
  sgpadetails: SgpaDetails;
}

interface SemesterListEntry {
  course?: string | null;
  semester?: string;
  semId: string;
  branchName?: string | null;
  rollNo: string;
  examSession: string;
}

interface SemesterOption {
  value: string;
  label: string;
}

interface ExamSessionsResponse {
  exam_sessions: string[];
}

const ORDINAL_SUFFIX: Record<string, string> = {
  "1": "1st",
  "2": "2nd",
  "3": "3rd",
  "4": "4th",
  "5": "5th",
  "6": "6th",
  "7": "7th",
  "8": "8th",
};

const ALL_SEMESTER_OPTIONS: SemesterOption[] = Object.entries(
  ORDINAL_SUFFIX,
).map(([value, label]) => ({ value, label: `${label} Semester` }));

export default function Results() {
  const [rollNo, setRollNo] = useState("");
  const [session, setSession] = useState("");
  const [semId, setSemId] = useState("");
  const [sessionOptions, setSessionOptions] = useState<string[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [semesterOptions, setSemesterOptions] =
    useState<SemesterOption[]>(ALL_SEMESTER_OPTIONS);
  const [semLoading, setSemLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [resultData, setResultData] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const canOperate = useLimitStore((s) => s.canOperate);
  const doOperation = useLimitStore((s) => s.doOperation);

  const isRollNoValid = /^\d{10}$/.test(rollNo);

  useEffect(() => {
    let cancelled = false;

    const loadExamSessions = async () => {
      setSessionLoading(true);
      setSessionError(null);

      try {
        const response = await axios.get<ExamSessionsResponse>(
          "/api/origin/bput/get-exam-sessions",
          { withCredentials: true },
        );

        if (cancelled) return;

        const sessions = response.data?.exam_sessions;

        if (Array.isArray(sessions) && sessions.length > 0) {
          setSessionOptions(sessions);
        } else {
          setSessionError("No exam sessions available");
        }
      } catch {
        if (!cancelled) setSessionError("Failed to load exam sessions");
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    };

    loadExamSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isRollNoValid || !session) {
      setSemesterOptions(ALL_SEMESTER_OPTIONS);
      setSemId("");
      return;
    }

    let cancelled = false;

    const loadSemesters = async () => {
      setSemLoading(true);
      setSemId("");

      try {
        const response = await axios.post(
          "/api/origin/bput/results-lists",
          { rollNo, session },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );

        const data = response.data;

        if (cancelled) return;

        if (
          data.status === 200 &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          const entries: SemesterListEntry[] = data.data;
          const seen = new Set<string>();
          const options: SemesterOption[] = [];

          entries.forEach((entry) => {
            if (seen.has(entry.semId)) return;
            seen.add(entry.semId);
            const label =
              entry.semester ?? ORDINAL_SUFFIX[entry.semId] ?? entry.semId;
            options.push({ value: entry.semId, label: `${label} Semester` });
          });

          options.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
          setSemesterOptions(options);
        } else {
          setSemesterOptions(ALL_SEMESTER_OPTIONS);
        }
      } catch {
        if (!cancelled) setSemesterOptions(ALL_SEMESTER_OPTIONS);
      } finally {
        if (!cancelled) setSemLoading(false);
      }
    };

    loadSemesters();

    return () => {
      cancelled = true;
    };
  }, [rollNo, session, isRollNoValid]);

  const fetchResult = async () => {
    if (!isRollNoValid || !session || !semId) return;

    if (!canOperate()) {
      setShowLimitWarning(true);
      return;
    }

    setLoading(true);
    setError(null);
    setStudentInfo(null);
    setResultData(null);

    try {
      const [studentRes, resultsRes] = await Promise.all([
        axios.post(
          "/api/origin/bput/student-details",
          { rollNo },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        ),
        axios.post(
          "/api/origin/bput/results",
          { rollNo, semid: semId, session },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        ),
      ]);

      const studentData = studentRes.data;
      const gradesData = resultsRes.data;

      if (studentData.status === 200 && gradesData.status === 200) {
        doOperation();
        setStudentInfo(studentData.data);
        setResultData(gradesData.data);
      } else {
        setError(
          gradesData.detail?.[0]?.msg ||
            studentData.detail?.[0]?.msg ||
            "Failed to fetch result",
        );
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
      <h1 className="mb-6 text-center text-2xl font-bold">Student Result</h1>

      <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-center">
        <div className="w-full md:max-w-xs">
          <Input
            type="text"
            placeholder="Registration Number"
            value={rollNo}
            onChange={(e) =>
              setRollNo(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            onKeyDown={(e) => e.key === "Enter" && fetchResult()}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <Select
            value={session}
            onValueChange={setSession}
            disabled={sessionLoading}
          >
            <SelectTrigger className="w-full">
              {sessionLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sessions...
                </span>
              ) : (
                <SelectValue placeholder="Select Session" />
              )}
            </SelectTrigger>
            <SelectContent>
              {sessionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:max-w-xs">
          <Select value={semId} onValueChange={setSemId} disabled={semLoading}>
            <SelectTrigger className="w-full">
              {semLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading semesters...
                </span>
              ) : (
                <SelectValue placeholder="Select Semester" />
              )}
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:max-w-xs">
          <Button
            className="w-full"
            onClick={fetchResult}
            disabled={loading || !isRollNoValid || !session || !semId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "View"
            )}
          </Button>
        </div>
      </div>

      {sessionError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{sessionError}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {studentInfo && resultData && (
        <div className="mt-6 flex flex-col gap-y-6">
          <div className="flex justify-center">
            <Avatar className="ring-primary ring-offset-background h-28 w-28 ring-2 ring-offset-2">
              <AvatarImage
                src={`https://bput-proxy.anshumanpm.eu.org/StudentPhotos/${studentInfo.studentPhoto}`}
                alt={studentInfo.studentName}
              />
              <AvatarFallback>
                {studentInfo.studentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          <Table className="border-border table-fixed border">
            <TableBody>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  Registration Number
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.rollNo}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  Student Name
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.studentName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  Batch
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.batch}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  Branch Name
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.branchName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  Course
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.courseName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  College Name
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.collegeName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-border w-1/2 border font-bold wrap-break-word whitespace-normal">
                  College Code
                </TableCell>
                <TableCell className="border-border w-1/2 border wrap-break-word whitespace-normal">
                  {studentInfo.collegeCode}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Table className="border-border table-fixed border">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="border-border w-2/5 border font-bold wrap-break-word whitespace-normal">
                  Subject
                </TableHead>
                <TableHead className="border-border w-1/6 border text-center font-bold wrap-break-word whitespace-normal">
                  Credits
                </TableHead>
                <TableHead className="border-border w-1/6 border text-center font-bold wrap-break-word whitespace-normal">
                  Grade
                </TableHead>
                <TableHead className="border-border w-1/6 border text-center font-bold wrap-break-word whitespace-normal">
                  Points
                </TableHead>
                <TableHead className="border-border w-1/6 border text-center font-bold wrap-break-word whitespace-normal">
                  Credit Pts
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultData.grades.map((subject) => (
                <TableRow key={subject.subjectCODE}>
                  <TableCell className="border-border w-2/5 border wrap-break-word whitespace-normal">
                    {subject.subjectName}
                    {subject.recheck === 1 && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        (Recheck)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                    {subject.subjectCredits}
                  </TableCell>
                  <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                    {subject.grade}
                  </TableCell>
                  <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                    {subject.points}
                  </TableCell>
                  <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                    {subject.creditPoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted">
                <TableCell className="border-border w-2/5 border font-bold wrap-break-word whitespace-normal">
                  SGPA
                </TableCell>
                <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                  {resultData.sgpadetails.credits}
                </TableCell>
                <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                  -
                </TableCell>
                <TableCell className="border-border w-1/6 border text-center wrap-break-word whitespace-normal">
                  {resultData.sgpadetails.totalGradePoints}
                </TableCell>
                <TableCell className="border-border w-1/6 border text-center font-bold wrap-break-word whitespace-normal">
                  {resultData.sgpadetails.sgpa}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <div className="w-full text-center">
            <p className="text-muted-foreground text-xs">
              *All information shown here is based on the BPUT Result API.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
