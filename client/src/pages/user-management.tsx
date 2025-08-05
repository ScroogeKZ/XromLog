import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, UserCheck, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  username: string;
  role: 'employee' | 'manager';
  createdAt: string;
}

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'employee' | 'manager'>('employee');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: 'employee' | 'manager' }) => {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно изменена",
      });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: newRole,
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Менеджер</Badge>;
      case 'employee':
        return <Badge variant="secondary">Сотрудник</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getRoleStats = () => {
    if (!users) return { managers: 0, employees: 0, total: 0 };
    
    const managers = users.filter(user => user.role === 'manager').length;
    const employees = users.filter(user => user.role === 'employee').length;
    
    return { managers, employees, total: users.length };
  };

  const stats = getRoleStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Загрузка пользователей...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Управление пользователями
          </h1>
          <p className="text-gray-600">
            Управление ролями и правами доступа пользователей системы ХРОМ-KZ
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-600 mt-1">Активных аккаунтов</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Менеджеры</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.managers}</div>
            <p className="text-xs text-purple-600 mt-1">Полный доступ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Сотрудники</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.employees}</div>
            <p className="text-xs text-green-600 mt-1">Базовый доступ</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="glass-card card-shadow overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Список пользователей</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Имя пользователя</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{user.username}</div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                              }}
                            >
                              Изменить роль
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                                Изменить роль пользователя
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы изменяете роль пользователя <strong>{selectedUser?.username}</strong>.
                                Это повлияет на его права доступа в системе.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            
                            <div className="py-4">
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Новая роль:
                              </label>
                              <Select value={newRole} onValueChange={(value: 'employee' | 'manager') => setNewRole(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employee">Сотрудник</SelectItem>
                                  <SelectItem value="manager">Менеджер</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Права доступа:</h4>
                                {newRole === 'manager' ? (
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Полный доступ ко всем функциям</li>
                                    <li>• Управление заявками всех пользователей</li>
                                    <li>• Доступ к аналитике и отчетам</li>
                                    <li>• Управление транспортом и календарем</li>
                                    <li>• Настройки Telegram уведомлений</li>
                                  </ul>
                                ) : (
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Создание и просмотр только своих заявок</li>
                                    <li>• Базовая статистика по своим заявкам</li>
                                    <li>• Ограниченный доступ к системе</li>
                                  </ul>
                                )}
                              </div>
                            </div>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleRoleUpdate}
                                disabled={updateRoleMutation.isPending}
                              >
                                {updateRoleMutation.isPending ? "Сохранение..." : "Сохранить"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}