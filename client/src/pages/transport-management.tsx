import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Truck, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function TransportManagement() {
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const vehicles = [
    {
      id: 1,
      plateNumber: "123 ABC 02",
      model: "МАЗ-6312",
      capacity: "20 тонн",
      status: "available",
      driver: "Иванов И.И.",
      lastService: "2025-01-15"
    },
    {
      id: 2,
      plateNumber: "456 DEF 02", 
      model: "КамАЗ-65115",
      capacity: "15 тонн",
      status: "in_transit",
      driver: "Петров П.П.",
      lastService: "2025-01-10"
    },
    {
      id: 3,
      plateNumber: "789 GHI 02",
      model: "Газель Next",
      capacity: "3 тонны",
      status: "maintenance",
      driver: "-",
      lastService: "2025-01-20"
    }
  ];

  const drivers = [
    {
      id: 1,
      name: "Иванов Иван Иванович",
      phone: "+7 777 123 4567",
      license: "В, С, D",
      experience: "8 лет",
      status: "active",
      currentVehicle: "123 ABC 02"
    },
    {
      id: 2,
      name: "Петров Петр Петрович", 
      phone: "+7 777 234 5678",
      license: "В, С",
      experience: "5 лет",
      status: "active",
      currentVehicle: "456 DEF 02"
    },
    {
      id: 3,
      name: "Сидоров Сидор Сидорович",
      phone: "+7 777 345 6789", 
      license: "В, С, D",
      experience: "12 лет",
      status: "off_duty",
      currentVehicle: "-"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Доступен</Badge>;
      case "in_transit":
        return <Badge className="bg-blue-100 text-blue-800">В пути</Badge>;
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800">ТО</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800">Активен</Badge>;
      case "off_duty":
        return <Badge className="bg-gray-100 text-gray-800">Не на смене</Badge>;
      default:
        return <Badge>Неизвестен</Badge>;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Управление транспортом</h1>
          <p className="text-muted-foreground">Контроль автопарка и водителей</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Truck className="w-4 h-4 mr-2" />
                Добавить ТС
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить транспортное средство</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plateNumber">Госномер</Label>
                  <Input id="plateNumber" placeholder="123 ABC 02" />
                </div>
                <div>
                  <Label htmlFor="model">Модель</Label>
                  <Input id="model" placeholder="КамАЗ-65115" />
                </div>
                <div>
                  <Label htmlFor="capacity">Грузоподъемность</Label>
                  <Input id="capacity" placeholder="15 тонн" />
                </div>
                <Button className="w-full">Добавить</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Добавить водителя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить водителя</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="driverName">ФИО</Label>
                  <Input id="driverName" placeholder="Иванов Иван Иванович" />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" placeholder="+7 777 123 4567" />
                </div>
                <div>
                  <Label htmlFor="license">Категории прав</Label>
                  <Input id="license" placeholder="В, С, D" />
                </div>
                <div>
                  <Label htmlFor="experience">Стаж вождения</Label>
                  <Input id="experience" placeholder="5 лет" />
                </div>
                <Button className="w-full">Добавить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="glass-card card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего ТС</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Доступно</p>
                <p className="text-2xl font-bold">
                  {vehicles.filter(v => v.status === "available").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Водители</p>
                <p className="text-2xl font-bold">{drivers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">На ТО</p>
                <p className="text-2xl font-bold">
                  {vehicles.filter(v => v.status === "maintenance").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      <Card className="glass-card card-shadow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Транспортные средства</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Госномер</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Грузоподъемность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Водитель</TableHead>
                <TableHead>Последнее ТО</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.capacity}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>{vehicle.driver}</TableCell>
                  <TableCell>{vehicle.lastService}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card className="glass-card card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Водители</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Категории прав</TableHead>
                <TableHead>Стаж</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Текущее ТС</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{driver.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{driver.license}</TableCell>
                  <TableCell>{driver.experience}</TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  <TableCell>{driver.currentVehicle}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
}