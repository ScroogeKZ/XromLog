import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Truck, 
  Package, 
  MapPin, 
  Navigation, 
  Clock,
  Phone,
  Mail,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export default function PublicRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    category: "astana",
    cargoName: "",
    cargoWeightKg: "",
    cargoVolumeM3: "",
    cargoDimensions: "",
    packageCount: "",
    specialRequirements: "",
    loadingAddress: "",
    loadingContactPerson: "",
    loadingContactPhone: "",
    unloadingAddress: "",
    unloadingContactPerson: "",
    unloadingContactPhone: "",
    desiredShipmentDatetime: "",
    notes: "",
    clientName: "",
    clientPhone: "",
    clientEmail: ""
  });
  
  const { toast } = useToast();

  const submitRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const processedData = {
        ...data,
        cargoWeightKg: data.cargoWeightKg ? parseFloat(data.cargoWeightKg) : null,
        cargoVolumeM3: data.cargoVolumeM3 ? parseFloat(data.cargoVolumeM3) : null,
        packageCount: data.packageCount ? parseInt(data.packageCount) : null,
        desiredShipmentDatetime: data.desiredShipmentDatetime ? new Date(data.desiredShipmentDatetime).toISOString() : null,
        createdByUserId: 1 // Default system user for public requests
      };
      
      const response = await fetch("/api/shipment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer public-request"
        },
        body: JSON.stringify(processedData)
      });
      
      if (!response.ok) throw new Error('Failed to submit request');
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка отправки",
        description: "Попробуйте еще раз или свяжитесь с нами по телефону",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequestMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="glass-card card-shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Хром Логистика</h1>
                <p className="text-muted-foreground">Надежные грузоперевозки</p>
              </div>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="glass-card card-shadow text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Заявка успешно отправлена!
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Спасибо за обращение! Наш менеджер свяжется с вами в течение 30 минут для уточнения деталей и расчета стоимости.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📞 Телефон: +7 (717) 123-45-67</p>
                <p>✉️ Email: info@chrome-logistics.kz</p>
                <p>⏰ Работаем: пн-пт 9:00-18:00, сб 9:00-15:00</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card card-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Хром Логистика</h1>
                <p className="text-muted-foreground">Надежные грузоперевозки</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+7 (717) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@chrome-logistics.kz</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Оставьте заявку на грузоперевозку
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Быстро и безопасно доставим ваш груз по Астане и между городами Казахстана. 
            Заполните форму, и мы рассчитаем стоимость в течение 15 минут.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card card-shadow hover-lift text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Быстрый расчет</h3>
              <p className="text-sm text-muted-foreground">Стоимость за 15 минут</p>
            </CardContent>
          </Card>
          <Card className="glass-card card-shadow hover-lift text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Безопасность</h3>
              <p className="text-sm text-muted-foreground">Страхование груза</p>
            </CardContent>
          </Card>
          <Card className="glass-card card-shadow hover-lift text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Опыт</h3>
              <p className="text-sm text-muted-foreground">Более 10 лет на рынке</p>
            </CardContent>
          </Card>
        </div>

        {/* Request Form */}
        <Card className="glass-card card-shadow-lg max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Форма заявки</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client Information */}
              <Card className="bg-accent/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Контактная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">ФИО *</Label>
                      <Input
                        id="clientName"
                        required
                        value={formData.clientName}
                        onChange={(e) => handleChange('clientName', e.target.value)}
                        placeholder="Введите ваше ФИО"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Телефон *</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        required
                        value={formData.clientPhone}
                        onChange={(e) => handleChange('clientPhone', e.target.value)}
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleChange('clientEmail', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Selection */}
              <div>
                <Label className="text-base font-medium">Тип перевозки *</Label>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  className="flex space-x-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="astana" id="astana" />
                    <Label htmlFor="astana">По Астане</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intercity" id="intercity" />
                    <Label htmlFor="intercity">Междугородняя</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cargo Information */}
              <Card className="bg-accent/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Информация о грузе
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cargoName">Наименование груза *</Label>
                      <Input
                        id="cargoName"
                        required
                        value={formData.cargoName}
                        onChange={(e) => handleChange('cargoName', e.target.value)}
                        placeholder="Что перевозим?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="packageCount">Количество мест</Label>
                      <Input
                        id="packageCount"
                        type="number"
                        min="0"
                        value={formData.packageCount}
                        onChange={(e) => handleChange('packageCount', e.target.value)}
                        placeholder="Количество коробок/паллет"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cargoWeightKg">Вес (кг)</Label>
                      <Input
                        id="cargoWeightKg"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cargoWeightKg}
                        onChange={(e) => handleChange('cargoWeightKg', e.target.value)}
                        placeholder="Примерный вес"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cargoDimensions">Габариты (ДхШхВ)</Label>
                      <Input
                        id="cargoDimensions"
                        value={formData.cargoDimensions}
                        onChange={(e) => handleChange('cargoDimensions', e.target.value)}
                        placeholder="Например: 120x80x60 см"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Loading Address */}
                <Card className="bg-accent/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Откуда забрать
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="loadingAddress">Адрес *</Label>
                      <Textarea
                        id="loadingAddress"
                        required
                        rows={2}
                        value={formData.loadingAddress}
                        onChange={(e) => handleChange('loadingAddress', e.target.value)}
                        placeholder="Полный адрес загрузки"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loadingContactPerson">Контактное лицо</Label>
                      <Input
                        id="loadingContactPerson"
                        value={formData.loadingContactPerson}
                        onChange={(e) => handleChange('loadingContactPerson', e.target.value)}
                        placeholder="ФИО"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loadingContactPhone">Телефон</Label>
                      <Input
                        id="loadingContactPhone"
                        type="tel"
                        value={formData.loadingContactPhone}
                        onChange={(e) => handleChange('loadingContactPhone', e.target.value)}
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Unloading Address */}
                <Card className="bg-accent/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Navigation className="w-5 h-5 mr-2" />
                      Куда доставить
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="unloadingAddress">Адрес *</Label>
                      <Textarea
                        id="unloadingAddress"
                        required
                        rows={2}
                        value={formData.unloadingAddress}
                        onChange={(e) => handleChange('unloadingAddress', e.target.value)}
                        placeholder="Полный адрес доставки"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unloadingContactPerson">Контактное лицо</Label>
                      <Input
                        id="unloadingContactPerson"
                        value={formData.unloadingContactPerson}
                        onChange={(e) => handleChange('unloadingContactPerson', e.target.value)}
                        placeholder="ФИО"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unloadingContactPhone">Телефон</Label>
                      <Input
                        id="unloadingContactPhone"
                        type="tel"
                        value={formData.unloadingContactPhone}
                        onChange={(e) => handleChange('unloadingContactPhone', e.target.value)}
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="desiredShipmentDatetime">Желаемая дата и время</Label>
                  <Input
                    id="desiredShipmentDatetime"
                    type="datetime-local"
                    value={formData.desiredShipmentDatetime}
                    onChange={(e) => handleChange('desiredShipmentDatetime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Дополнительная информация</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Особые требования, пожелания по времени доставки и т.д."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitRequestMutation.isPending}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {submitRequestMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Отправляем...</span>
                    </div>
                  ) : (
                    "Отправить заявку"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="glass-card mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Хром Логистика</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Надежный партнер в сфере грузоперевозок по Казахстану
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Контакты</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📞 +7 (717) 123-45-67</p>
                <p>✉️ info@chrome-logistics.kz</p>
                <p>📍 г. Астана, ул. Кенесары 42</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Режим работы</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Пн-Пт: 9:00 - 18:00</p>
                <p>Суббота: 9:00 - 15:00</p>
                <p>Воскресенье: выходной</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}