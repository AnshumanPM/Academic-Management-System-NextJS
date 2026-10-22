import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

async function handle(req: Request, fn: (req: Request) => Promise<Response>) {
  try {
    return await fn(req);
  } catch (error) {
    console.error("Auth route error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export const GET = (req: Request) => handle(req, handlers.GET);
export const POST = (req: Request) => handle(req, handlers.POST);
