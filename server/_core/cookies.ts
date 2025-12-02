import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

// في ملف server/_core/cookies.ts
// ... (باقي الكود في الأعلى يبقى كما هو)

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isRailway = req.hostname.endsWith(".up.railway.app" );
  const domain = isRailway ? ".up.railway.app" : undefined;

  return {
    httpOnly: true,
    path: "/",
    // الإعداد القياسي لبيئات الـ Proxy
    sameSite: "none",
    secure: true,
    // **السطر الجديد:** تحديد النطاق لضمان عمل الكوكي في النطاق الفرعي لـ Railway
    domain: domain,
  };
}


