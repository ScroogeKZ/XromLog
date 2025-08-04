import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";

export default function TrackOrder() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [searchId, setSearchId] = useState(params.id || "");
  const [currentRequestNumber, setCurrentRequestNumber] = useState(params.id || "");

  const { data: shipmentRequest, isLoading, error } = useQuery({
    queryKey: ['/api/shipment-requests', currentRequestNumber],
    queryFn: async () => {
      if (!currentRequestNumber) return null;
      const response = await fetch(`/api/shipment-requests/public/${currentRequestNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Заказ не найден');
        }
        throw new Error('Ошибка загрузки данных');
      }
      return response.json();
    },
    enabled: !!currentRequestNumber
  });

  const handleSearch = () => {
    if (searchId.trim()) {
      setCurrentRequestNumber(searchId.trim());
      setLocation(`/track/${searchId.trim()}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'transit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новая заявка';
      case 'processing': return 'В обработке';
      case 'assigned': return 'Назначен транспорт';
      case 'transit': return 'В пути';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'transit': return <Truck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Хром Логистика</h1>
                <p className="text-gray-600 dark:text-gray-300">Отслеживание заказов</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/login")}>
                Админка
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Отслеживание заказа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search-id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Номер заказа
                </Label>
                <Input
                  id="search-id"
                  placeholder="Например: AST-2024-001 или INT-2024-001"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="mt-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={!searchId.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Найти
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isLoading && currentRequestNumber && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Поиск заказа...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-red-200 dark:border-red-700">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Заказ не найден
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Проверьте правильность номера заказа или свяжитесь с нами для уточнения.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone className="w-4 h-4 mr-2" />
                    +7 (777) 123-45-67
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    info@chromlogistics.kz
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shipmentRequest && (
          <div className="space-y-6">
            {/* Order Status */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Заказ {shipmentRequest.requestNumber}
                  </CardTitle>
                  <Badge className={getStatusColor(shipmentRequest.status)}>
                    {getStatusIcon(shipmentRequest.status)}
                    <span className="ml-1">{getStatusText(shipmentRequest.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Информация о грузе</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Наименование:</span> {shipmentRequest.cargoName}</p>
                      {shipmentRequest.cargoWeightKg && (
                        <p><span className="text-gray-500">Вес:</span> {shipmentRequest.cargoWeightKg} кг</p>
                      )}
                      {shipmentRequest.packageCount && (
                        <p><span className="text-gray-500">Количество мест:</span> {shipmentRequest.packageCount}</p>
                      )}
                      {shipmentRequest.cargoDimensions && (
                        <p><span className="text-gray-500">Габариты:</span> {shipmentRequest.cargoDimensions}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Маршрут</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <p className="text-gray-500">Откуда:</p>
                          <p className="font-medium">{shipmentRequest.loadingAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <p className="text-gray-500">Куда:</p>
                          <p className="font-medium">{shipmentRequest.unloadingAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {shipmentRequest.transportInfo && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Информация о транспорте</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {shipmentRequest.transportInfo.driver_name && (
                        <p><span className="text-gray-500">Водитель:</span> {shipmentRequest.transportInfo.driver_name}</p>
                      )}
                      {shipmentRequest.transportInfo.driver_phone && (
                        <p><span className="text-gray-500">Телефон водителя:</span> {shipmentRequest.transportInfo.driver_phone}</p>
                      )}
                      {shipmentRequest.transportInfo.vehicle_model && (
                        <p><span className="text-gray-500">Автомобиль:</span> {shipmentRequest.transportInfo.vehicle_model}</p>
                      )}
                      {shipmentRequest.transportInfo.vehicle_plate && (
                        <p><span className="text-gray-500">Гос. номер:</span> {shipmentRequest.transportInfo.vehicle_plate}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p><span className="text-gray-500">Дата создания:</span> {new Date(shipmentRequest.createdAt).toLocaleString('ru-RU')}</p>
                    {shipmentRequest.desiredShipmentDatetime && (
                      <p><span className="text-gray-500">Желаемая дата отгрузки:</span> {new Date(shipmentRequest.desiredShipmentDatetime).toLocaleString('ru-RU')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Есть вопросы?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Если у вас есть вопросы по заказу, свяжитесь с нами любым удобным способом:
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>+7 (777) 123-45-67</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>info@chromlogistics.kz</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}