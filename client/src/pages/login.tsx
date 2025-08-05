import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Truck, ArrowLeft } from "lucide-react";
import logoPath from "@assets/1571623_1754368340277.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login...");
      await auth.login(formData.username, formData.password);
      console.log("Login successful, showing toast...");
      
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать в корпоративную систему"
      });
      
      console.log("Redirecting to dashboard...");
      // Force immediate redirect
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: "Неверное имя пользователя или пароль",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-6 px-3 sm:py-12 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto w-24 h-16 sm:w-32 sm:h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center card-shadow-lg p-2 sm:p-3">
            <img 
              src={logoPath} 
              alt="ХРОМ-KZ" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-foreground">
            ХРОМ-KZ
          </h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Система управления логистикой
          </p>
        </div>

        <Card className="professional-card card-shadow-lg">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Вход в систему</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Введите учетные данные для доступа
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="username" className="text-xs sm:text-sm font-medium">Имя пользователя</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Введите имя пользователя"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm py-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Вход...</span>
                  </div>
                ) : (
                  "Войти в систему"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="text-center space-y-3">
          <div className="text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Зарегистрироваться
            </Link>
          </div>
          
          <div className="pt-2">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
