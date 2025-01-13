import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Task, addTaskComment, updateTask } from '../services/taskService';
import { User } from 'firebase/auth';
import CreateTaskModal from './CreateTaskModal';
import CompleteTaskModal from './CompleteTaskModal';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  currentUser: User;
  onUpdateStatus?: (taskId: string, status: Task['status']) => Promise<Task>;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task: initialTask,
  onClose,
  currentUser,
  onUpdateStatus
}) => {
  const [task, setTask] = useState<Task | null>(initialTask);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  if (!task) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isAdmin = currentUser.email === 'efeop1@gmail.com';
  const canEdit = isAdmin || (currentUser.email === task.author?.email);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const author = {
        email: currentUser.email || '',
        company: task.author?.company || ''
      };

      const updatedTask = await addTaskComment(task.id, {
        text: newComment.trim(),
        author
      });

      setTask(updatedTask);
      setNewComment('');
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
      setError('Не удалось добавить комментарий. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSuccess = (updatedTask?: Task) => {
    if (updatedTask) {
      setTask(updatedTask);
    }
    setIsEditModalOpen(false);
  };

  const handleCompleteTask = async (text: string, link: string, files: { name: string; url: string; type: 'file' | 'link' }[]) => {
    if (!task) return;

    const updatedTask = await onUpdateStatus?.(task.id, 'design-review');
    if (updatedTask) {
      setTask(updatedTask);
      
      // Добавляем комментарий о дизайн-ревью
      const commentText = `Задача отправлена на дизайн-ревью\n\n${text}`;
      const commentedTask = await addTaskComment(task.id, {
        text: commentText,
        author: {
          email: currentUser.email || '',
          company: task.author?.company || ''
        }
      });

      // Добавляем ссылку и файлы к задаче
      const updatedAttachments = [
        ...(commentedTask.attachments || []),
        ...files
      ];

      const finalTask = await updateTask(task.id, {
        ...commentedTask,
        attachments: updatedAttachments
      });

      setTask(finalTask);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Edit2 className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Описание</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Вложения</h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-500">
                          {attachment.type === 'file' ? '📎' : '🔗'}
                        </span>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.status === 'design-review' && task.comments && (
                <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-purple-800">Дизайн-ревью</h3>
                  {(() => {
                    const reviewComment = task.comments?.find(comment => 
                      comment.text.startsWith('Задача отправлена на дизайн-ревью')
                    );
                    const reviewText = reviewComment?.text.split('\n\n')[1];
                    
                    return reviewText ? (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-purple-700 mb-1">Комментарий к ревью:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{reviewText}</p>
                      </div>
                    ) : null;
                  })()}
                  
                  <div className="space-y-3">
                    {/* Ссылка на макет */}
                    {task.attachments?.find(att => att.name === 'Ссылка на макет') && (
                      <div>
                        <h4 className="text-sm font-medium text-purple-700 mb-1">Ссылка на макет:</h4>
                        <a
                          href={task.attachments.find(att => att.name === 'Ссылка на макет')?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {task.attachments.find(att => att.name === 'Ссылка на макет')?.url}
                        </a>
                      </div>
                    )}

                    {/* Файлы ревью */}
                    {task.attachments?.filter(att => 
                      att.name !== 'Ссылка на макет' && 
                      att.name !== 'Ссылка на результат' &&
                      att.name !== 'Ссылка на пример'
                    ).map((attachment, index) => (
                      <div key={index}>
                        <h4 className="text-sm font-medium text-purple-700 mb-1">Прикрепленный файл:</h4>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all flex items-center"
                        >
                          <span className="mr-1">📎</span>
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-4 border-t">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Создано: {formatDate(task.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Дедлайн: {formatDate(task.deadline)}
                  </p>
                  {isAdmin && task.author && (
                    <div className="text-sm text-gray-500">
                      <p>Автор: {task.author.email}</p>
                      <p>Компания: {task.author.company}</p>
                    </div>
                  )}
                </div>

                {isAdmin ? (
                  <select
                    value={task.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as Task['status'];
                      if (newStatus === 'design-review') {
                        setIsCompleteModalOpen(true);
                      } else {
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
                              email: currentUser.email || '',
                              company: task.author?.company || ''
                            }
                          });
                          setTask(commentedTask);
                        }
                      }
                    }}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">В ожидании</option>
                    <option value="in-progress">В процессе</option>
                    <option value="design-review">Дизайн-ревью</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {task.status === 'pending' ? 'В ожидании' :
                     task.status === 'in-progress' ? 'В процессе' :
                     'Дизайн-ревью'}
                  </span>
                )}
              </div>

              {/* Секция комментариев */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Комментарии</h3>
                
                {/* Форма добавления комментария */}
                <form onSubmit={handleSubmitComment} className="space-y-4 mb-6">
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Напишите комментарий..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {isSubmitting ? 'Отправка...' : 'Отправить комментарий'}
                    </Button>
                  </div>
                </form>
                
                <div className="space-y-4">
                  {task.comments?.slice().reverse().map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">
                            {comment.author.email === 'efeop1@gmail.com' ? 'Admin' : comment.author.email}
                          </span>
                          {isAdmin && (
                            <>
                              <span className="mx-2">·</span>
                              <span>{comment.author.company}</span>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  ))}
                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Нет комментариев</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <CreateTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editTask={task}
          onSuccess={handleEditSuccess}
        />
      )}

      {isCompleteModalOpen && task && (
        <CompleteTaskModal
          taskId={task.id}
          onClose={() => setIsCompleteModalOpen(false)}
          onComplete={handleCompleteTask}
        />
      )}
    </>
  );
};

export default TaskDetailModal;
