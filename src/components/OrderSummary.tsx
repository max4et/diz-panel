import { Button } from "./ui/button";
import { type Service } from "../lib/types";

interface OrderSummaryProps {
  selectedServices: Service[];
  onNextStep: () => void;
  step: number;
}

const OrderSummary = ({ selectedServices, onNextStep, step }: OrderSummaryProps) => {
  const total = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalHours = selectedServices.reduce(
    (sum, service) => sum + service.estimatedHours,
    0
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md total-wrp">
      <h2 className="text-xl font-semibold mb-4">Сводка заказа</h2>
      
      <div className="max-h-[calc(100vh-500px)] overflow-auto">
        <div className="space-y-4">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between items-center">
              <div>
                <span className="text-sm">{service.name}</span>
                <p className="text-xs text-muted-foreground">
                  {service.estimatedHours} часов
                </p>
              </div>
              <span className="font-medium">${service.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Всего часов</span>
            <span className="font-medium">{totalHours} часов</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Итоговая цена</span>
            <span className="text-xl font-bold text-primary">${total}</span>
          </div>
        </div>

        {step === 1 && (
          <Button onClick={onNextStep} className="w-full">
            Следующий шаг
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary; 