import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserTasks, Task } from '../services/taskService';
import { getUser } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import TaskList from './TaskList';
import TaskDetailModal from './TaskDetailModal';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ email: string; companyName: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Получаем данные пользователя
        const user = await getUser(userId);
        if (user) {
          setUserData(user);
        }

        // Получаем задачи пользователя
        const userTasks = await getUserTasks(userId, currentUser.email === 'efeop1@gmail.com');
        setTasks(userTasks);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser]);

  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    try {
      const updatedTask = tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      );
      setTasks(updatedTask);
      return updatedTask.find(task => task.id === taskId)!;
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      throw err;
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    designReview: tasks.filter(task => task.status === 'design-review').length,
    completed: tasks.filter(task => task.status === 'completed').length
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">Необходимо авторизоваться</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Информация о пользователе</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Email:</span> {userData?.email}
          </p>
          <p>
            <span className="font-medium">Компания:</span> {userData?.companyName}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Статистика задач</h3>
        <div className="grid grid-cols-5 gap-4 mb-6">
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
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-700">{stats.designReview}</p>
            <p className="text-sm text-purple-500">На ревью</p>
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
          <TaskList
            tasks={tasks}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStatus}
            onOpenTask={setSelectedTask}
          />
          {tasks.length === 0 && (
            <p className="text-gray-500 text-center py-4">У пользователя нет задач</p>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUser={currentUser}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default UserDetail;
