import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle, AlertTriangle, Info, X, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedRequestId?: number;
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch recent requests to generate notifications
  const { data: requestsData } = useQuery({
    queryKey: ['/api/shipment-requests'],
    queryFn: async () => {
      const response = await fetch('/api/shipment-requests?limit=5');
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (requestsData?.requests) {
      // Generate notifications based on recent requests
      const newNotifications: Notification[] = [];
      
      requestsData.requests.forEach((request: any) => {
        // Notification for new requests
        if (request.status === 'new') {
          newNotifications.push({
            id: `new-${request.id}`,
            type: "info",
            title: "Новая заявка",
            message: `Заявка ${request.requestNumber} на груз "${request.cargoName}" требует обработки`,
            timestamp: request.createdAt,
            read: false,
            relatedRequestId: request.id
          });
        }
        
        // Notification for requests in transit
        if (request.status === 'transit') {
          newNotifications.push({
            id: `transit-${request.id}`,
            type: "warning",
            title: "Груз в пути",
            message: `Заявка ${request.requestNumber} находится в пути`,
            timestamp: request.updatedAt || request.createdAt,
            read: false,
            relatedRequestId: request.id
          });
        }
        
        // Notification for completed requests
        if (request.status === 'delivered') {
          newNotifications.push({
            id: `delivered-${request.id}`,
            type: "success",
            title: "Доставка завершена",
            message: `Заявка ${request.requestNumber} успешно доставлена`,
            timestamp: request.updatedAt || request.createdAt,
            read: false,
            relatedRequestId: request.id
          });
        }
      });
      
      // Add system notifications
      newNotifications.push({
        id: "system-1",
        type: "info",
        title: "Система обновлена",
        message: "Логистическая система ХРОМ-KZ успешно обновлена до последней версии",
        timestamp: new Date().toISOString(),
        read: false
      });
      
      setNotifications(newNotifications.slice(0, 10)); // Limit to 10 notifications
    }
  }, [requestsData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "error":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Только что";
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 rounded-full hover:bg-blue-50 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Уведомления</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Отметить все как прочитанные
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="w-fit">
                {unreadCount} непрочитанных
              </Badge>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Нет новых уведомлений</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-blue-500' : 'border-l-gray-200'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </p>
                            {notification.relatedRequestId && (
                              <Badge variant="outline" className="text-xs">
                                ID: {notification.relatedRequestId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}