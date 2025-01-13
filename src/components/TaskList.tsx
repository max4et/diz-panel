import React from 'react';
import { Task } from '../services/taskService';
import { User } from 'firebase/auth';

interface TaskListProps {
  tasks: Task[];
  currentUser: User;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onOpenTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, currentUser, onUpdateStatus, onOpenTask }) => {
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
                'bg-purple-100 text-purple-800'
              }`}>
                {task.status === 'pending' ? 'В ожидании' :
                 task.status === 'in-progress' ? 'В процессе' :
                 'Дизайн-ревью'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 