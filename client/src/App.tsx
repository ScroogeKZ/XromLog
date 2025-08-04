import { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "./lib/auth";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import CreateRequest from "@/pages/create-request";
import RequestDetails from "@/pages/request-details";
import Reports from "@/pages/reports";
import PublicRequest from "@/pages/public-request";
import NotFound from "@/pages/not-found";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await auth.getCurrentUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
  }, []);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/public" component={PublicRequest} />
      
      {/* Admin routes - require authentication */}
      <Route path="/login" component={Login} />
      
      <Route path="/">
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
      
      <Route path="/dashboard">
        {isAuthenticated ? <Dashboard /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/create-request">
        {isAuthenticated ? <CreateRequest /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/request/:id">
        {isAuthenticated ? <RequestDetails /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/reports">
        {isAuthenticated ? <Reports /> : <Redirect to="/login" />}
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
