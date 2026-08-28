import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(
      "https://bput-dashboard.zdns.in/get_exam_session_list",
      {
        headers: {
          "X-API-Access-Key": process.env.BPUT_API_ACCESS_KEY as string,
        },
      },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      { status: 400, message: `Error: ${errorMessage}` },
      { status: 400 },
    );
  }
}
