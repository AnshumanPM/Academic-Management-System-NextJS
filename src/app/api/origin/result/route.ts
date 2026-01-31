import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { authSession } from "@/lib/auth-utils";

const ExtractOriginInfoSchema = z.object({
  regd: z
    .string()
    .length(12, "Registration Number must be exactly 12 characters long")
    .refine((val) => val[0] === "F" || val[0] === "L", {
      message: "Registration Number must start with 'F' or 'L'",
    })
    .refine((val) => /^\d+$/.test(val.slice(1)), {
      message: "Characters after the first must be digits",
    }),
  sem: z.enum(["01", "02", "03", "04", "05", "06"]),
  examCode: z.string().refine(
    (val) => {
      const year = parseInt(val.slice(0, 4));
      const month = parseInt(val.slice(4, 6));
      return (
        year >= 2000 &&
        year <= 2028 &&
        (month === 5 || month === 12) &&
        val.length === 6
      );
    },
    { message: "Invalid exam code format" },
  ),
});

async function getOriginResData(
  rollNo: string,
  sem: string,
  examCode: string,
  timeout?: number,
) {
  try {
    const response = await axios.get(
      "https://sctevt-dashboard.anshumanpm.in/getmarksinfo",
      {
        params: { regd: rollNo, sem: sem, ymcode: examCode },
        timeout: timeout,
      },
    );
    return response.data;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await authSession();

    const body = await request.json();

    const validation = ExtractOriginInfoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: 400,
          message: validation.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { regd, sem, examCode } = validation.data;

    const data = await getOriginResData(regd, sem, examCode);

    if (data && data.marksData) {
      data.marksData.sort(
        (a: { sortingOrder: number }, b: { sortingOrder: number }) =>
          a.sortingOrder - b.sortingOrder,
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    } else {
      return NextResponse.json(
        { status: 400, message: "No Results Found" },
        { status: 400 },
      );
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    if (
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Authentication failed")
    ) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized: Please sign in to access this resource",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { status: 400, message: `Error: ${errorMessage}` },
      { status: 400 },
    );
  }
}
