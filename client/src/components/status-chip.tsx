import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: string;
  className?: string;
}

const statusConfig = {
  new: {
    label: "Новая",
    className: "status-gradient-new text-white shadow-lg"
  },
  processing: {
    label: "В обработке", 
    className: "status-gradient-processing text-white shadow-lg"
  },
  assigned: {
    label: "Назначен транспорт",
    className: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
  },
  transit: {
    label: "В пути",
    className: "status-gradient-transit text-white shadow-lg"
  },
  delivered: {
    label: "Доставлен",
    className: "status-gradient-delivered text-white shadow-lg"
  },
  cancelled: {
    label: "Отменен",
    className: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
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
