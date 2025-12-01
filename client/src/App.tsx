import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ClientDashboard from "./pages/ClientDashboard";
import ServiceDetail from "./pages/ServiceDetail";
import OrderDetail from "./pages/OrderDetail";
import DesignerDashboard from "./pages/DesignerDashboard";
import DesignerOrderDetail from "./pages/DesignerOrderDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Client Routes */}
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client/service/:id" component={ServiceDetail} />
      <Route path="/client/order/:id" component={OrderDetail} />
      
      {/* Designer Routes */}
      <Route path="/designer/dashboard" component={DesignerDashboard} />
      <Route path="/designer/order/:id" component={DesignerOrderDetail} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
