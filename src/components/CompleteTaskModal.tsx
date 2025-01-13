import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { uploadFile } from '../services/taskService';

interface CompleteTaskModalProps {
  onClose: () => void;
  onComplete: (text: string, link: string, files: { name: string; url: string; type: 'file' | 'link' }[]) => Promise<void>;
  taskId: string;
}

const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  onClose,
  onComplete,
  taskId
}) => {
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Пожалуйста, введите текст');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const attachments = [];
      
      // Добавляем ссылку, если она есть
      if (link.trim()) {
        attachments.push({
          name: 'Ссылка на результат',
          url: link.trim(),
          type: 'link' as const
        });
      }

      // Загружаем файлы
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileUrl = await uploadFile(file, taskId);
          attachments.push({
            name: file.name,
            url: fileUrl,
            type: 'file' as const
          });
        }
      }

      await onComplete(text.trim(), link.trim(), attachments);
      onClose();
    } catch (err) {
      console.error('Ошибка при завершении задачи:', err);
      setError('Произошла ошибка. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Отправка на дизайн-ревью</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Комментарий к ревью*
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Опишите, что нужно проверить..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ссылка на макет
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Прикрепить файлы
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить на ревью'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteTaskModal; 