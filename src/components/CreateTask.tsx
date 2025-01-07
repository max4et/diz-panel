import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createTask, uploadFile } from '../services/taskService';
import ServiceCategory from './ServiceCategory';
import OrderSummary from './OrderSummary';
import OrderForm from './OrderForm';
import type { Service } from '../lib/types';
import type { OrderFormValues } from './OrderForm';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

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
  onSuccess?: () => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      const attachments = [];
      
      // Создаем временный ID для задачи
      const tempTaskId = Math.random().toString(36).substring(7);
      
      // Добавляем ссылку на пример, если она указана
      if (data.inspirationLink) {
        attachments.push({
          name: 'Ссылка на пример',
          url: data.inspirationLink,
          type: 'link' as const
        });
      }
      
      // Загружаем файлы в Storage
      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          const file = data.attachments[i];
          try {
            const fileUrl = await uploadFile(file, tempTaskId);
            attachments.push({
              name: file.name,
              url: fileUrl,
              type: 'file' as const
            });
          } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            setError('Ошибка при загрузке файлов. Пожалуйста, попробуйте снова.');
            return;
          }
        }
      }

      // Получаем данные о компании пользователя
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Создаем задачу с загруженными файлами и информацией об авторе
      const taskData = {
        title: data.taskName,
        description: `${data.taskDescription}\n\nВыбранные услуги:\n${selectedServices.map(s => `- ${s.name} (${s.estimatedHours} часов)`).join('\n')}`,
        status: 'pending' as const,
        userId: currentUser.uid,
        deadline,
        attachments,
        author: {
          email: currentUser.email || '',
          company: userData?.companyName || ''
        }
      };

      await createTask(taskData);

      // Очищаем форму и возвращаемся к первому шагу
      setSelectedServices([]);
      setStep(1);
      onSuccess?.();
    } catch (err) {
      console.error('Ошибка при создании задачи:', err);
      setError('Ошибка при создании задачи. Пожалуйста, попробуйте снова.');
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