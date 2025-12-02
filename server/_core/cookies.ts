import type { CookieOptions, Request } from "express";

// لا حاجة لـ LOCAL_HOSTS أو isIpAddress أو isSecureRequest
// سنقوم بتبسيط الدالة لتعيين إعدادات متساهلة

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // إعدادات متساهلة جداً لضمان عمل الكوكي في أي بيئة
  // **تحذير: هذه الإعدادات غير آمنة للاستخدام في بيئة إنتاج حقيقية**
  return {
    httpOnly: true,
    path: "/",
    // تعيين sameSite إلى 'lax' أو 'none' مع secure: true هو الإعداد القياسي
    // لكن لضمان العمل في بيئة العرض، سنستخدم إعدادات تسمح بالمرور
    sameSite: "lax", // 'lax' أكثر تساهلاً من 'strict'
    secure: false, // **تعطيل الأمان (HTTPS ) لضمان عمل الكوكي في أي حالة**
    domain: undefined, // السماح للمتصفح بتعيين النطاق تلقائياً
  };
}
