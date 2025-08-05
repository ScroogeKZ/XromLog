import { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "./lib/auth";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CreateRequest from "@/pages/create-request";
import RequestsManagement from "@/pages/requests-management";
import CreateOrder from "@/pages/create-order";
import TrackOrder from "@/pages/track-order";
import RequestDetails from "@/pages/request-details";
import Reports from "@/pages/reports";
import TransportManagement from "@/pages/transport-management";
import PublicRequest from "@/pages/public-request";
import Calendar from "@/pages/calendar";
import TelegramSettings from "@/pages/telegram-settings";
import MyOrders from "@/pages/my-orders";
import MyDeliveries from "@/pages/my-deliveries";
import NotFound from "@/pages/not-found";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      const user = await auth.getCurrentUser();
      console.log("Authentication result:", !!user, user);
      setIsAuthenticated(!!user);
    };
    
    checkAuth();

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when focus returns to window
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/create-order/:type" component={CreateOrder} />
      <Route path="/track/:id?" component={TrackOrder} />
      <Route path="/public" component={PublicRequest} />
      
      {/* Admin routes - require authentication */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard">
        {isAuthenticated === null ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Загрузка...</p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <Redirect to="/login" />
        ) : (
          <Dashboard />
        )}
      </Route>
      
      <Route path="/requests">
        {isAuthenticated ? <RequestsManagement /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/create-request">
        {isAuthenticated ? <CreateRequest /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/calendar">
        {isAuthenticated ? <Calendar /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/request/:id">
        {isAuthenticated ? <RequestDetails /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/transport">
        {isAuthenticated ? <TransportManagement /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/reports">
        {isAuthenticated ? <Reports /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/telegram">
        {isAuthenticated ? <TelegramSettings /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/my-orders">
        {isAuthenticated ? <MyOrders /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/my-deliveries">
        <MyDeliveries />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
