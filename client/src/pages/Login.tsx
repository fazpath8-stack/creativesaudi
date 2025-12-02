import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = trpc.auth.login.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      toast.success(t("common.success"));
      
      // **التعديل لحفظ الـ Token يدوياً**
      // يجب أن يكون data من النوع الذي يحتوي على sessionToken
      if (data && 'sessionToken' in data && data.sessionToken) {
        localStorage.setItem("sessionToken", data.sessionToken);
      }

      // Update the auth.me cache manually to avoid refetch
      utils.auth.me.setData(undefined, data.user);
      
      // Then redirect with full page reload
      if (data.user.userType === "designer") {
        window.location.href = "/designer/dashboard";
      } else {
        window.location.href = "/client/dashboard";
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  {t("login.forgot_password")}
                </Link>
              </div>
              <Input id="password" type="password" required {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("login.sign_in")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t("login.no_account")}{" "}
            <Link href="/register" className="underline">
              {t("login.sign_up")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
