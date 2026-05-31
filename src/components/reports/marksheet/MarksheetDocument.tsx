"use client";

import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { tw } from "@/lib/utils";

export interface MarksEntry {
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

export interface StudentInfo {
  studentName: string;
  registrationNumber: string;
  instituteName: string;
  courseName: string;
}

export interface MarksheetData {
  marksData: MarksEntry[];
  studentInfo: StudentInfo;
  result: string;
}

export interface MarksheetDocumentProps {
  data: MarksheetData;
  examLabel?: string;
  semester?: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export function extractMarksheetData(apiResponse: {
  marksData: Array<{
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
    [key: string]: unknown;
  }>;
  studentInfo: {
    studentName: string;
    registrationNumber: string;
    instituteName: string;
    courseName: string;
    [key: string]: unknown;
  };
  result: string;
}): MarksheetData {
  return {
    marksData: apiResponse.marksData.map((m) => ({
      paperTypeCode: m.paperTypeCode ?? "",
      subjectName: m.subjectName ?? "",
      totalFullMark: m.totalFullMark ?? "",
      totalPassMark: m.totalPassMark ?? "",
      semYearFullMark: m.semYearFullMark ?? "",
      internalFullMark: m.internalFullMark ?? "",
      securedTH: m.securedTH ?? "",
      securedIA: m.securedIA ?? "",
      securedTotal: m.securedTotal ?? "",
      sortingOrder: m.sortingOrder ?? 999,
    })),
    studentInfo: {
      studentName: apiResponse.studentInfo.studentName ?? "",
      registrationNumber:
        apiResponse.studentInfo.registrationNumber?.trim() ?? "",
      instituteName: apiResponse.studentInfo.instituteName ?? "",
      courseName: apiResponse.studentInfo.courseName ?? "",
    },
    result: apiResponse.result ?? "",
  };
}

const bodyCell =
  "border-r border-b border-foreground justify-center px-1 py-0.5";

const headerCell =
  "border-r border-b-2 border-foreground justify-center px-1 py-0.5";

export function MarksheetDocument({
  data,
  examLabel,
  semester,
  logoUrl,
  signatureUrl,
}: MarksheetDocumentProps) {
  const { marksData, studentInfo, result } = data;

  const subjectRows = marksData.filter((m) => m.sortingOrder < 100);
  const sessionalRow = marksData.find((m) => m.paperTypeCode === "Sessional");
  const totalRow = marksData.find((m) => m.subjectName === "Total");
  const displayRows = [...subjectRows, ...(sessionalRow ? [sessionalRow] : [])];

  return (
    <Document>
      <Page
        size="A4"
        style={tw(
          "font-sans text-[8.5px] pt-8 pb-24 px-6 bg-background text-foreground",
        )}
      >
        <View style={tw("border border-foreground p-4 flex-1 flex flex-col")}>
          <View
            style={tw("flex flex-row items-center justify-center mb-4 mt-2")}
          >
            {logoUrl && (
              <Image
                src={logoUrl}
                style={{ width: 64, height: 64, marginRight: 14 }}
              />
            )}
            <View style={tw("flex-1 flex flex-col items-center")}>
              <Text style={tw("text-[12px] font-bold text-center uppercase")}>
                State Council for Technical Education and Vocational Training,
                Odisha
              </Text>
              <Text
                style={tw("text-[12px] font-bold text-center uppercase mt-1")}
              >
                Bhubaneswar
              </Text>
            </View>
          </View>

          <Text
            style={tw("text-[12px] font-bold text-center uppercase mt-5 mb-6")}
          >
            Marksheet - Diploma Examination
          </Text>

          <View style={tw("flex flex-col gap-2")}>
            {(
              [
                ["Examination", examLabel ?? ""],
                ["Centre", studentInfo.instituteName],
                [
                  "Semester & Branch",
                  `${studentInfo.courseName}${semester ? `, ${semester}` : ""}`,
                ],
                ["Name", studentInfo.studentName],
                ["Registration No", studentInfo.registrationNumber],
              ] as [string, string][]
            ).map(([label, value]) => (
              <View key={label} style={tw("flex flex-row")}>
                <Text
                  style={{
                    width: 130,
                    fontSize: 9,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </Text>
                <Text style={{ width: 10, fontSize: 9 }}>:</Text>
                <Text
                  style={{ flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold" }}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>

          <View style={tw("mt-6 border-l border-t border-foreground")}>
            <View style={tw("flex flex-row")}>
              <View style={{ ...tw(headerCell), width: 66 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>
                  Subject Code
                </Text>
              </View>
              <View style={{ ...tw(headerCell), flex: 1 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>
                  Subject Name
                </Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 34 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>TH</Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 34 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>IA</Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 54 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>
                  TOTAL
                </Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 54 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>
                  Pass Mark
                </Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 34 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>TH</Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 34 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>IA</Text>
              </View>
              <View style={{ ...tw(`${headerCell} items-center`), width: 54 }}>
                <Text style={tw("text-[8.5px] font-bold text-center")}>
                  TOTAL
                </Text>
              </View>
            </View>

            {displayRows.map((s, i) => (
              <View key={i} style={tw("flex flex-row")}>
                <View style={{ ...tw(bodyCell), width: 66 }}>
                  <Text style={tw("text-[8.5px]")}>{s.paperTypeCode}</Text>
                </View>
                <View style={{ ...tw(bodyCell), flex: 1 }}>
                  <Text style={tw("text-[8.5px]")}>{s.subjectName}</Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 34 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.semYearFullMark}
                  </Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 34 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.internalFullMark}
                  </Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 54 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.totalFullMark}
                  </Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 54 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.totalPassMark}
                  </Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 34 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.securedTH}
                  </Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 34 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.securedIA}
                  </Text>
                </View>
                <View style={{ ...tw(`${bodyCell} items-center`), width: 54 }}>
                  <Text style={tw("text-[8.5px] text-center")}>
                    {s.securedTotal}
                  </Text>
                </View>
              </View>
            ))}

            {totalRow && (
              <View style={tw("flex flex-row")}>
                <View style={{ ...tw(bodyCell), width: 66 }}>
                  <Text style={tw("text-[8.5px]")} />
                </View>
                <View style={{ ...tw(bodyCell), flex: 1 }}>
                  <Text style={tw("text-[8.5px] font-bold")}>Total</Text>
                </View>
                <View style={{ ...tw(bodyCell), width: 34 }}>
                  <Text style={tw("text-[8.5px]")} />
                </View>
                <View style={{ ...tw(bodyCell), width: 34 }}>
                  <Text style={tw("text-[8.5px]")} />
                </View>
                <View style={{ ...tw(bodyCell), width: 54 }}>
                  <Text style={tw("text-[8.5px] font-bold text-center")}>
                    {totalRow.totalFullMark}
                  </Text>
                </View>
                <View style={{ ...tw(bodyCell), width: 54 }}>
                  <Text style={tw("text-[8.5px]")} />
                </View>
                <View style={{ ...tw(bodyCell), width: 34 }}>
                  <Text style={tw("text-[8.5px]")} />
                </View>
                <View style={{ ...tw(bodyCell), width: 34 }}>
                  <Text style={tw("text-[8.5px]")} />
                </View>
                <View style={{ ...tw(bodyCell), width: 54 }}>
                  <Text style={tw("text-[8.5px] font-bold text-center")}>
                    {totalRow.securedTotal}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={tw("flex flex-row mt-4")}>
            <Text style={tw("text-[10px] font-bold")}>Result :</Text>
            <Text style={tw("text-[10px] font-bold ml-1")}>{result}</Text>
          </View>

          {/* <View style={tw("flex-1 justify-center py-3")}>
            <View style={tw("flex flex-row justify-between items-end")}>
              <View style={tw("items-center text-center")}>
                <Text style={tw("text-[8.5px] font-bold")}>CHECKED BY</Text>
              </View>
              <View style={tw("items-center text-center")}>
                <Text style={tw("text-[8.5px] font-bold")}>PRINCIPAL</Text>
                <Text style={tw("text-[8.5px] font-bold")}>WITH SEAL</Text>
              </View>
              <View style={tw("items-center text-center max-w-[220px]")}>
                {signatureUrl && (
                  <Image
                    src={signatureUrl}
                    style={{ width: 82, height: 28, marginBottom: 4 }}
                  />
                )}
                <Text style={tw("text-[8.5px] font-bold")}>
                  CONTROLLER OF EXAMINATIONS
                </Text>
                <Text style={tw("text-[8.5px] font-bold")}>
                  STATE COUNCIL FOR TECHNICAL EDUCATION &amp;
                </Text>
                <Text style={tw("text-[8.5px] font-bold")}>
                  VOCATIONALTRAINING, ODISHA
                </Text>
              </View>
            </View>
          </View> */}

          {/* <View style={tw("border border-foreground p-3")}>
            <Text style={tw("text-[8.5px]")}>
              N B :- After Signature of the Prinicipal of the concerned
              institute this document will be treated as a valid document.
            </Text>
          </View> */}
        </View>
      </Page>
    </Document>
  );
}
