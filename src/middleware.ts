import { NextResponse, type NextRequest } from "next/server";

/** / → /bg или /en според езика на браузъра */
export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept-language") ?? "";
  const lang = /^bg|,\s*bg/i.test(accept) || !/^en|,\s*en/i.test(accept) ? "bg" : "en";
  return NextResponse.redirect(new URL(`/${lang}`, req.url));
}

export const config = { matcher: ["/"] };
