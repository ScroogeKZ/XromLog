import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { 
  Package, 
  MapPin, 
  Navigation, 
  Truck, 
  Edit, 
  Clock,
  CheckCircle2,
  AlertCircle,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusChip } from "@/components/status-chip";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function RequestDetails() {
  const [match, params] = useRoute("/request/:id");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isTransportDialogOpen, setIsTransportDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [transportInfo, setTransportInfo] = useState({
    driver_name: "",
    driver_phone: "",
    vehicle_model: "",
    vehicle_plate: ""
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const requestId = params?.id;

  const { data: request, isLoading } = useQuery({
    queryKey: ['/api/shipment-requests', requestId],
    queryFn: async () => {
      const response = await fetch(`/api/shipment-requests/${requestId}`);
      if (!response.ok) throw new Error('Failed to fetch request');
      return response.json();
    },
    enabled: !!requestId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await apiRequest("PATCH", `/api/shipment-requests/${requestId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipment-requests', requestId] });
      queryClient.invalidateQueries({ queryKey: ['/api/shipment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Статус обновлен", description: "Статус заявки успешно изменен" });
      setIsStatusDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  });

  const updateTransportMutation = useMutation({
    mutationFn: async (transportData: typeof transportInfo) => {
      const response = await apiRequest("PATCH", `/api/shipment-requests/${requestId}`, {
        transportInfo: transportData,
        status: "assigned"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipment-requests', requestId] });
      queryClient.invalidateQueries({ queryKey: ['/api/shipment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Транспорт назначен", description: "Информация о транспорте успешно добавлена" });
      setIsTransportDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка назначения транспорта",
        description: error.message || "Не удалось назначить транспорт",
        variant: "destructive"
      });
    }
  });

  const handleStatusUpdate = () => {
    if (newStatus) {
      updateStatusMutation.mutate({ status: newStatus });
    }
  };

  const handleTransportUpdate = () => {
    updateTransportMutation.mutate(transportInfo);
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">Заявка не найдена</div>
        </div>
      </Layout>
    );
  }

  const statusTimeline = [
    { status: "new", label: "Новая заявка", icon: AlertCircle, active: true },
    { status: "processing", label: "В обработке", icon: Clock, active: ["processing", "assigned", "transit", "delivered"].includes(request.status) },
    { status: "assigned", label: "Назначен транспорт", icon: Truck, active: ["assigned", "transit", "delivered"].includes(request.status) },
    { status: "transit", label: "В пути", icon: Truck, active: ["transit", "delivered"].includes(request.status) },
    { status: "delivered", label: "Доставлен", icon: CheckCircle2, active: request.status === "delivered" }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  Заявка {request.requestNumber}
                </h3>
                <p className="text-gray-500">
                  Создана {new Date(request.createdAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusChip status={request.status} />
                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Изменить статус
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Изменить статус заявки</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Новый статус</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="processing">В обработке</SelectItem>
                            <SelectItem value="assigned">Назначен транспорт</SelectItem>
                            <SelectItem value="transit">В пути</SelectItem>
                            <SelectItem value="delivered">Доставлен</SelectItem>
                            <SelectItem value="cancelled">Отменен</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button 
                          onClick={handleStatusUpdate}
                          disabled={!newStatus || updateStatusMutation.isPending}
                        >
                          Обновить
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Статус заявки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {statusTimeline.map((item, index) => (
                  <div key={item.status} className="relative flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                      item.active 
                        ? item.status === request.status 
                          ? "bg-primary text-white" 
                          : "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-500"
                    }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${item.active ? "text-gray-900" : "text-gray-500"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.active && request.updatedAt && item.status !== "new" 
                          ? new Date(request.updatedAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : item.status === "new" 
                            ? new Date(request.createdAt).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : "Ожидается"
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cargo Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Информация о грузе
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Наименование</p>
                <p className="font-medium">{request.cargoName}</p>
              </div>

              {request.cargoWeightKg && (
                <div>
                  <p className="text-sm text-gray-500">Вес</p>
                  <p className="font-medium">{request.cargoWeightKg} кг</p>
                </div>
              )}
              {request.cargoVolumeM3 && (
                <div>
                  <p className="text-sm text-gray-500">Объем</p>
                  <p className="font-medium">{request.cargoVolumeM3} м³</p>
                </div>
              )}
              {request.cargoDimensions && (
                <div>
                  <p className="text-sm text-gray-500">Габариты</p>
                  <p className="font-medium">{request.cargoDimensions}</p>
                </div>
              )}
              {request.specialRequirements && (
                <div>
                  <p className="text-sm text-gray-500">Особые требования</p>
                  <p className="font-medium">{request.specialRequirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transport Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Информация о транспорте
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.transportInfo ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Водитель</p>
                    <p className="font-medium">{request.transportInfo.driver_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Телефон водителя</p>
                    <p className="font-medium">{request.transportInfo.driver_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Модель транспорта</p>
                    <p className="font-medium">{request.transportInfo.vehicle_model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Номер транспорта</p>
                    <p className="font-medium">{request.transportInfo.vehicle_plate}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Транспорт не назначен</p>
                  <Dialog open={isTransportDialogOpen} onOpenChange={setIsTransportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Назначить транспорт</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Назначить транспорт</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="driver_name">ФИО водителя</Label>
                          <Input
                            id="driver_name"
                            value={transportInfo.driver_name}
                            onChange={(e) => setTransportInfo(prev => ({ ...prev, driver_name: e.target.value }))}
                            placeholder="Введите ФИО водителя"
                          />
                        </div>
                        <div>
                          <Label htmlFor="driver_phone">Телефон водителя</Label>
                          <Input
                            id="driver_phone"
                            value={transportInfo.driver_phone}
                            onChange={(e) => setTransportInfo(prev => ({ ...prev, driver_phone: e.target.value }))}
                            placeholder="+7 (___) ___-__-__"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vehicle_model">Модель транспорта</Label>
                          <Input
                            id="vehicle_model"
                            value={transportInfo.vehicle_model}
                            onChange={(e) => setTransportInfo(prev => ({ ...prev, vehicle_model: e.target.value }))}
                            placeholder="Например: КамАЗ-65117"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vehicle_plate">Номер транспорта</Label>
                          <Input
                            id="vehicle_plate"
                            value={transportInfo.vehicle_plate}
                            onChange={(e) => setTransportInfo(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                            placeholder="Например: А123БВ01"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsTransportDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button 
                            onClick={handleTransportUpdate}
                            disabled={updateTransportMutation.isPending}
                          >
                            Назначить
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Адрес погрузки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Адрес</p>
                <p className="font-medium">{request.loadingAddress}</p>
              </div>
              {request.loadingContactPerson && (
                <div>
                  <p className="text-sm text-gray-500">Контактное лицо</p>
                  <p className="font-medium">{request.loadingContactPerson}</p>
                </div>
              )}
              {request.loadingContactPhone && (
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{request.loadingContactPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unloading Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                Адрес выгрузки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Адрес</p>
                <p className="font-medium">{request.unloadingAddress}</p>
              </div>
              {request.unloadingContactPerson && (
                <div>
                  <p className="text-sm text-gray-500">Контактное лицо</p>
                  <p className="font-medium">{request.unloadingContactPerson}</p>
                </div>
              )}
              {request.unloadingContactPhone && (
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{request.unloadingContactPhone}</p>
                </div>
              )}
              {request.desiredShipmentDatetime && (
                <div>
                  <p className="text-sm text-gray-500">Желаемое время</p>
                  <p className="font-medium">
                    {new Date(request.desiredShipmentDatetime).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              {request.notes && (
                <div>
                  <p className="text-sm text-gray-500">Примечания</p>
                  <p className="font-medium">{request.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
