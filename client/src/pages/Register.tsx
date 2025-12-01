import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [userType, setUserType] = useState<"client" | "designer">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSoftware, setSelectedSoftware] = useState<number[]>([]);

  const { data: softwareList } = trpc.software.list.useQuery();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      setLocation("/login");
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (userType === "designer" && selectedSoftware.length === 0) {
      toast.error("Please select at least one software");
      return;
    }

    registerMutation.mutate({
      email,
      password,
      userType,
      firstName: userType === "client" ? firstName : undefined,
      lastName: userType === "client" ? lastName : undefined,
      username: userType === "designer" ? username : undefined,
      phoneNumber,
      softwareIds: userType === "designer" ? selectedSoftware : undefined,
    });
  };

  const toggleSoftware = (id: number) => {
    setSelectedSoftware((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("auth.register.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("landing.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label>{t("auth.userType")}</Label>
              <RadioGroup value={userType} onValueChange={(v) => setUserType(v as "client" | "designer")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="cursor-pointer">
                    {t("auth.userType.client")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="designer" id="designer" />
                  <Label htmlFor="designer" className="cursor-pointer">
                    {t("auth.userType.designer")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Client Fields */}
            {userType === "client" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Designer Fields */}
            {userType === "designer" && (
              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t("auth.phoneNumber")}</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            {/* Designer Software Selection */}
            {userType === "designer" && softwareList && (
              <div className="space-y-2">
                <Label>{t("auth.software")}</Label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border rounded-md">
                  {softwareList.map((software) => (
                    <div key={software.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`software-${software.id}`}
                        checked={selectedSoftware.includes(software.id)}
                        onCheckedChange={() => toggleSoftware(software.id)}
                      />
                      <Label
                        htmlFor={`software-${software.id}`}
                        className="cursor-pointer text-sm"
                      >
                        {language === "ar" ? software.nameAr : software.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("auth.submit")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {t("auth.hasAccount")}{" "}
            <Button
              variant="link"
              className="px-0 text-primary"
              onClick={() => setLocation("/login")}
            >
              {t("auth.loginNow")}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setLocation("/")}>
              {t("common.back")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
