import React, { useState } from 'react';
import { Task } from '../services/taskService';
import { updateTask } from '../services/taskService';

interface AdminTaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const AdminTaskDetailModal: React.FC<AdminTaskDetailModalProps> = ({ task: initialTask, onClose }) => {
  const [task, setTask] = useState(initialTask);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      setIsUpdating(true);
      const updatedTask = await updateTask(task.id, { status: newStatus });
      setTask(updatedTask);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      alert('Не удалось обновить статус задачи');
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Детали задачи</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Название:</h3>
            <p className="mt-1 text-gray-900">{task.title}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Описание:</h3>
            <p className="mt-1 text-gray-900 whitespace-pre-line">{task.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Статус:</h3>
            <select
              value={task.status}
              onChange={(e) => {
                const newStatus = e.target.value as Task['status'];
                handleStatusChange(newStatus);
              }}
              disabled={isUpdating}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="pending">Ожидает</option>
              <option value="in-progress">В процессе</option>
              <option value="completed">Завершено</option>
            </select>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Автор:</h3>
            <p className="mt-1 text-gray-900">
              {task.author ? `${task.author.company} (${task.author.email})` : 'Неизвестно'}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Срок выполнения:</h3>
            <p className="mt-1 text-gray-900">
              {new Date(task.deadline).toLocaleDateString('ru-RU')}
            </p>
          </div>

          {(task.attachments?.length || task.links?.length) && (
            <div>
              <h3 className="font-medium text-gray-700">Вложения и ссылки:</h3>
              <div className="mt-2 space-y-2">
                {task.attachments?.map((attachment, index) => (
                  <div key={index} className="flex items-center">
                    <span className="mr-2">
                      {attachment.type === 'file' ? '📄' : '🔗'}
                    </span>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {attachment.name}
                    </a>
                  </div>
                ))}
                {task.links?.map((link, index) => (
                  <div key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetailModal;
