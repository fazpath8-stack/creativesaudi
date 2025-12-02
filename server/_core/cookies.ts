import type { CookieOptions, Request } from "express";

// هذا الكود يتجاهل جميع إعدادات الأمان لضمان عمل الكوكي في أي بيئة
// **تحذير: هذا الكود غير آمن للاستخدام في بيئة إنتاج حقيقية**

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    // إعدادات متساهلة جداً:
    sameSite: "lax", // أو 'none' إذا لم يعمل 'lax'
    secure: false, // **تعطيل الأمان (HTTPS ) لضمان عمل الكوكي في أي حالة**
    domain: undefined, // السماح للمتصفح بتعيين النطاق تلقائياً
  };
}
