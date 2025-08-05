import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Truck, 
  LayoutDashboard, 
  Plus, 
  BarChart3, 
  Menu, 
  Bell, 
  Settings, 
  LogOut,
  User as UserIcon,
  List,
  Calendar,
  MessageCircle,
  Package
} from "lucide-react";
import logoPath from "@assets/1571623_1754368340277.png";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    };
    
    loadUser();
  }, []);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из корпоративной системы"
    });
  };

  const getNavigation = () => {
    const baseNavigation = [
      {
        name: "Дашборд",
        href: "/dashboard",
        icon: LayoutDashboard,
        current: location === "/dashboard" || location === "/",
        roles: ["employee", "manager"]
      },
      {
        name: user?.role === "employee" ? "Мои заявки" : "Все заявки",
        href: user?.role === "employee" ? "/my-orders" : "/requests",
        icon: user?.role === "employee" ? Package : List,
        current: location === "/requests" || location === "/my-orders",
        roles: ["employee", "manager"]
      },
      {
        name: "Создать заявку",
        href: "/create-request",
        icon: Plus,
        current: location === "/create-request",
        roles: ["employee", "manager"]
      }
    ];

    const managerOnlyNavigation = [
      {
        name: "Календарь отгрузок",
        href: "/calendar",
        icon: Calendar,
        current: location === "/calendar",
        roles: ["manager"]
      },
      {
        name: "Транспорт",
        href: "/transport",
        icon: Truck,
        current: location === "/transport",
        roles: ["manager"]
      },
      {
        name: "Отчеты",
        href: "/reports", 
        icon: BarChart3,
        current: location === "/reports",
        roles: ["manager"]
      },
      {
        name: "Telegram",
        href: "/telegram",
        icon: MessageCircle,
        current: location === "/telegram",
        roles: ["manager"]
      }
    ];

    const userRole = user?.role || "employee";
    const allNavigation = [...baseNavigation, ...managerOnlyNavigation];
    
    return allNavigation.filter(item => item.roles.includes(userRole));
  };

  const navigation = getNavigation();

  const getPageTitle = () => {
    switch (location) {
      case "/dashboard":
      case "/":
        return "Панель управления";
      case "/requests":
        return "Управление заявками";
      case "/my-orders":
        return "Мои заявки";
      case "/create-request":
        return "Новая заявка";
      case "/calendar":
        return "Календарь отгрузок";
      case "/transport":
        return "Управление транспортом";
      case "/reports":
        return "Отчеты и аналитика";
      case "/telegram":
        return "Настройки Telegram";
      default:
        if (location.startsWith("/request/")) {
          return "Детали заявки";
        }
        return "Корпоративная система";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-border card-shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-lg p-1">
              <img 
                src={logoPath} 
                alt="ХРОМ-KZ" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">ХРОМ-KZ</h1>
              <p className="text-xs text-muted-foreground">Корпоративная система</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover-lift",
              item.current
                ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}>
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.username || "Пользователь"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === "manager" ? "Менеджер" : "Сотрудник"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="glass-card card-shadow px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-medium text-gray-900">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
