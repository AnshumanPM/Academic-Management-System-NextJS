import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { authSession } from "@/lib/auth-utils";

const StudentDetailsSchema = z.object({
  rollNo: z
    .string()
    .length(10, "Roll Number must be exactly 10 characters long")
    .regex(/^\d+$/, "Roll Number must contain only digits"),
});

async function getStudentDetails(rollNo: string, timeout?: number) {
  try {
    const response = await axios.get(
      "https://bput-dashboard.zdns.in/student_details_results",
      {
        params: {
          rollNo,
        },
        headers: {
          "X-API-Access-Key": process.env.BPUT_API_ACCESS_KEY as string,
        },
        timeout,
      },
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authSession();

    if (!session?.user) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const validation = StudentDetailsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: 400,
          message: validation.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { rollNo } = validation.data;

    const data = await getStudentDetails(rollNo);

    if (data) {
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    return NextResponse.json(
      { status: 400, message: "Student Details Not Found" },
      { status: 400 },
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      { status: 400, message: `Error: ${errorMessage}` },
      { status: 400 },
    );
  }
}
