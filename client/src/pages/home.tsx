import { useState } from "react";
import { Link } from "wouter";
import { 
  Truck, 
  Package, 
  MapPin, 
  Navigation, 
  Search,
  Phone,
  Mail,
  Clock,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [trackingId, setTrackingId] = useState("");

  const handleTrackOrder = () => {
    if (trackingId.trim()) {
      window.location.href = `/track/${trackingId.trim()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Хром Логистика</h1>
                <p className="text-gray-600 dark:text-gray-300">Внутренняя система управления заявками</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Прием заявок 24/7
              </Badge>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Вход в систему
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Система управления
            <span className="block text-blue-600 dark:text-blue-400">заявками на отгрузку</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Внутренняя корпоративная система для управления заявками на логистические услуги. 
            Создавайте заявки, отслеживайте статусы и управляйте процессом доставки.
          </p>
        </div>
      </section>

      {/* Main Action Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Астана заказ */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Доставка по Астане
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Создание заявок на доставку грузов в пределах города Астана. 
                  Управление местными логистическими задачами.
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 mb-8 space-y-2">
                  <li>• Автоматическая нумерация заявок</li>
                  <li>• Контроль статусов доставки</li>
                  <li>• Управление контактами</li>
                </ul>
                <Link href="/create-order/astana">
                  <Button size="lg" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold">
                    <Package className="w-5 h-5 mr-2" />
                    Создать заявку по Астане
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Межгородской заказ */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Межгородские перевозки
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Создание заявок на межгородские перевозки. 
                  Управление дальними логистическими маршрутами.
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 mb-8 space-y-2">
                  <li>• Маршруты по всему Казахстану</li>
                  <li>• Контроль сроков доставки</li>
                  <li>• Управление документооборотом</li>
                </ul>
                <Link href="/create-order/intercity">
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold">
                    <Truck className="w-5 h-5 mr-2" />
                    Создать межгородскую заявку
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Отслеживание заказа */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Отслеживание заявки
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Проверьте текущий статус заявки по номеру. 
                  Актуальная информация о ходе выполнения.
                </p>
                <div className="mb-6">
                  <Label htmlFor="tracking-id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Номер заявки
                  </Label>
                  <Input
                    id="tracking-id"
                    placeholder="Например: AST-2024-001"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="mt-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
                  onClick={handleTrackOrder}
                  disabled={!trackingId.trim()}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Отследить заявку
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Возможности системы
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Эффективное управление логистическими процессами компании
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Контроль сроков</h4>
              <p className="text-gray-600 dark:text-gray-300">Автоматическое отслеживание и уведомления о статусах</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Учет и отчетность</h4>
              <p className="text-gray-600 dark:text-gray-300">Полная история заявок и детальная аналитика</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Доступ персонала</h4>
              <p className="text-gray-600 dark:text-gray-300">Ролевая система доступа для сотрудников и менеджеров</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Техническая поддержка
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Обращайтесь к IT-отделу за помощью по работе с системой
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Phone className="w-5 h-5" />
              <span>+7 (777) 123-45-67</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Mail className="w-5 h-5" />
              <span>info@chromlogistics.kz</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}