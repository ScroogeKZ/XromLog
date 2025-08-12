import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: string;
  className?: string;
}

const statusConfig = {
  new: {
    label: "Новая",
    className: "!bg-blue-600 !text-white border-blue-700 shadow-lg"
  },
  processing: {
    label: "В обработке", 
    className: "!bg-yellow-500 !text-white border-yellow-600 shadow-lg"
  },
  assigned: {
    label: "Назначен транспорт",
    className: "!bg-purple-600 !text-white border-purple-700 shadow-lg"
  },
  transit: {
    label: "В пути",
    className: "!bg-orange-500 !text-white border-orange-600 shadow-lg"
  },
  delivered: {
    label: "Доставлен",
    className: "!bg-green-600 !text-white border-green-700 shadow-lg"
  },
  cancelled: {
    label: "Отменен",
    className: "!bg-gray-500 !text-white border-gray-600 shadow-lg"
  }
};

export function StatusChip({ status, className }: StatusChipProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  
  return (
    <span className={cn(
      "inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border-0 hover:scale-105 transition-transform duration-200",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
