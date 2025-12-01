import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Clock, Globe, Moon, Sun } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data: services } = trpc.services.list.useQuery();

  const features = [
    {
      icon: Sparkles,
      title: t("landing.feature1.title"),
      description: t("landing.feature1.desc"),
    },
    {
      icon: Zap,
      title: t("landing.feature2.title"),
      description: t("landing.feature2.desc"),
    },
    {
      icon: Clock,
      title: t("landing.feature3.title"),
      description: t("landing.feature3.desc"),
    },
  ];

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
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="outline" onClick={() => setLocation("/login")}>
              {t("nav.login")}
            </Button>
            <Button onClick={() => setLocation("/register")}>
              {t("nav.register")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            {t("landing.subtitle")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landing.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => setLocation("/register")}
            >
              {t("landing.cta.client")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => setLocation("/register")}
            >
              {t("landing.cta.designer")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 bg-gradient-to-b from-transparent to-muted/50">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t("landing.features.title")}
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="container py-20">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t("landing.services.title")}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services?.slice(0, 8).map((service) => (
            <Card
              key={service.id}
              className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 cursor-pointer"
              onClick={() => setLocation("/register")}
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? service.nameAr : service.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {language === "ar" ? service.descriptionAr : service.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {(service.price / 100).toFixed(0)} {t("services.sar")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" onClick={() => setLocation("/register")}>
            {t("nav.register")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-20">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 CreativeSaudi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
