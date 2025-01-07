import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCompanySettings, updateCompanySettings } from '../services/userService';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanySettings = async () => {
      if (!currentUser) return;

      try {
        setError(null);
        const settings = await getCompanySettings(currentUser.uid);
        if (settings) {
          setCompanyName(settings.companyName);
          setCompanyWebsite(settings.companyWebsite);
          setCompanyDescription(settings.companyDescription);
        }
      } catch (err) {
        console.error('Error loading company settings:', err);
        setError('Ошибка при загрузке настроек компании');
      } finally {
        setLoading(false);
      }
    };

    loadCompanySettings();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setError(null);
      setSuccessMessage(null);
      
      await updateCompanySettings(currentUser.uid, {
        companyName,
        companyWebsite,
        companyDescription
      });
      
      setSuccessMessage('Настройки компании успешно сохранены');
    } catch (err) {
      console.error('Error saving company settings:', err);
      setError('Ошибка при сохранении настроек компании');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Настройки компании</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Название компании
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Введите название компании"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Сайт компании
          </label>
          <input
            type="url"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="https://example.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Описание компании
          </label>
          <textarea
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Введите описание компании"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default Settings; 