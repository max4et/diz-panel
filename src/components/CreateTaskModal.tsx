import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import CreateTask from './CreateTask';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Создание новой задачи</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div>
          <CreateTask onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal; 