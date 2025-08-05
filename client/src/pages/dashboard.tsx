import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  Search,
  Plus,
  BarChart3,
  ArrowDownToLine,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  Bell,
  AlertTriangle,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    status: "all",
    category: "all", 
    search: "",
    page: 1,
    limit: 10
  });
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/shipment-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/shipment-requests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    }
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const isEmployee = user?.role === 'employee';
  
  const statsCards = [
    {
      title: isEmployee ? "Мои заявки" : "Всего заявок",
      value: (stats as any)?.total || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "В обработке", 
      value: (stats as any)?.processing || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "В пути",
      value: (stats as any)?.transit || 0,
      icon: Truck,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Доставлено",
      value: (stats as any)?.delivered || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <Layout>
      {/* Header with personalized greeting */}
      {user && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Добро пожаловать, {user.username}!
            </h1>
            <p className="text-gray-600">
              {isEmployee 
                ? "Здесь отображается статистика по вашим заявкам на доставку." 
                : "Обзор всех операций логистической системы ХРОМ-KZ."
              }
            </p>
            {isEmployee && (
              <div className="mt-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Роль: Сотрудник
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => (
          <Card key={card.title} className="hover-lift card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                  <div className="text-3xl font-bold text-foreground mt-2">
                    {statsLoading ? (
                      <div className="animate-pulse bg-accent rounded w-16 h-8"></div>
                    ) : (
                      card.value
                    )}
                  </div>
                </div>
                <div className={`w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 glass-card card-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по номеру, адресу или грузу..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="new">Новая</SelectItem>
                  <SelectItem value="processing">В обработке</SelectItem>
                  <SelectItem value="assigned">Назначен транспорт</SelectItem>
                  <SelectItem value="transit">В пути</SelectItem>
                  <SelectItem value="delivered">Доставлен</SelectItem>
                  <SelectItem value="cancelled">Отменен</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="astana">Астана</SelectItem>
                  <SelectItem value="intercity">Междугородний</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Link href="/create-request">
              <Button className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>Новая заявка</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <Card className="glass-card card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Последние действия</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Новая заявка AST-2025-001</p>
                  <p className="text-xs text-muted-foreground">2 часа назад</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Обновлен статус INT-2025-005</p>
                  <p className="text-xs text-muted-foreground">4 часа назад</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Назначен транспорт AST-2025-003</p>
                  <p className="text-xs text-muted-foreground">6 часов назад</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="glass-card card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Показатели эффективности</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Среднее время обработки</span>
                <span className="text-sm font-bold text-primary">2.4 часа</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Успешных доставок</span>
                <span className="text-sm font-bold text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Заявок сегодня</span>
                <span className="text-sm font-bold text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Активных водителей</span>
                <span className="text-sm font-bold text-orange-600">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Section */}
      <Card className="glass-card card-shadow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowDownToLine className="w-5 h-5" />
            <span>Быстрый экспорт</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Заявки за день</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Отчет по водителям</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Статистика месяца</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Планировщик</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Важные уведомления</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Срочная заявка требует внимания</p>
                    <p className="text-xs text-red-600">AST-2025-007 - клиент ждет уже 3 часа</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">ТС требует техосмотра</p>
                    <p className="text-xs text-yellow-600">789 GHI 02 - плановое ТО через 3 дня</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Новый водитель добавлен</p>
                    <p className="text-xs text-blue-600">Успешно прошел все проверки</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <div>
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Цели месяца</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Обработано заявок</span>
                    <span>245/300</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Успешных доставок</span>
                    <span>98.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Время обработки</span>
                    <span>2.4ч / 3ч</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="glass-card card-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Заявки на доставку</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Заявки</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Груз</TableHead>
                  <TableHead>Маршрут</TableHead>
                  <TableHead>Дата создания</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : requestsData?.requests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Заявки не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  requestsData?.requests?.map((request: any) => (
                    <TableRow 
                      key={request.id} 
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <Link href={`/request/${request.id}`}>
                          <span className="text-primary font-medium hover:underline">
                            {request.requestNumber}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={request.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {request.category === 'astana' ? 'Астана' : 'Междугородний'}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.cargoName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 truncate max-w-48">
                            {request.loadingAddress}
                          </div>
                          <div className="text-gray-500 truncate max-w-48">
                            → {request.unloadingAddress}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {requestsData?.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Показано {((filters.page - 1) * filters.limit) + 1}-
                {Math.min(filters.page * filters.limit, requestsData.total)} из {requestsData.total} заявок
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                >
                  Предыдущая
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page * filters.limit >= requestsData.total}
                  onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                >
                  Следующая
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
