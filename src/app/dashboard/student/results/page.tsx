"use client";

import { useState, useEffect } from "react";
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
  registrationNumber: string;
  studentName: string;
  dob: string;
  gender: string;
  courseName: string;
  instituteName: string;
  photo: string;
}

interface MarksData {
  sortingOrder: number;
  subjectName: string;
  securedTH: number | null;
  securedIA: number | null;
  securedTotal: number;
}

interface ResultData {
  studentInfo: StudentInfo;
  marksData: MarksData[];
  examTypeCode: string;
  result: string;
}

export default function Results() {
  const [regd, setRegd] = useState("");
  const [sem, setSem] = useState("");
  const [examCode, setExamCode] = useState("202505");
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExamOptions = () => {
    const options: Record<string, string> = {};
    for (let year = 2025; year >= 2020; year--) {
      options[`${year}05`] = `${year} Summer`;
      options[`${year}12`] = `${year} Winter`;
    }
    return options;
  };

  const examOptions = generateExamOptions();

  useEffect(() => {
    if (regd.length < 3 || !sem) {
      setExamCode("");
      return;
    }

    const type = regd[0];
    const batchYY = regd.substring(1, 3);

    if (type !== "F" && type !== "L") {
      setExamCode("");
      return;
    }

    const batchNum = parseInt(batchYY, 10);
    if (isNaN(batchNum)) {
      setExamCode("");
      return;
    }

    const academicBatch = type === "F" ? batchNum : batchNum - 1;
    const baseYear = 2000 + academicBatch;

    const semesterNum = parseInt(sem, 10);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 6) {
      setExamCode("");
      return;
    }

    let examYear: number;
    let examMonth: string;

    if (semesterNum % 2 === 1) {
      examYear = baseYear + (semesterNum - 1) / 2;
      examMonth = "12";
    } else {
      examYear = baseYear + semesterNum / 2;
      examMonth = "05";
    }

    setExamCode(`${examYear}${examMonth}`);
  }, [regd, sem]);

  const fetchResult = async () => {
    if (!regd.trim() || !sem || !examCode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://resultapi.anshumanpm.in/api/extorigininfocse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ regd, sem, examCode }),
        },
      );

      const data = await response.json();

      if (data.status === 200) {
        setResultData(data.data);
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
    <div className="flex w-full flex-col px-4 py-6">
      <h1 className="mb-6 text-center text-2xl font-bold">
        SCTEVT Student Result
      </h1>

      <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-center">
        <div className="w-full md:max-w-xs">
          <Input
            type="text"
            placeholder="Registration Number"
            value={regd}
            onChange={(e) => setRegd(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && fetchResult()}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <Select value={sem} onValueChange={setSem}>
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
          <Select value={examCode} onValueChange={setExamCode}>
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
            disabled={loading || !regd.trim() || !sem || !examCode}
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

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultData && (
        <div className="my-6 flex flex-col gap-y-6">
          {/* Student Image */}
          <div className="flex justify-center">
            <Avatar className="h-28 w-28 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <AvatarImage
                src={`https://sctevt-res-proxy.anshumanpm.eu.org/images/StudPhoto/${resultData.studentInfo.photo}`}
                alt={resultData.studentInfo.studentName}
              />
              <AvatarFallback>
                {resultData.studentInfo.studentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Student Information */}
          <Table className="table-fixed border border-border">
            <TableBody>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Registration Number
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {resultData.studentInfo.registrationNumber}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Student Name
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {resultData.studentInfo.studentName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Date of Birth
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {new Date(resultData.studentInfo.dob).toLocaleDateString(
                    "en-IN",
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Gender
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {resultData.studentInfo.gender === "M" ? "Male" : "Female"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Branch Name
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {resultData.studentInfo.courseName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  College Name
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {resultData.studentInfo.instituteName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Exam Type
                </TableCell>
                <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                  {resultData.examTypeCode === "R" ? "Regular" : "Ex-Regular"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Marks Table */}
          <Table className="table-fixed border border-border">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Subject
                </TableHead>
                <TableHead className="w-1/6 border border-border text-center font-bold whitespace-normal break-words">
                  TH
                </TableHead>
                <TableHead className="w-1/6 border border-border text-center font-bold whitespace-normal break-words">
                  IA
                </TableHead>
                <TableHead className="w-1/6 border border-border text-center font-bold whitespace-normal break-words">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultData.marksData
                .sort((a, b) => a.sortingOrder - b.sortingOrder)
                .map((subject) => (
                  <TableRow key={subject.sortingOrder}>
                    <TableCell className="w-1/2 border border-border whitespace-normal break-words">
                      {subject.subjectName}
                    </TableCell>
                    <TableCell className="w-1/6 border border-border text-center whitespace-normal break-words">
                      {subject.securedTH ?? "-"}
                    </TableCell>
                    <TableCell className="w-1/6 border border-border text-center whitespace-normal break-words">
                      {subject.securedIA ?? "-"}
                    </TableCell>
                    <TableCell className="w-1/6 border border-border text-center whitespace-normal break-words">
                      {subject.securedTotal}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted">
                <TableCell className="w-1/2 border border-border font-bold whitespace-normal break-words">
                  Result
                </TableCell>
                <TableCell
                  colSpan={3}
                  className="w-1/2 border border-border text-center font-bold whitespace-normal break-words"
                >
                  {resultData.result}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <div className="w-full text-center">
            <p className="text-xs text-muted-foreground">
              *All information shown here is based on the SCTEVT Result API.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
