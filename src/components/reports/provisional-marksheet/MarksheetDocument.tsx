"use client";

import { Document, Page, View, Text } from "@react-pdf/renderer";
import { tw } from "@/lib/utils";

const borderColor = "#000000";
const CODE_W = 34;
const MARK_W = 40;
const ROW_H = 11;
const TITLE_H = 18;
const TOTAL_H = 18;

export interface MarksEntry {
  subjectCode: string | null;
  paperTypeCode: string;
  subjectName: string;
  totalFullMark: string;
  totalPassMark: string;
  subjectTypeCode: string | null;
  semYearFullMark: string;
  internalFullMark: string;
  sortingOrder: number;
  securedTH: string;
  securedIA: string;
  securedTotal: string;
}

export interface StudentInfo {
  studentID?: string;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  gender?: string;
  registrationNumber: string;
  photo?: string;
  instituteName: string;
  courseName: string;
}

export interface SemData {
  marksData: MarksEntry[];
  examTypeCode: string;
  result: string;
}

export interface ProvisionalData {
  semData: Record<string, SemData>;
  studentInfo: StudentInfo;
  examSession: string;
  overriddenSems: Set<string>;
}

interface SemesterBlock {
  title: string;
  marksData: MarksEntry[];
}

function getSubjectRows(marksData: MarksEntry[]) {
  return marksData.filter((m) => m.sortingOrder < 100);
}
function getSessional(marksData: MarksEntry[]) {
  return marksData.find((m) => m.paperTypeCode === "Sessional");
}
function getTotal(marksData: MarksEntry[]) {
  return marksData.find((m) => m.subjectName === "Total");
}

function examCodeToLabel(code: string): string {
  if (!code || code.length < 6) return code;
  const year = code.slice(0, 4);
  const month = code.slice(4);
  return month === "05" ? `Summer-${year}` : `Winter-${year}`;
}

function DataRow({
  code,
  name,
  full,
  secured,
  blank = false,
}: {
  code: string;
  name: string;
  full: string;
  secured: string;
  blank?: boolean;
}) {
  return (
    <View
      style={{
        ...tw("flex flex-row border-l border-r"),
        height: ROW_H,
        borderColor,
      }}
    >
      <View
        style={{
          ...tw("border-r"),
          borderColor,
          width: CODE_W,
          justifyContent: "center",
        }}
      >
        <Text style={tw("text-[8px] pl-1")}>{blank ? "" : code}</Text>
      </View>
      <View
        style={{
          ...tw("border-r"),
          borderColor,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text style={tw("text-[8px] pl-1")}>{blank ? "" : name}</Text>
      </View>
      <View
        style={{
          ...tw("border-r"),
          borderColor,
          width: MARK_W,
          justifyContent: "center",
        }}
      >
        <Text style={tw("text-[8px] font-bold text-right pr-1")}>
          {blank ? "" : full}
        </Text>
      </View>
      <View style={{ width: MARK_W, justifyContent: "center" }}>
        <Text style={tw("text-[8px] font-bold text-right pr-1")}>
          {blank ? "" : secured}
        </Text>
      </View>
    </View>
  );
}

function SemesterRows({
  semester,
  maxRows,
}: {
  semester: SemesterBlock;
  maxRows: number;
}) {
  const subjectRows = getSubjectRows(semester.marksData);
  const sessional = getSessional(semester.marksData);
  const total = getTotal(semester.marksData);
  const fillerCount = maxRows - subjectRows.length;
  const fillers = Array.from({ length: fillerCount });

  return (
    <>
      <View
        style={{
          ...tw("flex flex-row border-b"),
          borderColor,
          height: TITLE_H,
        }}
      >
        <Text style={tw("text-[9px] font-bold pl-1 self-center")}>
          {semester.title}
        </Text>
      </View>

      {subjectRows.map((row) => (
        <DataRow
          key={`${semester.title}-${row.sortingOrder}`}
          code={row.paperTypeCode}
          name={row.subjectName}
          full={row.semYearFullMark}
          secured={row.securedTotal}
        />
      ))}

      {sessional && (
        <DataRow
          code=""
          name="Sessional"
          full={sessional.totalFullMark}
          secured={sessional.securedTotal}
        />
      )}

      {fillers.map((_, i) => (
        <DataRow key={`filler-${i}`} code="" name="" full="" secured="" blank />
      ))}

      <View
        style={{
          ...tw("flex flex-row border-t-2 border-b border-l border-r"),
          borderColor,
          height: TOTAL_H,
          justifyContent: "center",
        }}
      >
        <View style={{ width: CODE_W }} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={tw("text-[8px] font-bold pl-1")}>Total</Text>
        </View>
        <View style={{ width: MARK_W, justifyContent: "center" }}>
          <Text style={tw("text-[8px] font-bold text-right pr-1")}>
            {total?.totalFullMark}
          </Text>
        </View>
        <View style={{ width: MARK_W, justifyContent: "center" }}>
          <Text style={tw("text-[8px] font-bold text-right pr-1")}>
            {total?.securedTotal}
          </Text>
        </View>
      </View>
    </>
  );
}

function TableHeader() {
  return (
    <View style={{ ...tw("flex flex-row border border-b-2"), borderColor }}>
      <View style={{ ...tw("border-r"), borderColor, width: CODE_W }}>
        <Text style={tw("text-[8px] font-bold text-center py-1")}>
          Subject{"\n"}Code
        </Text>
      </View>
      <View style={{ ...tw("border-r"), borderColor, flex: 1 }}>
        <Text style={tw("text-[8px] font-bold text-center py-1")}>
          Subject Name
        </Text>
      </View>
      <View style={{ ...tw("border-r"), borderColor, width: MARK_W }}>
        <Text style={tw("text-[8px] font-bold text-center py-1")}>
          Full{"\n"}Marks
        </Text>
      </View>
      <View style={{ width: MARK_W }}>
        <Text style={tw("text-[8px] font-bold text-center py-1")}>
          Marks{"\n"}Secured
        </Text>
      </View>
    </View>
  );
}

const SEM_TITLES: Record<string, string> = {
  "01": "1st Semester",
  "02": "2nd Semester",
  "03": "3rd Semester",
  "04": "4th Semester",
  "05": "5th Semester",
  "06": "6th Semester",
};

const LEFT_SEMS = ["01", "03", "05"] as const;
const RIGHT_SEMS = ["02", "04", "06"] as const;

function calcTotals(semData: Record<string, SemData>) {
  let rawFull = 0;
  let rawSecured = 0;
  let weightedFull = 0;
  let weightedSecured = 0;

  for (const [sem, sd] of Object.entries(semData)) {
    const totalRow = sd.marksData.find((m) => m.subjectName === "Total");
    if (!totalRow) continue;
    const full = Number(totalRow.totalFullMark) || 0;
    const secured = Number(totalRow.securedTotal) || 0;
    rawFull += full;
    rawSecured += secured;
    const weight = sem === "01" || sem === "02" ? 0.5 : 1;
    weightedFull += full * weight;
    weightedSecured += secured * weight;
  }

  return {
    rawFull,
    rawSecured,
    effectiveFull: Math.ceil(weightedFull),
    admissible: Math.ceil(weightedSecured),
  };
}

function calcDivision(
  semData: Record<string, SemData>,
  effectiveFull: number,
  admissible: number,
  overriddenSems: Set<string>,
): string {
  const allPassed = Object.values(semData).every((sd) =>
    sd.result?.trim().toLowerCase().startsWith("pass")
  );
  const pct = effectiveFull > 0 ? (admissible / effectiveFull) * 100 : 0;
  const isFirstDivision = pct >= 60;
  const noOverrides = overriddenSems.size === 0;

  if (allPassed && isFirstDivision && noOverrides) return "First with Honours";
  if (pct >= 60) return "First";
  if (pct >= 50) return "Second";
  return "Third";
}

function getSlYear(examSession: string): string {
  if (examSession && examSession.length >= 4) return examSession.slice(0, 4);
  return new Date().getFullYear().toString();
}

export interface ProvisionalMarksheetDocumentProps {
  data: ProvisionalData;
}

export function ProvisionalMarksheetDocument({
  data,
}: ProvisionalMarksheetDocumentProps) {
  const { semData, studentInfo, examSession, overriddenSems } = data;

  const leftBlocks: SemesterBlock[] = LEFT_SEMS.map((sem) => ({
    title: SEM_TITLES[sem],
    marksData: semData[sem]?.marksData ?? [],
  }));

  const rightBlocks: SemesterBlock[] = RIGHT_SEMS.map((sem) => ({
    title: SEM_TITLES[sem],
    marksData: semData[sem]?.marksData ?? [],
  }));

  const semesterPairs = leftBlocks.map((left, i) => {
    const right = rightBlocks[i];
    const maxRows = Math.max(
      getSubjectRows(left.marksData).length,
      getSubjectRows(right.marksData).length,
    );
    return { left, right, maxRows };
  });

  const { rawFull, rawSecured, effectiveFull, admissible } =
    calcTotals(semData);
  const division = calcDivision(
    semData,
    effectiveFull,
    admissible,
    overriddenSems,
  );
  const slYear = getSlYear(examSession);
  const examinationLabel = examCodeToLabel(examSession);

  return (
    <Document>
      <Page
        size="A4"
        style={tw("bg-white text-black px-8 py-7 text-[8px] font-sans")}
      >
        <View style={{ ...tw("border p-5 flex-1"), borderColor }}>
          <Text style={tw("text-[9px] font-bold text-right mb-4")}>
            Sl. No. : {slYear}/{studentInfo.registrationNumber}
          </Text>

          <View style={tw("items-center mb-3")}>
            <Text
              style={tw(
                "text-[13px] font-bold text-center uppercase leading-tight",
              )}
            >
              State Council for Technical Education & Vocational Training
            </Text>
            <Text
              style={tw(
                "text-[13px] font-bold text-center uppercase leading-tight",
              )}
            >
              Odisha
            </Text>
          </View>

          <Text
            style={tw(
              "text-[11px] font-bold text-center uppercase mb-5 tracking-wide",
            )}
          >
            Provisional Divisional Mark Sheet Cum Transcript
          </Text>

          <View style={tw("mb-5")}>
            <View style={tw("flex flex-row mb-2")}>
              <Text style={{ flex: 1, fontSize: 8.5 }}>
                Name of the Candidate Sri/Kumari:{" "}
                <Text style={tw("font-bold")}>{studentInfo.studentName}</Text>
              </Text>
              <Text style={{ width: 190, fontSize: 8.5, textAlign: "right" }}>
                Registration No.:{" "}
                <Text style={tw("font-bold")}>
                  {studentInfo.registrationNumber}
                </Text>
              </Text>
            </View>

            <View style={tw("flex flex-row mb-2")}>
              <Text style={{ flex: 1, fontSize: 8.5 }}>
                Branch:{" "}
                <Text style={tw("font-bold")}>{studentInfo.courseName}</Text>
              </Text>
              <Text style={{ width: 190, fontSize: 8.5, textAlign: "right" }}>
                Examination:{" "}
                <Text style={tw("font-bold")}>{examinationLabel}</Text>
              </Text>
            </View>

            <View style={tw("flex flex-row")}>
              <Text style={{ flex: 1, fontSize: 8.5 }}>
                Institution:{" "}
                <Text style={tw("font-bold")}>{studentInfo.instituteName}</Text>
              </Text>
              <View style={{ width: 190 }} />
            </View>
          </View>

          <View style={tw("flex flex-row")}>
            <View style={{ flex: 1 }}>
              <TableHeader />
              <View>
                {semesterPairs.map((pair) => (
                  <SemesterRows
                    key={pair.left.title}
                    semester={pair.left}
                    maxRows={pair.maxRows}
                  />
                ))}
              </View>
            </View>

            <View style={{ width: 14 }} />

            <View style={{ flex: 1 }}>
              <TableHeader />
              <View>
                {semesterPairs.map((pair) => (
                  <SemesterRows
                    key={pair.right.title}
                    semester={pair.right}
                    maxRows={pair.maxRows}
                  />
                ))}
              </View>
            </View>
          </View>

          <Text style={tw("text-[8px] text-center mt-3 mb-3")}>
            Weightage of marks : 50% (1st & 2nd semester) 100% (All other
            semesters)
          </Text>

          <View style={tw("flex flex-row")}>
            <View style={{ flex: 1 }}>
              <Text style={tw("text-[8.5px] mb-2")}>
                Full Marks : <Text style={tw("font-bold")}>{rawFull}</Text>
              </Text>
              <Text style={tw("text-[8.5px]")}>
                Marks Secured :{" "}
                <Text style={tw("font-bold")}>{rawSecured}</Text>
              </Text>
            </View>
            <View style={{ flex: 1, paddingLeft: 24 }}>
              <Text style={{ ...tw("text-[8.5px] mb-2"), textAlign: "right" }}>
                Effective full Marks :{" "}
                <Text style={tw("font-bold")}>{effectiveFull}</Text>
              </Text>
              <Text style={{ ...tw("text-[8.5px] mb-2"), textAlign: "right" }}>
                Marks admissible for Division :{" "}
                <Text style={tw("font-bold")}>{admissible}</Text>
              </Text>
              <Text style={{ ...tw("text-[8.5px]"), textAlign: "right" }}>
                Division : <Text style={tw("font-bold")}>{division}</Text>
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
