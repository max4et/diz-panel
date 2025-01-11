import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createTask, uploadFile, updateTask, addTaskComment } from '../services/taskService';
import ServiceCategory from './ServiceCategory';
import OrderSummary from './OrderSummary';
import OrderForm from './OrderForm';
import type { Service } from '../lib/types';
import type { OrderFormValues } from './OrderForm';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../services/taskService';

// Импортируем все услуги
import { additionalServices } from '../lib/services/additional';
import { brandingServices } from '../lib/services/branding';
import { gameServices } from '../lib/services/game';
import { illustrationServices } from '../lib/services/illustration';
import { marketingServices } from '../lib/services/marketing';
import { printServices } from '../lib/services/print';
import { videoServices } from '../lib/services/video';
import { webServices } from '../lib/services/web';

interface CreateTaskProps {
  onSuccess?: (task?: Task) => void;
  editTask?: Task;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onSuccess, editTask }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<OrderFormValues | undefined>(undefined);

  useEffect(() => {
    if (editTask) {
      // Извлекаем выбранные услуги из описания
      const servicesDescription = editTask.description.split('Выбранные услуги:\n')[1];
      if (servicesDescription) {
        const serviceNames = servicesDescription
          .split('\n')
          .map(line => line.replace('- ', '').split(' (')[0]);
        
        const allServices = [
          ...webServices,
          ...brandingServices,
          ...illustrationServices,
          ...marketingServices,
          ...printServices,
          ...videoServices,
          ...gameServices,
          ...additionalServices
        ];
        
        const selectedServicesList = allServices.filter(service => 
          serviceNames.includes(service.name)
        );
        setSelectedServices(selectedServicesList);
      }

      // Извлекаем ссылку на пример из вложений
      const inspirationAttachment = editTask.attachments?.find(
        att => att.name === 'Ссылка на пример'
      );

      // Подготавливаем начальные значения формы
      setInitialFormValues({
        taskName: editTask.title,
        taskDescription: editTask.description.split('Выбранные услуги:\n')[0].trim(),
        deadline: new Date(editTask.deadline).toISOString().split('T')[0],
        inspirationLink: inspirationAttachment?.url || '',
        attachments: null
      });
    }
  }, [editTask]);

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleNextStep = () => {
    if (selectedServices.length === 0) {
      setError('Пожалуйста, выберите хотя бы одну услугу');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (data: OrderFormValues) => {
    if (!currentUser) return;

    try {
      setError(null);
      const deadline = new Date(data.deadline);
      const attachments = [...(editTask?.attachments || [])];
      
      // Обновляем или добавляем ссылку на пример
      const existingInspirationIndex = attachments.findIndex(
        att => att.name === 'Ссылка на пример'
      );
      if (existingInspirationIndex !== -1) {
        if (data.inspirationLink) {
          attachments[existingInspirationIndex] = {
            name: 'Ссылка на пример',
            url: data.inspirationLink,
            type: 'link'
          };
        } else {
          attachments.splice(existingInspirationIndex, 1);
        }
      } else if (data.inspirationLink) {
        attachments.push({
          name: 'Ссылка на пример',
          url: data.inspirationLink,
          type: 'link'
        });
      }
      
      // Загружаем новые файлы
      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          const file = data.attachments[i];
          const fileUrl = await uploadFile(file, editTask?.id || Math.random().toString(36).substring(7));
          attachments.push({
            name: file.name,
            url: fileUrl,
            type: 'file'
          });
        }
      }

      // Получаем данные о компании пользователя
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      const taskData = {
        title: data.taskName,
        description: `${data.taskDescription}\n\nВыбранные услуги:\n${selectedServices.map(s => `- ${s.name} (${s.estimatedHours} часов)`).join('\n')}`,
        status: editTask?.status || 'pending' as const,
        userId: editTask?.userId || currentUser.uid,
        deadline,
        attachments,
        author: editTask?.author || {
          email: currentUser.email || '',
          company: userData?.companyName || ''
        }
      };

      let updatedTask;
      if (editTask) {
        // Формируем текст комментария об изменениях
        const changes: string[] = [];
        if (editTask.title !== taskData.title) {
          changes.push(`- Изменено название задачи с "${editTask.title}" на "${taskData.title}"`);
        }
        if (editTask.description.split('\n\nВыбранные услуги:\n')[0].trim() !== data.taskDescription) {
          changes.push('- Изменено описание задачи');
        }
        if (editTask.deadline.toISOString().split('T')[0] !== deadline.toISOString().split('T')[0]) {
          changes.push(`- Изменён дедлайн с ${new Date(editTask.deadline).toLocaleDateString('ru-RU')} на ${deadline.toLocaleDateString('ru-RU')}`);
        }

        // Сравниваем списки услуг
        const oldServices = editTask.description
          .split('Выбранные услуги:\n')[1]
          ?.split('\n')
          .map(line => line.replace('- ', '').split(' (')[0]) || [];
        
        const newServices = selectedServices.map(s => s.name);
        
        const addedServices = newServices.filter(s => !oldServices.includes(s));
        const removedServices = oldServices.filter(s => !newServices.includes(s));
        
        if (addedServices.length > 0) {
          changes.push(`- Добавлены услуги: ${addedServices.join(', ')}`);
        }
        if (removedServices.length > 0) {
          changes.push(`- Удалены услуги: ${removedServices.join(', ')}`);
        }

        // Если есть изменения, публикуем комментарий
        if (changes.length > 0) {
          const commentText = `Внесены изменения в задачу:\n${changes.join('\n')}`;
          updatedTask = await updateTask(editTask.id, taskData);
          updatedTask = await addTaskComment(editTask.id, {
            text: commentText,
            author: {
              email: currentUser.email || '',
              company: userData?.companyName || ''
            }
          });
        } else {
          updatedTask = await updateTask(editTask.id, taskData);
        }
      } else {
        updatedTask = await createTask(taskData);
      }

      // Очищаем форму и возвращаемся к первому шагу
      setSelectedServices([]);
      setStep(1);
      onSuccess?.(updatedTask);
    } catch (err) {
      console.error('Ошибка при создании/обновлении задачи:', err);
      setError('Ошибка при создании/обновлении задачи. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="space-y-6">
              <ServiceCategory
                title="Веб-разработка"
                services={webServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Брендинг"
                services={brandingServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Иллюстрации"
                services={illustrationServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Маркетинговые материалы"
                services={marketingServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Печатные материалы"
                services={printServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Видео"
                services={videoServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Игровой дизайн"
                services={gameServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
              <ServiceCategory
                title="Дополнительные услуги"
                services={additionalServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
              />
            </div>
          ) : (
            <OrderForm
              selectedServices={selectedServices}
              onSubmit={handleSubmit}
              onBack={handleBack}
              initialValues={initialFormValues}
            />
          )}
        </div>
        <div>
          <OrderSummary
            selectedServices={selectedServices}
            onNextStep={handleNextStep}
            step={step}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTask; 