import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useState } from "react";
import { type Service } from "../lib/types";
import { cn } from "../lib/utils";

interface ServiceCategoryProps {
  title: string;
  services: Service[];
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
}

const ServiceCategory = ({
  title,
  services,
  selectedServices,
  onServiceToggle,
}: ServiceCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-lg font-semibold hover:text-primary transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const isSelected = selectedServices.some((s) => s.id === service.id);
            return (
              <div
                key={service.id}
                className={cn("service-card", isSelected && "selected")}
                onClick={() => onServiceToggle(service)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{service.estimatedHours} часов</span>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    ${service.price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceCategory; 