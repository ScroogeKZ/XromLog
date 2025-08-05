import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfileSchema, type UpdateUserProfile, changePasswordSchema, type ChangePassword } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

interface User {
  id: number;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  age?: number;
  phone?: string;
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userResponse } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
  });

  const user = userResponse?.user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      position: user?.position || "",
      age: user?.age || 18,
      phone: user?.phone || "",
    },
  });

  // Reset form when user data loads
  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        position: user.position || "",
        age: user.age || 18,
        phone: user.phone || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Профиль обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate(data);
  };

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePassword) => {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Пароль изменен",
      });
      resetPassword();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: ChangePassword) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Профиль сотрудника</h1>
        <p className="text-muted-foreground">
          Управляйте своими личными данными и настройками аккаунта
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Личные данные</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>
                Обновите свои данные. Эта информация будет использоваться в системе.
              </CardDescription>
            </CardHeader>
            <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  placeholder="Введите имя"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  placeholder="Введите фамилию"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Должность *</Label>
              <Input
                id="position"
                placeholder="Введите должность"
                {...register("position")}
              />
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Возраст *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Введите возраст"
                  {...register("age", { valueAsNumber: true })}
                />
                {errors.age && (
                  <p className="text-sm text-red-500">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона *</Label>
                <Input
                  id="phone"
                  placeholder="+7 (___) ___-__-__"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Информация аккаунта</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Имя пользователя: </span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Роль: </span>
                  <span className="font-medium">
                    {user.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
              >
                Отменить
              </Button>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </div>
          </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Изменение пароля</CardTitle>
              <CardDescription>
                Обновите пароль для входа в систему. Используйте надежный пароль.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Введите текущий пароль"
                    {...registerPassword("currentPassword")}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Введите новый пароль (минимум 6 символов)"
                    {...registerPassword("newPassword")}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Повторите новый пароль"
                    {...registerPassword("confirmPassword")}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Требования к паролю
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Минимум 6 символов</li>
                          <li>Рекомендуется использовать буквы, цифры и специальные символы</li>
                          <li>Не используйте простые или очевидные пароли</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetPassword()}
                  >
                    Отменить
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? "Изменение..." : "Изменить пароль"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}