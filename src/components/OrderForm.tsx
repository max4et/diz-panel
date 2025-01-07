import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { type Service } from "../lib/types";
import { addDays } from "date-fns";

interface OrderFormProps {
  selectedServices: Service[];
  onSubmit: (data: OrderFormValues) => void;
  onBack: () => void;
}

export interface OrderFormValues {
  taskName: string;
  taskDescription: string;
  deadline: string;
  inspirationLink: string;
  attachments: FileList | null;
}

const formSchema = z.object({
  taskName: z.string().min(1, "Название задачи обязательно"),
  taskDescription: z.string().min(1, "Описание задачи обязательно"),
  deadline: z.string().min(1, "Дедлайн обязателен"),
});

const OrderForm = ({ selectedServices, onSubmit, onBack }: OrderFormProps) => {
  const totalHours = selectedServices.reduce(
    (sum, service) => sum + service.estimatedHours,
    0
  );
  
  const defaultDeadline = addDays(new Date(), Math.ceil(totalHours / 8)).toISOString().split('T')[0];

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskName: "",
      taskDescription: "",
      deadline: defaultDeadline,
      inspirationLink: "",
      attachments: null,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Название задачи
        </label>
        <input
            type="text"
          {...form.register("taskName")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {form.formState.errors.taskName && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.taskName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Описание задачи
        </label>
        <textarea
          {...form.register("taskDescription")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {form.formState.errors.taskDescription && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.taskDescription.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Дедлайн
        </label>
        <input
          type="date"
          {...form.register("deadline")}
          min={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {form.formState.errors.deadline && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.deadline.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ссылка на пример
        </label>
        <input
          type="url"
          {...form.register("inspirationLink")}
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {form.formState.errors.inspirationLink && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.inspirationLink.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Вложения
        </label>
        <input
          type="file"
          multiple
          {...form.register("attachments")}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        {form.formState.errors.attachments && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.attachments.message}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Назад
        </Button>
        <Button type="submit">Отправить заказ</Button>
      </div>
    </form>
  );
};

export default OrderForm; 