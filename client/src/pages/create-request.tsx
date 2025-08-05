import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, MapPin, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout";
import { PhotoUpload } from "@/components/photo-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { kazakhstanCities } from "../../../shared/cities";

export default function CreateRequest() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    category: "astana",
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
    cargoPhotos: [] as string[]
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const processedData = {
        ...data,
        cargoWeightKg: data.cargoWeightKg ? parseFloat(data.cargoWeightKg) : null,
        cargoVolumeM3: data.cargoVolumeM3 ? parseFloat(data.cargoVolumeM3) : null,

        desiredShipmentDatetime: data.desiredShipmentDatetime ? new Date(data.desiredShipmentDatetime).toISOString() : null
      };
      
      const response = await apiRequest("POST", "/api/shipment-requests", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Заявка создана",
        description: "Заявка на отгрузку успешно создана"
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка создания заявки",
        description: error.message || "Не удалось создать заявку",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Создание заявки на логистические услуги</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div>
                <Label className="text-base font-medium">Категория отгрузки</Label>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  className="flex space-x-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="astana" id="astana" />
                    <Label htmlFor="astana">Отгрузки по Астане</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intercity" id="intercity" />
                    <Label htmlFor="intercity">Междугородние отгрузки</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cargo Information */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Информация о грузе
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cargoName">Наименование груза *</Label>
                    <Input
                      id="cargoName"
                      required
                      value={formData.cargoName}
                      onChange={(e) => handleChange('cargoName', e.target.value)}
                      placeholder="Введите наименование груза"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cargoWeightKg">Вес (кг)</Label>
                      <Input
                        id="cargoWeightKg"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cargoWeightKg}
                        onChange={(e) => handleChange('cargoWeightKg', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cargoVolumeM3">Объем (м³)</Label>
                      <Input
                        id="cargoVolumeM3"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cargoVolumeM3}
                        onChange={(e) => handleChange('cargoVolumeM3', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
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
                  <div>
                    <Label htmlFor="specialRequirements">Особые требования</Label>
                    <Textarea
                      id="specialRequirements"
                      rows={3}
                      value={formData.specialRequirements}
                      onChange={(e) => handleChange('specialRequirements', e.target.value)}
                      placeholder="Дополнительные требования к перевозке"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Loading Address */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Адрес погрузки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.category === "intercity" && (
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
                    <Label htmlFor="loadingAddress">Адрес *</Label>
                    <Textarea
                      id="loadingAddress"
                      required
                      rows={2}
                      value={formData.loadingAddress}
                      onChange={(e) => handleChange('loadingAddress', e.target.value)}
                      placeholder={formData.category === "astana" ? "Полный адрес в Астане" : "Точный адрес в городе"}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loadingContactPerson">Контактное лицо</Label>
                      <Input
                        id="loadingContactPerson"
                        value={formData.loadingContactPerson}
                        onChange={(e) => handleChange('loadingContactPerson', e.target.value)}
                        placeholder="ФИО контактного лица"
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
                  </div>
                </CardContent>
              </Card>

              {/* Unloading Address */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Navigation className="w-5 h-5 mr-2" />
                    Адрес выгрузки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.category === "intercity" && (
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
                    <Label htmlFor="unloadingAddress">Адрес *</Label>
                    <Textarea
                      id="unloadingAddress"
                      required
                      rows={2}
                      value={formData.unloadingAddress}
                      onChange={(e) => handleChange('unloadingAddress', e.target.value)}
                      placeholder={formData.category === "astana" ? "Полный адрес в Астане" : "Точный адрес в городе"}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unloadingContactPerson">Контактное лицо</Label>
                      <Input
                        id="unloadingContactPerson"
                        value={formData.unloadingContactPerson}
                        onChange={(e) => handleChange('unloadingContactPerson', e.target.value)}
                        placeholder="ФИО контактного лица"
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
                  </div>
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
                      disabled={createRequestMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Примечания</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Дополнительная информация"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? "Создание..." : "Создать заявку"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
