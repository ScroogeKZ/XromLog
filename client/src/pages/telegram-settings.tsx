import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layout } from "@/components/layout";
import { MessageCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TelegramSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: testResult, isLoading: testLoading } = useQuery<{connected: boolean; message: string}>({
    queryKey: ['/api/telegram/test'],
    refetchInterval: false,
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/telegram/test");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.connected ? "Подключение успешно" : "Ошибка подключения",
        description: data.message,
        variant: data.connected ? "default" : "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/test'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка тестирования",
        description: "Не удалось протестировать подключение к Telegram",
        variant: "destructive"
      });
    }
  });

  const sendTestNotificationMutation = useMutation({
    mutationFn: async () => {
      // Create a test request to trigger notification
      const response = await apiRequest("POST", "/api/shipment-requests/public", {
        category: "astana",
        cargoName: "🧪 Тестовое уведомление Telegram",
        loadingAddress: "Тестовый адрес загрузки",
        unloadingAddress: "Тестовый адрес выгрузки",
        clientName: "Система тестирования",
        clientPhone: "+77771234567",
        notes: "Это тестовое уведомление для проверки Telegram интеграции"
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Тестовое уведомление отправлено",
        description: `Создана тестовая заявка ${data.requestNumber}. Проверьте Telegram чат.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить тестовое уведомление",
        variant: "destructive"
      });
    }
  });

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  const handleSendTestNotification = () => {
    sendTestNotificationMutation.mutate();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Настройки Telegram</h1>
            <p className="text-muted-foreground">Управление уведомлениями в Telegram</p>
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Статус подключения</span>
            </CardTitle>
            <CardDescription>
              Текущее состояние подключения к Telegram Bot API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {testLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Проверка подключения...</span>
                  </>
                ) : testResult?.connected ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-700">Подключено успешно</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Активно</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span className="text-red-700">Ошибка подключения</span>
                    <Badge variant="destructive">Отключено</Badge>
                  </>
                )}
              </div>
              <Button 
                onClick={handleTestConnection} 
                disabled={testConnectionMutation.isPending}
                variant="outline"
              >
                {testConnectionMutation.isPending ? "Тестирование..." : "Проверить подключение"}
              </Button>
            </div>

            {testResult?.message && (
              <Alert className={testResult.connected ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки уведомлений</CardTitle>
            <CardDescription>
              Система автоматически отправляет уведомления о новых заявках и изменениях статуса
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Новые заявки</h4>
                <p className="text-sm text-muted-foreground">
                  Уведомления отправляются при создании новых заявок через публичную форму и админку
                </p>
                <Badge variant="default" className="bg-blue-100 text-blue-800">Включено</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Изменения статуса</h4>
                <p className="text-sm text-muted-foreground">
                  Уведомления о переходах между статусами заявок
                </p>
                <Badge variant="default" className="bg-blue-100 text-blue-800">Включено</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleSendTestNotification}
                disabled={sendTestNotificationMutation.isPending || !testResult?.connected}
                className="w-full sm:w-auto"
              >
                {sendTestNotificationMutation.isPending ? "Отправка..." : "Отправить тестовое уведомление"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Создаст тестовую заявку и отправит уведомление в Telegram
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о настройке</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>Bot Token:</strong> Настроен через переменные окружения</p>
              <p><strong>Chat ID:</strong> Настроен через переменные окружения</p>
              <p><strong>Формат уведомлений:</strong> Markdown с эмодзи для лучшей читаемости</p>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Для изменения настроек Bot Token или Chat ID обратитесь к администратору системы.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}