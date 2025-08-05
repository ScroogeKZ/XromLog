import { useState } from "react";
import { Settings, User, Bell, Shield, Monitor, Moon, Sun, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    language: "ru",
    autoRefresh: true,
    soundAlerts: false
  });
  const { toast } = useToast();

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify({
      ...settings,
      [key]: value
    }));
    
    toast({
      title: "Настройки сохранены",
      description: "Ваши предпочтения были обновлены",
    });
  };

  const handleLogout = () => {
    auth.logout();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы"
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 rounded-full hover:bg-blue-50 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Настройки</span>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 space-y-6">
            {/* Уведомления */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <Label className="text-sm font-medium">Уведомления</Label>
              </div>
              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm">
                    Показывать уведомления
                  </Label>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailAlerts" className="text-sm">
                    Email уведомления
                  </Label>
                  <Switch
                    id="emailAlerts"
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) => handleSettingChange('emailAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="soundAlerts" className="text-sm">
                    Звуковые сигналы
                  </Label>
                  <Switch
                    id="soundAlerts"
                    checked={settings.soundAlerts}
                    onCheckedChange={(checked) => handleSettingChange('soundAlerts', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Интерфейс */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-600" />
                <Label className="text-sm font-medium">Интерфейс</Label>
              </div>
              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="text-sm">
                    Темная тема
                  </Label>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoRefresh" className="text-sm">
                    Автообновление
                  </Label>
                  <Switch
                    id="autoRefresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Язык интерфейса</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="kz">Қазақша</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Быстрые действия */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Быстрые действия</Label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    window.location.href = '/profile';
                    setIsOpen(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Мой профиль
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Информация",
                      description: "ХРОМ-KZ Логистическая система v2.1.0"
                    });
                    setIsOpen(false);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  О системе
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти из системы
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}