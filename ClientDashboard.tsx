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
import { Globe, Moon, Sun, LogOut, User, CreditCard, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("services");

  const { data: services } = trpc.services.list.useQuery();
  const { data: myOrders } = trpc.orders.myOrders.useQuery();

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

  if (!user || user.userType !== "client") {
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
            {t("common.welcome")}, {user.firstName || user.name}!
          </h2>
          <p className="text-muted-foreground">{t("client.dashboard.subtitle")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="services">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t("nav.services")}
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t("orders.myOrders")}
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              {t("profile.title")}
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services?.map((service) => (
                <Card
                  key={service.id}
                  className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === "ar" ? service.nameAr : service.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 min-h-[60px]">
                      {language === "ar" ? service.descriptionAr : service.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {(service.price / 100).toFixed(0)} {t("services.sar")}
                      </span>
                      <Button onClick={() => setLocation(`/client/service/${service.id}`)}>
                        {t("services.orderNow")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {myOrders && myOrders.length > 0 ? (
              <div className="grid gap-4">
                {myOrders.map((item) => (
                  <Card key={item.order.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setLocation(`/client/order/${item.order.id}`)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {language === "ar" ? item.service?.nameAr : item.service?.name}
                        </CardTitle>
                        {getStatusBadge(item.order.status)}
                      </div>
                      <CardDescription>
                        {new Date(item.order.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
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
                  <p className="text-sm text-muted-foreground">{t("auth.firstName")}</p>
                  <p className="text-lg">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("auth.lastName")}</p>
                  <p className="text-lg">{user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("auth.email")}</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("auth.phoneNumber")}</p>
                  <p className="text-lg">{user.phoneNumber || "N/A"}</p>
                </div>
                <Button onClick={() => setLocation("/client/profile/edit")}>
                  {t("profile.edit")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("profile.paymentMethods")}</CardTitle>
                  <Button onClick={() => setLocation("/client/payment/add")}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t("profile.addPayment")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("payment.manage.description")}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
