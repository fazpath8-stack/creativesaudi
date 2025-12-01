import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.about": "من نحن",
    "nav.login": "تسجيل الدخول",
    "nav.register": "إنشاء حساب",
    "nav.dashboard": "لوحة التحكم",
    "nav.logout": "تسجيل الخروج",
    
    // Landing Page
    "landing.title": "CreativeSaudi",
    "landing.subtitle": "منصتك الأولى لخدمات التصميم الاحترافية",
    "landing.description": "نربط بين العملاء والمصممين المحترفين لتقديم أفضل خدمات التصميم في المملكة العربية السعودية",
    "landing.cta.client": "ابدأ كعميل",
    "landing.cta.designer": "انضم كمصمم",
    "landing.features.title": "لماذا CreativeSaudi؟",
    "landing.feature1.title": "مصممون محترفون",
    "landing.feature1.desc": "نخبة من المصممين المحترفين في مختلف المجالات",
    "landing.feature2.title": "أسعار تنافسية",
    "landing.feature2.desc": "أسعار عادلة ومنافسة لجميع الخدمات",
    "landing.feature3.title": "تسليم سريع",
    "landing.feature3.desc": "نضمن تسليم مشاريعك في الوقت المحدد",
    "landing.services.title": "خدماتنا",
    
    // Auth
    "auth.login.title": "تسجيل الدخول",
    "auth.register.title": "إنشاء حساب جديد",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.firstName": "الاسم الأول",
    "auth.lastName": "الاسم الأخير",
    "auth.username": "اسم المستخدم",
    "auth.phoneNumber": "رقم الجوال",
    "auth.userType": "نوع الحساب",
    "auth.userType.client": "عميل",
    "auth.userType.designer": "مصمم",
    "auth.software": "البرامج التي تتقنها",
    "auth.forgotPassword": "نسيت كلمة المرور؟",
    "auth.noAccount": "ليس لديك حساب؟",
    "auth.hasAccount": "لديك حساب بالفعل؟",
    "auth.registerNow": "سجل الآن",
    "auth.loginNow": "سجل دخول",
    "auth.submit": "تسجيل",
    "auth.reset.title": "إعادة تعيين كلمة المرور",
    "auth.reset.newPassword": "كلمة المرور الجديدة",
    "auth.reset.submit": "إعادة تعيين",
    
    // Services
    "services.title": "الخدمات المتاحة",
    "services.price": "السعر",
    "services.sar": "ريال",
    "services.orderNow": "اطلب الآن",
    "services.details": "تفاصيل الخدمة",
    
    // Orders
    "orders.myOrders": "طلباتي",
    "orders.pending": "قيد الانتظار",
    "orders.assigned": "تم التعيين",
    "orders.inProgress": "قيد التنفيذ",
    "orders.completed": "مكتمل",
    "orders.cancelled": "ملغي",
    "orders.create": "إنشاء طلب",
    "orders.description": "وصف الطلب",
    "orders.uploadFiles": "رفع الملفات",
    "orders.submit": "إرسال الطلب",
    
    // Payment
    "payment.title": "الدفع",
    "payment.cardHolder": "اسم حامل البطاقة",
    "payment.cardNumber": "رقم البطاقة",
    "payment.expiry": "تاريخ الانتهاء",
    "payment.cvv": "CVV",
    "payment.total": "المجموع",
    "payment.pay": "ادفع الآن",
    "payment.simulation": "هذا دفع وهمي للعرض فقط",
    
    // Profile
    "profile.title": "الملف الشخصي",
    "profile.edit": "تعديل الملف الشخصي",
    "profile.paymentMethods": "طرق الدفع",
    "profile.addPayment": "إضافة طريقة دفع",
    
    // Designer
    "designer.pendingOrders": "الطلبات المعلقة",
    "designer.myOrders": "طلباتي",
    "designer.accept": "قبول",
    "designer.reject": "رفض",
    "designer.uploadResult": "رفع النتيجة",
    "designer.messages": "الرسائل",
    "designer.sendMessage": "إرسال رسالة",
    
    // Common
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.back": "رجوع",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "تمت العملية بنجاح",
    "common.welcome": "مرحباً",
    
    // Client Dashboard
    "client.dashboard.subtitle": "اختر خدمة أو تابع طلباتك",
    "orders.noOrders": "لا توجد طلبات حالياً",
    "payment.manage.description": "أضف وإدارة طرق الدفع الخاصة بك",
    
    // Designer Dashboard
    "designer.dashboard.subtitle": "إدارة الطلبات والتواصل مع العملاء",
    "designer.noPendingOrders": "لا توجد طلبات معلقة",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.about": "About",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",
    
    // Landing Page
    "landing.title": "CreativeSaudi",
    "landing.subtitle": "Your Premier Platform for Professional Design Services",
    "landing.description": "Connecting clients with professional designers to deliver the best design services in Saudi Arabia",
    "landing.cta.client": "Start as Client",
    "landing.cta.designer": "Join as Designer",
    "landing.features.title": "Why CreativeSaudi?",
    "landing.feature1.title": "Professional Designers",
    "landing.feature1.desc": "Elite professional designers in various fields",
    "landing.feature2.title": "Competitive Prices",
    "landing.feature2.desc": "Fair and competitive prices for all services",
    "landing.feature3.title": "Fast Delivery",
    "landing.feature3.desc": "We guarantee timely delivery of your projects",
    "landing.services.title": "Our Services",
    
    // Auth
    "auth.login.title": "Login",
    "auth.register.title": "Create New Account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.firstName": "First Name",
    "auth.lastName": "Last Name",
    "auth.username": "Username",
    "auth.phoneNumber": "Phone Number",
    "auth.userType": "Account Type",
    "auth.userType.client": "Client",
    "auth.userType.designer": "Designer",
    "auth.software": "Software You Master",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.registerNow": "Register Now",
    "auth.loginNow": "Login",
    "auth.submit": "Submit",
    "auth.reset.title": "Reset Password",
    "auth.reset.newPassword": "New Password",
    "auth.reset.submit": "Reset",
    
    // Services
    "services.title": "Available Services",
    "services.price": "Price",
    "services.sar": "SAR",
    "services.orderNow": "Order Now",
    "services.details": "Service Details",
    
    // Orders
    "orders.myOrders": "My Orders",
    "orders.pending": "Pending",
    "orders.assigned": "Assigned",
    "orders.inProgress": "In Progress",
    "orders.completed": "Completed",
    "orders.cancelled": "Cancelled",
    "orders.create": "Create Order",
    "orders.description": "Order Description",
    "orders.uploadFiles": "Upload Files",
    "orders.submit": "Submit Order",
    
    // Payment
    "payment.title": "Payment",
    "payment.cardHolder": "Card Holder Name",
    "payment.cardNumber": "Card Number",
    "payment.expiry": "Expiry Date",
    "payment.cvv": "CVV",
    "payment.total": "Total",
    "payment.pay": "Pay Now",
    "payment.simulation": "This is a mock payment for demonstration only",
    
    // Profile
    "profile.title": "Profile",
    "profile.edit": "Edit Profile",
    "profile.paymentMethods": "Payment Methods",
    "profile.addPayment": "Add Payment Method",
    
    // Designer
    "designer.pendingOrders": "Pending Orders",
    "designer.myOrders": "My Orders",
    "designer.accept": "Accept",
    "designer.reject": "Reject",
    "designer.uploadResult": "Upload Result",
    "designer.messages": "Messages",
    "designer.sendMessage": "Send Message",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Operation completed successfully",
    "common.welcome": "Welcome",
    
    // Client Dashboard
    "client.dashboard.subtitle": "Choose a service or track your orders",
    "orders.noOrders": "No orders yet",
    "payment.manage.description": "Add and manage your payment methods",
    
    // Designer Dashboard
    "designer.dashboard.subtitle": "Manage orders and communicate with clients",
    "designer.noPendingOrders": "No pending orders",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
