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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-md w-full">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="w-24 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <img 
              src={logoPath} 
              alt="ХРОМ-KZ" 
              className="w-full h-full object-contain p-3 brightness-0 invert"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Добро пожаловать
          </h2>
          <p className="text-blue-100 text-lg">
            Система управления логистикой
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-white font-medium mb-2 block">
                Имя пользователя
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Введите имя пользователя"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white font-medium mb-2 block">
                Пароль
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 h-12"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-3 h-12 text-lg shadow-xl transition-all duration-300 hover:shadow-2xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Входим в систему...</span>
                </div>
              ) : (
                "Войти в систему"
              )}
            </Button>
          </form>
        </div>

        {/* Navigation Links */}
        <div className="text-center space-y-4 mt-8">
          <div className="text-white/80">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-white font-semibold hover:text-blue-200 transition-colors">
              Зарегистрироваться
            </Link>
          </div>
          
          <div>
            <Link href="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
