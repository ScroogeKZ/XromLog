import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Truck, 
  LayoutDashboard, 
  Plus, 
  BarChart3, 
  Menu, 
  LogOut,
  User as UserIcon,
  List,
  Calendar,
  MessageCircle,
  Package,
  Users
} from "lucide-react";
import logoPath from "@assets/1571623_1754368340277.png";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { NotificationsPanel } from "@/components/notifications-panel";
import { SettingsPanel } from "@/components/settings-panel";

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
        name: "Аналитика",
        href: "/analytics", 
        icon: BarChart3,
        current: location === "/analytics",
        roles: ["manager"]
      },
      {
        name: "Пользователи",
        href: "/users",
        icon: Users,
        current: location === "/users",
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
      case "/analytics":
        return "Аналитика и KPI";
      case "/users":
        return "Управление пользователями";
      case "/profile":
        return "Профиль сотрудника";
      default:
        if (location.startsWith("/request/")) {
          return "Детали заявки";
        }
        return "Корпоративная система";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center p-1">
              <img 
                src={logoPath} 
                alt="ХРОМ-KZ" 
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ХРОМ-KZ</h1>
              <p className="text-xs text-blue-100">Логистическая система</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-md",
              item.current
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-blue-50"
            )}>
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Link 
            href="/profile"
            className={cn(
              "flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 mb-3 hover:shadow-md",
              location === "/profile" ? "bg-blue-100 text-blue-900" : "hover:bg-white"
            )}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || "Пользователь"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === "manager" ? "Менеджер логистики" : "Сотрудник"}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти из системы
          </Button>
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
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500">ХРОМ-KZ Логистическая система</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationsPanel />
            <SettingsPanel />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
