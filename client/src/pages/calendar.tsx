import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock, MapPin, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isFuture } from "date-fns";
import { ru } from "date-fns/locale";

interface ShipmentRequest {
  id: number;
  requestNumber: string;
  category: string;
  status: string;
  cargoName: string;
  loadingAddress: string;
  unloadingAddress: string;
  desiredShipmentDatetime: string;
  createdAt: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Получаем заявки с датами отгрузки в текущем месяце
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['/api/shipment-requests', 'calendar', format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/shipment-requests/calendar?start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch calendar data');
      return response.json();
    }
  });

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getShipmentsForDate = (date: Date) => {
    return shipments.filter((shipment: ShipmentRequest) => {
      if (!shipment.desiredShipmentDatetime) return false;
      return isSameDay(new Date(shipment.desiredShipmentDatetime), date);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'assigned': return 'bg-purple-500';
      case 'transit': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новая';
      case 'processing': return 'Обработка';
      case 'assigned': return 'Назначена';
      case 'transit': return 'В пути';
      case 'delivered': return 'Доставлена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    setSelectedDate(null);
  };

  const selectedDateShipments = selectedDate ? getShipmentsForDate(selectedDate) : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Календарь отгрузок</h1>
              <p className="text-muted-foreground">Планирование и отслеживание будущих отгрузок</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="professional-card card-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {format(currentDate, 'LLLL yyyy', { locale: ru })}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Сегодня
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Загрузка календаря...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {/* Days of week header */}
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {daysInMonth.map((day) => {
                      const dayShipments = getShipmentsForDate(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);
                      const isFutureDate = isFuture(day);
                      
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            relative p-2 min-h-[60px] rounded-lg border transition-all duration-200 hover:border-primary/50
                            ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}
                            ${isTodayDate ? 'bg-primary/10' : ''}
                            ${!isFutureDate && !isTodayDate ? 'opacity-50' : ''}
                          `}
                        >
                          <div className="text-sm font-medium">
                            {format(day, 'd')}
                          </div>
                          
                          {dayShipments.length > 0 && (
                            <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
                              {dayShipments.slice(0, 2).map((shipment: ShipmentRequest) => (
                                <div
                                  key={shipment.id}
                                  className={`w-2 h-2 rounded-full ${getStatusColor(shipment.status)}`}
                                />
                              ))}
                              {dayShipments.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayShipments.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            <Card className="professional-card card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDateShipments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateShipments.map((shipment: ShipmentRequest) => (
                        <div key={shipment.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getStatusColor(shipment.status)} text-white`}>
                                {getStatusText(shipment.status)}
                              </Badge>
                              <span className="text-sm font-medium">{shipment.requestNumber}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate">{shipment.cargoName}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate text-muted-foreground">
                                {shipment.loadingAddress}
                              </span>
                            </div>
                            
                            {shipment.desiredShipmentDatetime && (
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {format(new Date(shipment.desiredShipmentDatetime), 'HH:mm')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Нет запланированных отгрузок на эту дату</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Выберите дату для просмотра отгрузок</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="professional-card card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Статистика месяца</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Всего отгрузок:</span>
                    <span className="font-semibold">{shipments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Астана:</span>
                    <span className="font-semibold">
                      {shipments.filter((s: ShipmentRequest) => s.category === 'astana').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Межгород:</span>
                    <span className="font-semibold">
                      {shipments.filter((s: ShipmentRequest) => s.category === 'intercity').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}