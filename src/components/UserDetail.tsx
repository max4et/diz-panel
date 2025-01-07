import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserTasks, Task } from '../services/taskService';
import { getCompanySettings, CompanySettings } from '../services/userService';
import AdminTaskDetailModal from './AdminTaskDetailModal';

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      try {
        setError(null);
        const [userTasks, settings] = await Promise.all([
          getUserTasks(userId, false),
          getCompanySettings(userId)
        ]);
        
        setTasks(userTasks);
        setCompanySettings(settings);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Ошибка при загрузке данных пользователя');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const calculateStats = (tasks: Task[]): TaskStats => {
    return tasks.reduce((stats, task) => ({
      total: stats.total + 1,
      pending: stats.pending + (task.status === 'pending' ? 1 : 0),
      inProgress: stats.inProgress + (task.status === 'in-progress' ? 1 : 0),
      completed: stats.completed + (task.status === 'completed' ? 1 : 0)
    }), {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  const stats = calculateStats(tasks);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Информация о пользователе</h2>
        <Link
          to="/users"
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
        >
          Назад к списку
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Данные компании</h3>
        <div className="space-y-2">
          <p><span className="font-semibold">Название:</span> {companySettings?.companyName || 'Не указано'}</p>
          <p>
            <span className="font-semibold">Сайт:</span>{' '}
            {companySettings?.companyWebsite ? (
              <a 
                href={companySettings.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {companySettings.companyWebsite}
              </a>
            ) : 'Не указан'}
          </p>
          <p><span className="font-semibold">Описание:</span> {companySettings?.companyDescription || 'Не указано'}</p>
          {companySettings?.updatedAt && (
            <p className="text-sm text-gray-500">
              Последнее обновление: {formatDate(companySettings.updatedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Статистика задач</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
            <p className="text-sm text-gray-500">Всего задач</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-sm text-yellow-500">В ожидании</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
            <p className="text-sm text-blue-500">В процессе</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-sm text-green-500">Завершено</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Список задач</h3>
        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition duration-200"
              onClick={() => handleOpenTask(task)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Дедлайн: {formatDate(task.deadline)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status === 'pending' ? 'В ожидании' :
                   task.status === 'in-progress' ? 'В процессе' :
                   'Завершено'}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-500 text-center py-4">У пользователя нет задач</p>
          )}
        </div>
      </div>

      {selectedTask && (
        <AdminTaskDetailModal
          task={selectedTask}
          onClose={handleCloseTask}
        />
      )}
    </div>
  );
};

export default UserDetail;
