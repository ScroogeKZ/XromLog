import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const { toast } = useToast();

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return { startDate, endDate: now };
  };

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/reports', period],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    }
  });

  const handleExportExcel = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`/api/reports/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shipment-requests-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Экспорт выполнен",
        description: "Файл успешно скачан"
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive"
      });
    }
  };

  const getStatistics = () => {
    if (!reportData) return { total: 0, delivered: 0, cancelled: 0, successRate: 0 };
    
    const total = reportData.length;
    const delivered = reportData.filter((req: any) => req.status === 'delivered').length;
    const cancelled = reportData.filter((req: any) => req.status === 'cancelled').length;
    const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;
    
    return { total, delivered, cancelled, successRate };
  };

  const getCategoryStats = () => {
    if (!reportData) return { astana: 0, intercity: 0 };
    
    const astana = reportData.filter((req: any) => req.category === 'astana').length;
    const intercity = reportData.filter((req: any) => req.category === 'intercity').length;
    
    return { astana, intercity };
  };

  const getStatusStats = () => {
    if (!reportData) return {};
    
    const statusCounts: Record<string, number> = {};
    reportData.forEach((req: any) => {
      statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    });
    
    return statusCounts;
  };

  const statistics = getStatistics();
  const categoryStats = getCategoryStats();
  const statusStats = getStatusStats();

  return (
    <Layout>
      {/* Period Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xl font-medium text-gray-900">Отчеты и аналитика</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="quarter">За квартал</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportExcel} className="flex items-center space-x-2">
                <FileDown className="w-4 h-4" />
                <span>Экспорт в Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Статистика за период</span>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Всего заявок:</span>
              <span className="font-medium">{isLoading ? "..." : statistics.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Выполнено:</span>
              <span className="font-medium text-green-600">{isLoading ? "..." : statistics.delivered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Отменено:</span>
              <span className="font-medium text-red-600">{isLoading ? "..." : statistics.cancelled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Успешность:</span>
              <span className="font-medium text-green-600">{isLoading ? "..." : statistics.successRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>По категориям</span>
              <PieChart className="w-5 h-5 text-secondary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span className="text-gray-600">Астана</span>
              </div>
              <span className="font-medium">
                {isLoading ? "..." : `${categoryStats.astana} (${statistics.total > 0 ? Math.round((categoryStats.astana / statistics.total) * 100) : 0}%)`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
                <span className="text-gray-600">Междугородний</span>
              </div>
              <span className="font-medium">
                {isLoading ? "..." : `${categoryStats.intercity} (${statistics.total > 0 ? Math.round((categoryStats.intercity / statistics.total) * 100) : 0}%)`}
              </span>
            </div>
            
            {/* Simple progress bars */}
            {!isLoading && statistics.total > 0 && (
              <div className="pt-2 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(categoryStats.astana / statistics.total) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full" 
                    style={{ width: `${(categoryStats.intercity / statistics.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>По статусам</span>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Новые</span>
              <Badge className="bg-blue-100 text-blue-800">
                {isLoading ? "..." : statusStats.new || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">В обработке</span>
              <Badge className="bg-orange-100 text-orange-800">
                {isLoading ? "..." : statusStats.processing || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">В пути</span>
              <Badge className="bg-red-100 text-red-800">
                {isLoading ? "..." : statusStats.transit || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Доставлено</span>
              <Badge className="bg-green-100 text-green-800">
                {isLoading ? "..." : statusStats.delivered || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table for Export */}
      <Card>
        <CardHeader>
          <CardTitle>Детальные данные за период</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Заявки</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>Дата обновления</TableHead>
                  <TableHead>Груз</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : reportData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Данных за выбранный период не найдено
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium text-primary">
                        {request.requestNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {request.category === 'astana' ? 'Астана' : 'Междугородний'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={request.status} />
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {request.updatedAt 
                          ? new Date(request.updatedAt).toLocaleDateString('ru-RU')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {request.cargoName}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
