import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { UserPlus, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import logoPath from "@assets/1571623_1754368340277.png";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: async (data) => {
      // Store token in localStorage directly 
      localStorage.setItem('auth_token', data.token);
      
      toast({
        title: "Регистрация успешна",
        description: `Добро пожаловать в систему, ${data.user.username}! Роль: ${data.user.role}`
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Ошибка регистрации";
      setErrors([errorMessage]);
      toast({
        title: "Ошибка регистрации",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) {
      newErrors.push("Имя пользователя обязательно");
    } else if (formData.username.length < 3) {
      newErrors.push("Имя пользователя должно содержать минимум 3 символа");
    }

    if (!formData.password) {
      newErrors.push("Пароль обязателен");
    } else if (formData.password.length < 6) {
      newErrors.push("Пароль должен содержать минимум 6 символов");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Пароли не совпадают");
    }



    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      username: formData.username.trim(),
      password: formData.password
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-lg p-2">
              <img 
                src={logoPath} 
                alt="ХРОМ-KZ" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Регистрация</h1>
            <p className="text-gray-600 mt-2">
              Создание нового пользователя в системе ХРОМ-KZ
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Внимание:</strong> Роли назначаются администратором после регистрации.
                По умолчанию новые пользователи получают роль "Сотрудник".
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Новый пользователь</span>
            </CardTitle>
            <CardDescription>
              Заполните форму для создания учетной записи
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="h-11"
                  autoComplete="username"
                />
                <p className="text-xs text-muted-foreground">
                  Минимум 3 символа, используется для входа в систему
                </p>
              </div>



              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Минимум 6 символов
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Повторите пароль"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Создание аккаунта...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Создать аккаунт
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="text-center space-y-3">
          <div className="text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Войти в систему
            </Link>
          </div>
          
          <div className="pt-2">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Вернуться на главную
            </Link>
          </div>
        </div>

        {/* Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-blue-900">Информация о ролях</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Сотрудник:</strong> Создание заявок, просмотр своих заявок</p>
                <p><strong>Менеджер:</strong> Управление всеми заявками, отчеты, настройки</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}