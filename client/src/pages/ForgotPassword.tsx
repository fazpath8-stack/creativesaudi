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

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success(t("common.success"));
      // In production, user would receive email with token
      // For demo, we'll use the returned token
      if (data.token) {
        setToken(data.token);
      }
      setStep("reset");
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      setLocation("/login");
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    requestResetMutation.mutate({ email });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("auth.reset.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "email"
              ? "Enter your email to receive reset instructions"
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
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
              <Button
                type="submit"
                className="w-full"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common.submit")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.reset.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("auth.reset.submit")}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setLocation("/login")}>
              {t("common.back")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
