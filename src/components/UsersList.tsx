import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, UserListItem } from '../services/userService';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError(null);
        const usersList = await getAllUsers();
        setUsers(usersList);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Ошибка при загрузке списка пользователей');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Список пользователей</h2>
      <div className="space-y-4">
        {users.map(user => (
          <Link 
            key={user.id} 
            to={`/users/${user.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{user.companyName || 'Без названия'}</h3>
                <p className="text-sm text-blue-600">
                  {user.companyWebsite || 'Сайт не указан'}
                </p>
                <p className="text-gray-600 mt-2">{user.companyDescription || 'Описание отсутствует'}</p>
                <p className="text-sm text-gray-500 mt-2">Email: {user.email}</p>
                <p className="text-sm text-gray-500">
                  Последнее обновление: {new Intl.DateTimeFormat('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(user.updatedAt)}
                </p>
              </div>
              <div className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UsersList; 