import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Package, 
  Calendar, 
  MapPin, 
  Eye,
  Filter
} from "lucide-react";
import { StatusChip } from "@/components/status-chip";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ShipmentRequest {
  id: number;
  requestNumber: string;
  category: string;
  status: string;
  cargoName: string;
  cargoWeightKg?: string;
  cargoVolumeM3?: string;
  loadingAddress: string;
  unloadingAddress: string;
  loadingCity?: string;
  unloadingCity?: string;
  createdAt: string;
  desiredShipmentDatetime?: string;
  priceKzt?: string;
}

export default function MyOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: requestsData, isLoading } = useQuery<{ requests: ShipmentRequest[] }>({
    queryKey: ['/api/my-requests'],
  });

  const requests = requestsData?.requests || [];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === "" || 
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cargoName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'Новая',
      'processing': 'В обработке',
      'assigned': 'Назначена',
      'transit': 'В пути',
      'delivered': 'Доставлена',
      'cancelled': 'Отменена'
    };
    return statusMap[status] || status;
  };

  const getCategoryText = (category: string) => {
    return category === 'astana' ? 'Астана' : 'Межгород';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мои заявки</h1>
            <p className="text-muted-foreground">Личный кабинет сотрудника</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Фильтры</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по номеру заявки или грузу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Все статусы</option>
                  <option value="new">Новые</option>
                  <option value="processing">В обработке</option>
                  <option value="assigned">Назначенные</option>
                  <option value="transit">В пути</option>
                  <option value="delivered">Доставленные</option>
                  <option value="cancelled">Отмененные</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-muted-foreground">Всего заявок</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => ['new', 'processing'].includes(r.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">В работе</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {requests.filter(r => ['assigned', 'transit'].includes(r.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">В доставке</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'delivered').length}
              </div>
              <p className="text-xs text-muted-foreground">Доставлено</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    {searchTerm || statusFilter ? "Заявки не найдены" : "У вас пока нет заявок"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchTerm || statusFilter 
                      ? "Попробуйте изменить критерии поиска" 
                      : "Создайте новую заявку для начала работы"
                    }
                  </p>
                  {!searchTerm && !statusFilter && (
                    <Button asChild className="mt-4">
                      <Link href="/create-request">Создать заявку</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{request.requestNumber}</CardTitle>
                      <Badge variant="outline">{getCategoryText(request.category)}</Badge>
                      <StatusChip status={request.status} />
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/request/${request.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Просмотр
                      </Link>
                    </Button>
                  </div>
                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(request.createdAt), "dd MMM yyyy", { locale: ru })}</span>
                    </span>
                    {request.desiredShipmentDatetime && (
                      <span className="flex items-center space-x-1 text-blue-600">
                        <Calendar className="w-4 h-4" />
                        <span>Желаемая: {format(new Date(request.desiredShipmentDatetime), "dd MMM yyyy", { locale: ru })}</span>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">{request.cargoName}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        {request.cargoWeightKg && (
                          <span>Вес: {request.cargoWeightKg} кг</span>
                        )}
                        {request.cargoVolumeM3 && (
                          <span>Объем: {request.cargoVolumeM3} м³</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium">Загрузка</div>
                            <div className="text-muted-foreground">
                              {request.loadingCity && `${request.loadingCity}, `}
                              {request.loadingAddress}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium">Выгрузка</div>
                            <div className="text-muted-foreground">
                              {request.unloadingCity && `${request.unloadingCity}, `}
                              {request.unloadingAddress}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.priceKzt && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Стоимость:</span>
                          <span className="font-medium text-lg text-green-600">
                            {parseInt(request.priceKzt).toLocaleString()} ₸
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}