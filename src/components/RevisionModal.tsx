import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface RevisionModalProps {
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const RevisionModal: React.FC<RevisionModalProps> = ({ onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(text.trim());
      onClose();
    } catch (error) {
      console.error('Ошибка при отправке на доработку:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Отправка на доработку</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Комментарий к доработке*
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Опишите, что нужно доработать..."
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить на доработку'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevisionModal; 