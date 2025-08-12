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
import logoPath from "@assets/1571623_1754368340277.png";
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center p-2 shadow-lg">
                  <img 
                    src={logoPath} 
                    alt="ХРОМ-KZ" 
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ХРОМ-KZ
                </h1>
                <p className="text-sm text-gray-600">Современная логистическая система</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 transition-colors">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Работаем 24/7
              </Badge>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  Войти в систему
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Управление логистикой
              </span>
              <br />
              <span className="text-gray-700">нового поколения</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Цифровая экосистема для комплексного управления грузоперевозками, 
              отслеживания доставок и оптимизации логистических процессов
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Умное отслеживание</h3>
              <p className="text-gray-600">Отслеживайте грузы в реальном времени с точной геолокацией</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Быстрая подача заявок</h3>
              <p className="text-gray-600">Создавайте заявки за минуты через удобный интерфейс</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Полная безопасность</h3>
              <p className="text-gray-600">Защищенная передача данных и контроль доступа</p>
            </div>
          </div>
          {/* Action Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Отследить доставку</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tracking" className="text-sm font-medium text-gray-700">Номер заявки</Label>
                <Input
                  id="tracking"
                  placeholder="Введите номер заявки (например: AST-2025-001)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button 
                onClick={handleTrackOrder}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
              >
                <Search className="w-4 h-4 mr-2" />
                Отследить заявку
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Наши услуги</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Комплексные решения для всех ваших логистических потребностей
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Астана заказ */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">Доставка по Астане</h4>
                  <p className="text-gray-600">Городские перевозки</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  Быстрая доставка в пределах города
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  Отслеживание в реальном времени
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  Профессиональная обработка грузов
                </div>
              </div>
              
              <Link href="/create-order/astana">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-3">
                  <Package className="w-4 h-4 mr-2" />
                  Создать заявку на доставку
                </Button>
              </Link>
            </div>

            {/* Межгородские перевозки */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">Межгородские перевозки</h4>
                  <p className="text-gray-600">Дальние маршруты</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Доставка по всему Казахстану
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Оптимальные маршруты и сроки
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Полное документооборот
                </div>
              </div>
              
              <Link href="/create-order/intercity">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3">
                  <Truck className="w-4 h-4 mr-2" />
                  Создать межгородскую заявку
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Свяжитесь с нами</h3>
            <p className="text-xl text-gray-600">Готовы помочь с вашими логистическими потребностями</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h4 className="text-3xl font-bold text-gray-800 mb-6">Получите консультацию</h4>
                <p className="text-lg text-gray-600 mb-8">
                  Наши специалисты помогут выбрать оптимальное решение для ваших грузоперевозок
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">+7 (702) 997 00 94</p>
                      <p className="text-gray-600">Звонки принимаются 24/7</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">nurbek@creativegroup.kz</p>
                      <p className="text-gray-600">Ответим в течение часа</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h5 className="text-xl font-bold text-gray-800 mb-6">Преимущества ХРОМ-KZ</h5>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Цифровое управление</p>
                      <p className="text-gray-600 text-sm">Полная автоматизация процессов</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Прозрачность процессов</p>
                      <p className="text-gray-600 text-sm">Отслеживание на каждом этапе</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Надежность доставки</p>
                      <p className="text-gray-600 text-sm">99% выполнения в срок</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <img 
                  src={logoPath} 
                  alt="ХРОМ-KZ" 
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <h4 className="text-2xl font-bold">ХРОМ-KZ</h4>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Современная система управления логистикой для оптимизации грузоперевозок 
              и повышения эффективности доставки
            </p>
            
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Телефон поддержки</p>
                <p className="font-semibold">+7 (702) 997 00 94</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-semibold">nurbek@creativegroup.kz</p>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400 text-sm">
                © 2025 ХРОМ-KZ. Все права защищены. Система управления логистикой.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}