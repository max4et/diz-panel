import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import { Task, createTask, updateTask, getUserTasks } from './services/taskService';
import Settings from './components/Settings';
import UsersList from './components/UsersList';
import UserDetail from './components/UserDetail';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailModal from './components/TaskDetailModal';

const TaskList: React.FC<{
  tasks: Task[];
  currentUser: User;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onOpenTask: (task: Task) => void;
}> = ({ tasks, currentUser, onUpdateStatus, onOpenTask }) => {
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex-1 cursor-pointer" onClick={() => onOpenTask(task)}>
              <h3 className="font-bold hover:text-blue-500">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Дедлайн: {new Intl.DateTimeFormat('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(task.deadline)}
              </p>
            </div>
            <div className="ml-4">
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
        </div>
      ))}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const isAdmin = currentUser?.email === 'efeop1@gmail.com';

  useEffect(() => {
    const loadTasks = async () => {
      if (currentUser) {
        try {
          setError(null);
          const userTasks = await getUserTasks(currentUser.uid, isAdmin);
          setTasks(userTasks);
        } catch (err) {
          console.error('Error loading tasks:', err);
          setError('Ошибка при загрузке задач. Пожалуйста, обновите страницу.');
        }
      }
      setLoading(false);
    };

    loadTasks();
  }, [currentUser, isAdmin]);

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      setError(null);
      const updatedTask = await updateTask(taskId, { status });
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Ошибка при обновлении статуса задачи. Пожалуйста, попробуйте снова.');
      throw err;
    }
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

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-3xl font-bold hover:text-blue-500">Менеджер задач</Link>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Вы вошли как: {currentUser.email}
            </div>
            {currentUser.email === 'efeop1@gmail.com' && (
              <Link
                to="/users"
                className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 transition duration-200"
              >
                Пользователи
              </Link>
            )}
            <Link
              to="/settings"
              className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition duration-200"
            >
              Настройки
            </Link>
            <button
              onClick={() => logout()}
              className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-200"
            >
              Выйти
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <>
                {currentUser.email !== 'efeop1@gmail.com' && (
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 mb-8"
                  >
                    Создать новую задачу
                  </button>
                )}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Задачи</h2>
                  <TaskList
                    tasks={tasks}
                    currentUser={currentUser}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onOpenTask={handleOpenTask}
                  />
                </div>
              </>
            }
          />
          <Route path="/settings" element={<Settings />} />
          {currentUser.email === 'efeop1@gmail.com' && (
            <>
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/:userId" element={<UserDetail />} />
            </>
          )}
        </Routes>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={handleCloseTask}
        currentUser={currentUser}
        onUpdateStatus={handleUpdateTaskStatus}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;