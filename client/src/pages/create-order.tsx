import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { 
  Truck, 
  Package, 
  MapPin, 
  Navigation, 
  Clock,
  Phone,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoUpload } from "@/components/photo-upload";
import { useToast } from "@/hooks/use-toast";
import { kazakhstanCities } from "../../../shared/cities";

export default function CreateOrder() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const category = params.type === "astana" ? "astana" : "intercity";
  const isAstana = category === "astana";
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [formData, setFormData] = useState({
    category,
    cargoName: "",
    cargoWeightKg: "",
    cargoVolumeM3: "",
    cargoDimensions: "",

    specialRequirements: "",
    loadingCity: "",
    loadingAddress: "",
    loadingContactPerson: "",
    loadingContactPhone: "",
    unloadingCity: "",
    unloadingAddress: "",
    unloadingContactPerson: "",
    unloadingContactPhone: "",
    desiredShipmentDatetime: "",
    notes: "",
    cargoPhotos: [] as string[],
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

        desiredShipmentDatetime: data.desiredShipmentDatetime ? new Date(data.desiredShipmentDatetime).toISOString() : null,
        createdByUserId: 1 // Default system user for public requests
      };
      
      const response = await fetch("/api/shipment-requests/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(processedData)
      });
      
      if (!response.ok) throw new Error('Failed to submit request');
      return response.json();
    },
    onSuccess: (data) => {
      setRequestNumber(data.requestNumber);
      setIsSubmitted(true);
      toast({
        title: "Заявка отправлена!",
        description: `Номер заявки: ${data.requestNumber}`
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Хром Логистика</h1>
                <p className="text-gray-600 dark:text-gray-300">Надежные грузоперевозки</p>
              </div>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Заявка успешно отправлена!
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Номер заявки: <span className="text-blue-600 dark:text-blue-400">{requestNumber}</span>
                </p>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Мы получили вашу заявку и свяжемся с вами в ближайшее время для уточнения деталей.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setLocation("/")} variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  На главную
                </Button>
                <Button onClick={() => setLocation(`/track/${requestNumber}`)} size="lg">
                  Отследить заказ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Хром Логистика</h1>
                <p className="text-gray-600 dark:text-gray-300">Надежные грузоперевозки</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/login")}>
                Админка
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isAstana ? "Создание заказа по Астане" : "Создание межгородского заказа"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {isAstana 
              ? "Быстрая доставка грузов в пределах города" 
              : "Межгородские перевозки по всему Казахстану"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cargo Information */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Информация о грузе
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargoName">Наименование груза *</Label>
                  <Input
                    id="cargoName"
                    required
                    value={formData.cargoName}
                    onChange={(e) => handleChange('cargoName', e.target.value)}
                    placeholder="Например: Документы, оборудование, товары"
                  />
                </div>

              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cargoWeightKg">Вес (кг)</Label>
                  <Input
                    id="cargoWeightKg"
                    type="number"
                    step="0.1"
                    value={formData.cargoWeightKg}
                    onChange={(e) => handleChange('cargoWeightKg', e.target.value)}
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cargoVolumeM3">Объем (м³)</Label>
                  <Input
                    id="cargoVolumeM3"
                    type="number"
                    step="0.01"
                    value={formData.cargoVolumeM3}
                    onChange={(e) => handleChange('cargoVolumeM3', e.target.value)}
                    placeholder="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="cargoDimensions">Габариты (ДxШxВ)</Label>
                  <Input
                    id="cargoDimensions"
                    value={formData.cargoDimensions}
                    onChange={(e) => handleChange('cargoDimensions', e.target.value)}
                    placeholder="50x30x20 см"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="specialRequirements">Особые требования</Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => handleChange('specialRequirements', e.target.value)}
                  placeholder="Хрупкий груз, температурный режим и т.д."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Адреса
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Откуда забрать</h4>
                <div className="space-y-3">
                  {!isAstana && (
                    <div>
                      <Label htmlFor="loadingCity">Город отправления *</Label>
                      <Select
                        value={formData.loadingCity}
                        onValueChange={(value) => handleChange('loadingCity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите город отправления" />
                        </SelectTrigger>
                        <SelectContent>
                          {kazakhstanCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="loadingAddress">Адрес загрузки *</Label>
                    <Input
                      id="loadingAddress"
                      required
                      value={formData.loadingAddress}
                      onChange={(e) => handleChange('loadingAddress', e.target.value)}
                      placeholder={isAstana ? "г. Астана, ул. Примерная, д. 1" : "Точный адрес в городе"}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
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
                        value={formData.loadingContactPhone}
                        onChange={(e) => handleChange('loadingContactPhone', e.target.value)}
                        placeholder="+7 (777) 123-45-67"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Куда доставить</h4>
                <div className="space-y-3">
                  {!isAstana && (
                    <div>
                      <Label htmlFor="unloadingCity">Город назначения *</Label>
                      <Select
                        value={formData.unloadingCity}
                        onValueChange={(value) => handleChange('unloadingCity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите город назначения" />
                        </SelectTrigger>
                        <SelectContent>
                          {kazakhstanCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="unloadingAddress">Адрес доставки *</Label>
                    <Input
                      id="unloadingAddress"
                      required
                      value={formData.unloadingAddress}
                      onChange={(e) => handleChange('unloadingAddress', e.target.value)}
                      placeholder={isAstana ? "г. Астана, ул. Примерная, д. 2" : "Точный адрес в городе"}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
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
                        value={formData.unloadingContactPhone}
                        onChange={(e) => handleChange('unloadingContactPhone', e.target.value)}
                        placeholder="+7 (777) 123-45-67"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Ваши контактные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="clientName">ФИО *</Label>
                  <Input
                    id="clientName"
                    required
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Телефон *</Label>
                  <Input
                    id="clientPhone"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => handleChange('clientPhone', e.target.value)}
                    placeholder="+7 (777) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleChange('clientEmail', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Дополнительная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="desiredShipmentDatetime">Желаемая дата и время отгрузки</Label>
                <Input
                  id="desiredShipmentDatetime"
                  type="datetime-local"
                  value={formData.desiredShipmentDatetime}
                  onChange={(e) => handleChange('desiredShipmentDatetime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cargoPhotos">Фотографии груза</Label>
                <PhotoUpload
                  photos={formData.cargoPhotos}
                  onPhotosChange={(photos) => setFormData({ ...formData, cargoPhotos: photos })}
                  maxPhotos={5}
                  disabled={submitRequestMutation.isPending}
                />
              </div>
              <div>
                <Label htmlFor="notes">Дополнительные комментарии</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Любая дополнительная информация..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full md:w-auto px-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
              disabled={submitRequestMutation.isPending}
            >
              {submitRequestMutation.isPending ? "Отправка..." : "Отправить заявку"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}