import type { CookieOptions, Request } from "express";

// ... (باقي الكود كما هو)

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isProduction = process.env.NODE_ENV === "production";
  
  // نستخدم النطاق الكامل فقط في بيئة الإنتاج
  const domain = isProduction ? req.hostname : undefined; 

  return {
    httpOnly: true,
    path: "/",
    // الإعداد القياسي لبيئات الـ Proxy:
    sameSite: "none", // يجب أن يكون none ليعمل مع CORS
    secure: true, // يجب أن يكون true ليعمل مع sameSite: none
    domain: domain,
  };
}
