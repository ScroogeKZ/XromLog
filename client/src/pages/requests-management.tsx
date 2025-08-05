import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Eye, 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  Truck,
  DollarSign,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Layout } from "@/components/layout";

interface ShipmentRequest {
  id: number;
  requestNumber: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  cargoName: string;
  cargoWeightKg: string | null;
  cargoVolumeM3: string | null;
  cargoDimensions: string | null;
  specialRequirements: string | null;
  loadingCity: string | null;
  loadingAddress: string;
  loadingContactPerson: string | null;
  loadingContactPhone: string | null;
  unloadingCity: string | null;
  unloadingAddress: string;
  unloadingContactPerson: string | null;
  unloadingContactPhone: string | null;
  desiredShipmentDatetime: string | null;
  notes: string | null;
  transportInfo: any;
  priceKzt: string | null;
  priceNotes: string | null;
  cargoPhotos: string[];
}

const statusLabels = {
  new: "Новая",
  processing: "В обработке", 
  assigned: "Назначена",
  transit: "В пути",
  delivered: "Доставлена",
  cancelled: "Отменена"
};

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  assigned: "bg-purple-100 text-purple-800", 
  transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function RequestsManagement() {
  const [selectedRequest, setSelectedRequest] = useState<ShipmentRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all", 
    search: ""
  });
  const [editData, setEditData] = useState({
    status: "",
    priceKzt: "",
    priceNotes: "",
    transportInfo: {
      driverName: "",
      driverPhone: "",
      vehicleModel: "",
      vehiclePlate: ""
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery({
    queryKey: (() => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.category && filters.category !== "all") params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      const queryString = params.toString();
      return queryString ? ["/api/shipment-requests", `?${queryString}`] : ["/api/shipment-requests"];
    })()
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/shipment-requests/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipment-requests"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Заявка обновлена",
        description: "Изменения успешно сохранены"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить заявку",
        variant: "destructive"
      });
    }
  });

  // Quick update functions
  const handleQuickStatusUpdate = async (requestId: number, newStatus: string) => {
    try {
      await updateRequestMutation.mutateAsync({ id: requestId, data: { status: newStatus } });
      toast({ 
        title: "Статус обновлен", 
        description: `Статус заявки изменен на "${statusLabels[newStatus as keyof typeof statusLabels]}"` 
      });
    } catch (error: any) {
      toast({
        title: "Ошибка обновления статуса",
        description: error.message || "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const handleQuickPriceUpdate = (requestId: number, newPrice: string) => {
    // This is just for UI updates, actual save happens on blur
  };

  const handleSavePrice = async (requestId: number, newPrice: string) => {
    if (!newPrice.trim()) return;
    
    try {
      await updateRequestMutation.mutateAsync({ 
        id: requestId, 
        data: { priceKzt: parseFloat(newPrice) || 0 } 
      });
      toast({ 
        title: "Цена обновлена", 
        description: `Цена установлена: ${parseFloat(newPrice).toLocaleString()} ₸` 
      });
    } catch (error: any) {
      toast({
        title: "Ошибка обновления цены",
        description: error.message || "Не удалось обновить цену",
        variant: "destructive"
      });
    }
  };

  const handleEditRequest = (request: ShipmentRequest) => {
    setSelectedRequest(request);  
    setEditData({
      status: request.status,
      priceKzt: request.priceKzt || "",
      priceNotes: request.priceNotes || "",
      transportInfo: {
        driverName: request.transportInfo?.driverName || "",
        driverPhone: request.transportInfo?.driverPhone || "",
        vehicleModel: request.transportInfo?.vehicleModel || "",
        vehiclePlate: request.transportInfo?.vehiclePlate || ""
      }
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!selectedRequest) return;

    const updateData = {
      status: editData.status,
      priceKzt: editData.priceKzt ? parseFloat(editData.priceKzt) : null,
      priceNotes: editData.priceNotes || null,
      transportInfo: {
        driverName: editData.transportInfo.driverName || null,
        driverPhone: editData.transportInfo.driverPhone || null,
        vehicleModel: editData.transportInfo.vehicleModel || null,
        vehiclePlate: editData.transportInfo.vehiclePlate || null
      }
    };

    updateRequestMutation.mutate({ id: selectedRequest.id, data: updateData });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Управление заявками
          </h1>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Номер заявки, груз..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="astana">По Астане</SelectItem>
                  <SelectItem value="intercity">Межгородские</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: "all", category: "all", search: "" })}
              >
                Сбросить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки ({(requestsData as any)?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Информация о грузе</TableHead>
                    <TableHead>Маршрут</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(requestsData as any)?.requests?.map((request: ShipmentRequest) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.requestNumber}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-2">
                          <div className="font-medium">{request.cargoName}</div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            {request.cargoWeightKg && (
                              <div>Вес: {request.cargoWeightKg} кг</div>
                            )}
                            {request.cargoVolumeM3 && (
                              <div>Объем: {request.cargoVolumeM3} м³</div>
                            )}
                            {request.cargoDimensions && (
                              <div>Габариты: {request.cargoDimensions}</div>
                            )}
                            {request.specialRequirements && (
                              <div className="text-orange-600 font-medium">Особые требования: {request.specialRequirements}</div>
                            )}
                          </div>

                          {request.cargoPhotos && request.cargoPhotos.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs text-blue-600 font-medium">
                                Фотографии груза ({request.cargoPhotos.length})
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {request.cargoPhotos.slice(0, 3).map((photo: string, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => window.open(photo, '_blank')}
                                    className="w-12 h-12 rounded border overflow-hidden hover:opacity-75 transition-opacity"
                                  >
                                    <img
                                      src={photo}
                                      alt={`Фото ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                                {request.cargoPhotos.length > 3 && (
                                  <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                    +{request.cargoPhotos.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {request.desiredShipmentDatetime && (
                            <div className="text-xs text-purple-600">
                              Желаемая дата: {format(new Date(request.desiredShipmentDatetime), "dd.MM.yyyy HH:mm", { locale: ru })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm space-y-2">
                          <div className="space-y-1">
                            <div className="font-medium text-green-700">Загрузка:</div>
                            {request.loadingCity && <div className="text-xs">{request.loadingCity}</div>}
                            <div>{request.loadingAddress}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-red-700">Выгрузка:</div>
                            {request.unloadingCity && <div className="text-xs">{request.unloadingCity}</div>}
                            <div>{request.unloadingAddress}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-xs space-y-2">
                          {request.loadingContactPerson && (
                            <div>
                              <div className="font-medium">Отправитель:</div>
                              <div>{request.loadingContactPerson}</div>
                              {request.loadingContactPhone && <div>Тел: {request.loadingContactPhone}</div>}
                            </div>
                          )}
                          {request.unloadingContactPerson && (
                            <div>
                              <div className="font-medium">Получатель:</div>
                              <div>{request.unloadingContactPerson}</div>
                              {request.unloadingContactPhone && <div>Тел: {request.unloadingContactPhone}</div>}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            value={request.status}
                            onValueChange={(newStatus) => handleQuickStatusUpdate(request.id, newStatus)}
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue>
                                <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                                  {statusLabels[request.status as keyof typeof statusLabels]}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-500">
                            Создано: {format(new Date(request.createdAt), "dd.MM.yyyy HH:mm", { locale: ru })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Цена"
                              value={request.priceKzt || ""}
                              onChange={(e) => handleQuickPriceUpdate(request.id, e.target.value)}
                              onBlur={(e) => handleSavePrice(request.id, e.target.value)}
                              className="h-8 w-24 text-sm"
                            />
                            <span className="text-sm">₸</span>
                          </div>
                          {request.priceNotes && (
                            <div className="text-xs text-gray-500 max-w-32 truncate" title={request.priceNotes}>
                              Примечание: {request.priceNotes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRequest(request)}
                            className="h-8 px-2 text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Детали
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/request/${request.id}`, '_blank')}
                            className="h-8 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Открыть
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Редактирование заявки {selectedRequest?.requestNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Package className="w-5 h-5 mr-2" />
                    Информация о заявке
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Груз:</span> {selectedRequest.cargoName}
                    </div>
                    <div>
                      <span className="font-medium">Категория:</span>{" "}
                      {selectedRequest.category === "astana" ? "По Астане" : "Межгородская"}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Адрес загрузки:</span> {selectedRequest.loadingAddress}
                    </div>
                    <div>
                      <span className="font-medium">Адрес выгрузки:</span> {selectedRequest.unloadingAddress}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <div>
                <Label htmlFor="status">Статус заявки</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Стоимость перевозки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priceKzt">Цена (₸)</Label>
                      <Input
                        id="priceKzt"
                        type="number"
                        step="0.01"
                        value={editData.priceKzt}
                        onChange={(e) => setEditData(prev => ({ ...prev, priceKzt: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priceNotes">Примечания к цене</Label>
                    <Textarea
                      id="priceNotes"
                      value={editData.priceNotes}
                      onChange={(e) => setEditData(prev => ({ ...prev, priceNotes: e.target.value }))}
                      placeholder="Дополнительные условия, скидки, надбавки..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cargo Photos */}
              {selectedRequest?.cargoPhotos && selectedRequest.cargoPhotos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Package className="w-5 h-5 mr-2" />
                      Фотографии груза
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedRequest.cargoPhotos.map((photo: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => window.open(photo, '_blank')}
                          className="aspect-square rounded-lg overflow-hidden border border-border hover:opacity-75 transition-opacity bg-gray-50"
                        >
                          <img
                            src={photo}
                            alt={`Фото груза ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Нажмите на фото для увеличения
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Transport */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Truck className="w-5 h-5 mr-2" />
                    Назначение транспорта
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driverName">ФИО водителя</Label>
                      <Input
                        id="driverName"
                        value={editData.transportInfo.driverName}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, driverName: e.target.value }
                        }))}
                        placeholder="Иванов Иван Иванович"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverPhone">Телефон водителя</Label>
                      <Input
                        id="driverPhone"
                        value={editData.transportInfo.driverPhone}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, driverPhone: e.target.value }
                        }))}
                        placeholder="+7 (777) 123-45-67"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleModel">Модель ТС</Label>
                      <Input
                        id="vehicleModel"
                        value={editData.transportInfo.vehicleModel}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, vehicleModel: e.target.value }
                        }))}
                        placeholder="КамАЗ 5320"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehiclePlate">Гос. номер</Label>
                      <Input
                        id="vehiclePlate"
                        value={editData.transportInfo.vehiclePlate}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, vehiclePlate: e.target.value }
                        }))}
                        placeholder="123 ABC 01"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={updateRequestMutation.isPending}
                >
                  {updateRequestMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}