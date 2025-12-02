import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils(); // <--- يجب إضافة هذا السطر

  const loginMutation = trpc.auth.login.useMutation({
        // حوالي السطر 20
  onSuccess: async (data) => {
    toast.success(t("common.success"));
    
    // Update the auth.me cache manually to avoid refetch
    utils.auth.me.setData(undefined, data.user);
    
    // **السطر الجديد:** إضافة تأخير بسيط لضمان حفظ الكوكي قبل التوجيه
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
    // Then redirect without page reload
    if (data.user.userType === "designer") {
      setLocation("/designer/dashboard");
    } else {
      setLocation("/client/dashboard");
    }
  },
,


    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("auth.login.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("landing.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("auth.email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("auth.password")}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0 text-primary"
                onClick={() => setLocation("/forgot-password")}
              >
                {t("auth.forgotPassword")}
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("auth.submit")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t("auth.noAccount")}{" "}
            <Button
              variant="link"
              className="px-0 text-primary"
              onClick={() => setLocation("/register")}
            >
              {t("auth.registerNow")}
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
            >
              {t("common.back")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
