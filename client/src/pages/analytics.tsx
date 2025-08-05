import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  Package, 
  Clock, 
  DollarSign, 
  Target, 
  Truck,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

interface AnalyticsData {
  monthlyStats: Array<{ month: string; astana: number; intercity: number; total: number }>;
  categoryStats: { astana: number; intercity: number };
  statusDistribution: Array<{ status: string; count: number }>;
  averagePrice: { astana: number | null; intercity: number | null };
  kpiMetrics: {
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    totalRevenue: number;  // Represents logistics costs, not revenue
    avgOrderValue: number; // Represents average logistics cost per shipment
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_COLORS: Record<string, string> = {
  'new': '#3b82f6',
  'processing': '#f59e0b', 
  'assigned': '#8b5cf6',
  'transit': '#06b6d4',
  'delivered': '#10b981',
  'cancelled': '#ef4444'
};

const STATUS_LABELS: Record<string, string> = {
  'new': 'Новые',
  'processing': 'В обработке',
  'assigned': 'Назначены',
  'transit': 'В пути',
  'delivered': 'Доставлены',
  'cancelled': 'Отменены'
};

export default function Analytics() {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Загрузка аналитики...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !analytics) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center text-red-600">
            Ошибка загрузки данных аналитики
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const monthlyChartData = analytics.monthlyStats.map(stat => ({
    ...stat,
    monthName: new Date(stat.month + '-01').toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'short' 
    })
  }));

  const categoryChartData = [
    { name: 'Астана', value: analytics.categoryStats.astana, color: '#3b82f6' },
    { name: 'Междугородние', value: analytics.categoryStats.intercity, color: '#10b981' }
  ];

  const statusChartData = analytics.statusDistribution.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6b7280'
  }));

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Аналитика и KPI</h1>
            <p className="text-gray-600 mt-1">Визуальный анализ эффективности логистических операций</p>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <BarChart3 className="w-4 h-4 mr-1" />
            Обновлено в реальном времени
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Расходы на логистику</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {analytics.kpiMetrics.totalRevenue.toLocaleString('ru-RU')} ₸
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Средние расходы: {analytics.kpiMetrics.avgOrderValue.toLocaleString('ru-RU')} ₸
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Доставка в срок</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {analytics.kpiMetrics.onTimeDeliveryRate.toFixed(1)}%
              </div>
              <p className="text-xs text-green-600 mt-1">
                Показатель качества
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Среднее время доставки</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {analytics.kpiMetrics.averageDeliveryTime} дня
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Эффективность логистики
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Всего заявок</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {analytics.categoryStats.astana + analytics.categoryStats.intercity}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                За весь период
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Динамика заявок по месяцам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="astana" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Астана"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intercity" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Междугородние"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Общее"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
                Распределение по категориям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Статусы заявок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                Средняя стоимость перевозки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Астана</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {analytics.averagePrice.astana 
                        ? `${analytics.averagePrice.astana.toLocaleString('ru-RU')} ₸`
                        : 'Нет данных'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800">Междугородние</p>
                    <p className="text-2xl font-bold text-green-900">
                      {analytics.averagePrice.intercity 
                        ? `${analytics.averagePrice.intercity.toLocaleString('ru-RU')} ₸`
                        : 'Нет данных'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Section */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">Рекомендации по оптимизации</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.kpiMetrics.onTimeDeliveryRate < 90 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Улучшение доставки в срок</p>
                  <p className="text-xs text-yellow-700">
                    Показатель доставки в срок составляет {analytics.kpiMetrics.onTimeDeliveryRate.toFixed(1)}%. 
                    Рекомендуется оптимизировать планирование маршрутов.
                  </p>
                </div>
              </div>
            )}
            
            {analytics.categoryStats.intercity > analytics.categoryStats.astana * 2 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Расширение городских перевозок</p>
                  <p className="text-xs text-blue-700">
                    Междугородние перевозки преобладают. Возможность развития услуг по Астане.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Общая эффективность</p>
                <p className="text-xs text-green-700">
                  Система работает стабильно. Продолжайте мониторинг ключевых показателей.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}