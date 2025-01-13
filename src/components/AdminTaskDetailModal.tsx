import React, { useState } from 'react';
import { Task, addTaskComment, updateTask } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

interface AdminTaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, newStatus: Task['status']) => Promise<Task>;
}

const AdminTaskDetailModal: React.FC<AdminTaskDetailModalProps> = ({ 
  task: initialTask, 
  onClose,
  onUpdateStatus 
}) => {
  const { currentUser } = useAuth();
  const [task, setTask] = useState(initialTask);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
            <p className="text-gray-600">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium text-gray-700">Создано:</h3>
              <p className="text-gray-600">{formatDate(task.createdAt)}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Дедлайн:</h3>
              <p className="text-gray-600">{formatDate(task.deadline)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Статус:</h3>
            <select
              value={task.status}
              onChange={async (e) => {
                const newStatus = e.target.value as Task['status'];
                const updatedTask = await onUpdateStatus?.(task.id, newStatus);
                if (updatedTask) {
                  setTask(updatedTask);
                  const statusText = {
                    pending: 'В ожидании',
                    'in-progress': 'В процессе',
                    'design-review': 'Дизайн-ревью'
                  };
                  const commentText = `Изменён статус задачи с "${statusText[task.status]}" на "${statusText[newStatus]}"`;
                  const commentedTask = await addTaskComment(task.id, {
                    text: commentText,
                    author: {
                      email: currentUser?.email || '',
                      company: task.author?.company || ''
                    }
                  });
                  setTask(commentedTask);
                }
              }}
              className="p-2 border border-gray-300 rounded-lg w-full"
            >
              <option value="pending">В ожидании</option>
              <option value="in-progress">В процессе</option>
              <option value="design-review">Дизайн-ревью</option>
            </select>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Вложения:</h3>
              <div className="space-y-2">
                {task.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span>{attachment.type === 'file' ? '📎' : '🔗'}</span>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {attachment.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetailModal;
