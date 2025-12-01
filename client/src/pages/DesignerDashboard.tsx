import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Moon, Sun, LogOut, User, Briefcase, Inbox } from "lucide-react";
import { toast } from "sonner";

export default function DesignerDashboard() {
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: pendingOrders, refetch: refetchPending } = trpc.orders.pending.useQuery();
  const { data: myOrders, refetch: refetchMy } = trpc.orders.myDesigns.useQuery();

  const acceptOrderMutation = trpc.orders.accept.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      refetchPending();
      refetchMy();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      setLocation("/");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      assigned: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {t(`orders.${status}`)}
      </Badge>
    );
  };

  if (!user || user.userType !== "designer") {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("landing.title")}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {t("common.welcome")}, {user.username || user.name}!
          </h2>
          <p className="text-muted-foreground">{t("designer.dashboard.subtitle")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending">
              <Inbox className="h-4 w-4 mr-2" />
              {t("designer.pendingOrders")}
              {pendingOrders && pendingOrders.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="my-orders">
              <Briefcase className="h-4 w-4 mr-2" />
              {t("designer.myOrders")}
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              {t("profile.title")}
            </TabsTrigger>
          </TabsList>

          {/* Pending Orders Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingOrders && pendingOrders.length > 0 ? (
              <div className="grid gap-4">
                {pendingOrders.map((item) => (
                  <Card
                    key={item.order.id}
                    className="border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {language === "ar" ? item.service?.nameAr : item.service?.name}
                        </CardTitle>
                        {getStatusBadge(item.order.status)}
                      </div>
                      <CardDescription>
                        Client: {item.client?.firstName || item.client?.name} •{" "}
                        {new Date(item.order.createdAt).toLocaleDateString(
                          language === "ar" ? "ar-SA" : "en-US"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Description:</p>
                        <p className="text-sm">{item.order.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {(item.order.price / 100).toFixed(0)} {t("services.sar")}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => acceptOrderMutation.mutate({ orderId: item.order.id })}
                            disabled={acceptOrderMutation.isPending}
                          >
                            {t("designer.accept")}
                          </Button>
                          <Button variant="outline" onClick={() => setLocation(`/designer/order/${item.order.id}`)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">{t("designer.noPendingOrders")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="my-orders" className="space-y-4">
            {myOrders && myOrders.length > 0 ? (
              <div className="grid gap-4">
                {myOrders.map((item) => (
                  <Card
                    key={item.order.id}
                    className="cursor-pointer hover:border-secondary/50 transition-colors"
                    onClick={() => setLocation(`/designer/order/${item.order.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {language === "ar" ? item.service?.nameAr : item.service?.name}
                        </CardTitle>
                        {getStatusBadge(item.order.status)}
                      </div>
                      <CardDescription>
                        Client: {item.client?.firstName || item.client?.name} •{" "}
                        {new Date(item.order.createdAt).toLocaleDateString(
                          language === "ar" ? "ar-SA" : "en-US"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("services.price")}:</span>
                        <span className="text-xl font-bold text-primary">
                          {(item.order.price / 100).toFixed(0)} {t("services.sar")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">{t("orders.noOrders")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("auth.username")}</p>
                  <p className="text-lg">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("auth.email")}</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("auth.phoneNumber")}</p>
                  <p className="text-lg">{user.phoneNumber || "N/A"}</p>
                </div>
                <Button onClick={() => setLocation("/designer/profile/edit")}>
                  {t("profile.edit")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
