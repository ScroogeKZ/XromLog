import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  Search,
  Plus
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
    status: "",
    category: "",
    search: "",
    page: 1,
    limit: 10
  });
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/shipment-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
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

  const statsCards = [
    {
      title: "Всего заявок",
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => (
          <Card key={card.title} className="hover-lift card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {statsLoading ? (
                      <div className="animate-pulse bg-accent rounded w-16 h-8"></div>
                    ) : (
                      card.value
                    )}
                  </p>
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
                  <SelectItem value="">Все статусы</SelectItem>
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
                  <SelectItem value="">Все категории</SelectItem>
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

      {/* Requests Table */}
      <Card className="glass-card card-shadow overflow-hidden">
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
