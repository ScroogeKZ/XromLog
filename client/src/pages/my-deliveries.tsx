import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Package, 
  Calendar, 
  MapPin, 
  Phone,
  User,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { StatusChip } from "@/components/status-chip";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/1571623_1754368340277.png";

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
  transportInfo?: any;
}

export default function MyDeliveries() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("POST", "/api/requests-by-phone", {
        clientPhone: phone
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRequests(data.requests || []);
      setHasSearched(true);
      toast({
        title: "Поиск выполнен",
        description: `Найдено заявок: ${data.requests?.length || 0}`
      });
    },
    onError: (error) => {
      setRequests([]);
      setHasSearched(true);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось найти заявки по указанному номеру",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Введите номер телефона",
        description: "Для поиска заявок необходимо указать номер телефона",
        variant: "destructive"
      });
      return;
    }
    
    searchMutation.mutate(phoneNumber.trim());
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-lg p-2">
              <img 
                src={logoPath} 
                alt="ХРОМ-KZ" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Отслеживание доставок</h1>
          <p className="text-xl text-gray-600">
            Проверьте статус ваших заявок на доставку
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Поиск заявок</span>
            </CardTitle>
            <CardDescription>
              Введите номер телефона, указанный при оформлении заявки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="+7 (777) 123-45-67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-center text-lg"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="w-full"
              size="lg"
            >
              {searchMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Поиск...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Найти заявки
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-6">
            {requests.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  По указанному номеру телефона заявки не найдены. 
                  Проверьте правильность номера или обратитесь в службу поддержки.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-center">
                  <Alert className="max-w-md mx-auto border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Найдено заявок: {requests.length}
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-xl">{request.requestNumber}</CardTitle>
                            <Badge variant="outline">{getCategoryText(request.category)}</Badge>
                            <StatusChip status={request.status} />
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Создана:</div>
                            <div>{format(new Date(request.createdAt), "dd.MM.yyyy", { locale: ru })}</div>
                          </div>
                        </div>
                        {request.desiredShipmentDatetime && (
                          <CardDescription className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700">
                              Желаемая дата: {format(new Date(request.desiredShipmentDatetime), "dd MMMM yyyy", { locale: ru })}
                            </span>
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-lg text-foreground mb-2">{request.cargoName}</h4>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                              {request.cargoWeightKg && (
                                <span className="flex items-center space-x-1">
                                  <Package className="w-4 h-4" />
                                  <span>{request.cargoWeightKg} кг</span>
                                </span>
                              )}
                              {request.cargoVolumeM3 && (
                                <span className="flex items-center space-x-1">
                                  <Package className="w-4 h-4" />
                                  <span>{request.cargoVolumeM3} м³</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-green-700">Место загрузки</div>
                                  <div className="text-sm text-gray-600">
                                    {request.loadingCity && `${request.loadingCity}, `}
                                    {request.loadingAddress}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-red-700">Место выгрузки</div>
                                  <div className="text-sm text-gray-600">
                                    {request.unloadingCity && `${request.unloadingCity}, `}
                                    {request.unloadingAddress}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transport Info */}
                          {request.transportInfo && (
                            <div className="pt-4 border-t bg-gray-50 -mx-6 px-6 py-4">
                              <h5 className="font-medium mb-3 flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Информация о транспорте</span>
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {request.transportInfo.driver_name && (
                                  <div>
                                    <span className="text-muted-foreground">Водитель:</span>
                                    <span className="ml-2 font-medium">{request.transportInfo.driver_name}</span>
                                  </div>
                                )}
                                {request.transportInfo.driver_phone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{request.transportInfo.driver_phone}</span>
                                  </div>
                                )}
                                {request.transportInfo.vehicle_model && (
                                  <div>
                                    <span className="text-muted-foreground">Автомобиль:</span>
                                    <span className="ml-2 font-medium">{request.transportInfo.vehicle_model}</span>
                                  </div>
                                )}
                                {request.transportInfo.vehicle_plate && (
                                  <div>
                                    <span className="text-muted-foreground">Гос. номер:</span>
                                    <span className="ml-2 font-medium">{request.transportInfo.vehicle_plate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Price */}
                          {request.priceKzt && (
                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-lg text-muted-foreground">Стоимость доставки:</span>
                                <span className="font-bold text-2xl text-green-600">
                                  {parseInt(request.priceKzt).toLocaleString()} ₸
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Contact Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Нужна помощь?</h3>
              <p className="text-blue-700">
                Свяжитесь с нами: <strong>+7 (702) 997 00 94</strong>
              </p>
              <p className="text-sm text-blue-600">
                Email: nurbek@creativegroup.kz
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}