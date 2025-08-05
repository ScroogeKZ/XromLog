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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-12 h-8 sm:w-16 sm:h-10 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                <img 
                  src="/attached_assets/1571623_1754335361197.png" 
                  alt="ХРОМ-KZ" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">ХРОМ-KZ</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Система управления логистикой</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm hidden sm:flex">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Работаем 24/7
              </Badge>
              <Link href="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm">
                  Вход в систему
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Система управления логистическими заявками
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-2">
            Корпоративная система ХРОМ-KZ для управления заявками на логистические услуги. 
            Создавайте заявки, отслеживайте статусы и управляйте процессом доставки.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="professional-card p-4 sm:p-6 text-center hover-lift card-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">1000+</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Заявок обработано</p>
            </div>
            <div className="professional-card p-4 sm:p-6 text-center hover-lift card-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">24/7</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Круглосуточная работа</p>
            </div>
            <div className="professional-card p-4 sm:p-6 text-center hover-lift card-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">50+</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Городов покрытия</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Action Cards */}
      <section className="pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Астана заказ */}
            <Card className="professional-card hover-lift card-shadow-lg">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                  Доставка по Астане
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-3 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Создание заявок на доставку грузов в пределах города Астана. 
                  Управление местными логистическими задачами.
                </p>
                <ul className="text-xs text-muted-foreground mb-4 sm:mb-6 space-y-1 sm:space-y-2 text-left">
                  <li>• Автоматическая нумерация заявок</li>
                  <li>• Контроль статусов доставки</li>
                  <li>• Управление контактами</li>
                </ul>
                <Link href="/create-order/astana">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Создать заявку по Астане</span>
                    <span className="sm:hidden">Заявка Астана</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Межгородской заказ */}
            <Card className="professional-card hover-lift card-shadow-lg">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Navigation className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                  Межгородские перевозки
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-3 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Создание заявок на межгородские перевозки. 
                  Управление дальними логистическими маршрутами.
                </p>
                <ul className="text-xs text-muted-foreground mb-4 sm:mb-6 space-y-1 sm:space-y-2 text-left">
                  <li>• Маршруты по всему Казахстану</li>
                  <li>• Контроль сроков доставки</li>
                  <li>• Управление документооборотом</li>
                </ul>
                <Link href="/create-order/intercity">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm py-2">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Создать межгородскую заявку</span>
                    <span className="sm:hidden">Межгород</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Отслеживание заказа */}
            <Card className="professional-card hover-lift card-shadow-lg">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                  Отслеживание заявки
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-3 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Проверьте текущий статус заявки по номеру. 
                  Актуальная информация о ходе выполнения.
                </p>
                <div className="mb-3 sm:mb-4">
                  <Label htmlFor="tracking-id" className="text-xs font-medium text-muted-foreground mb-2 block">
                    Номер заявки
                  </Label>
                  <Input
                    id="tracking-id"
                    placeholder="AST-2025-001"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                  />
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm py-2"
                  onClick={handleTrackOrder}
                  disabled={!trackingId.trim()}
                >
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Отследить заявку</span>
                  <span className="sm:hidden">Отследить</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Возможности системы ХРОМ-KZ
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
              Эффективное управление логистическими процессами компании
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center professional-card p-4 sm:p-6 hover-lift card-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">Контроль сроков</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Автоматическое отслеживание и уведомления о статусах доставки</p>
            </div>
            
            <div className="text-center professional-card p-4 sm:p-6 hover-lift card-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">Учет и отчетность</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Полная история заявок и детальная аналитика работы</p>
            </div>
            
            <div className="text-center professional-card p-4 sm:p-6 hover-lift card-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">Доступ персонала</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Ролевая система доступа для сотрудников и менеджеров</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <Card className="professional-card card-shadow-lg text-center p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
              Техническая поддержка
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-2">
              Обращайтесь к IT-отделу ХРОМ-KZ за помощью по работе с системой
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Телефон</p>
                  <p className="text-sm font-semibold text-foreground">+7 (702) 997 00 94</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground break-all">nurbek@creativegroup.kz</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}