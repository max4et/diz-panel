import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  orderBy,
  serverTimestamp,
  getDoc,
  limit
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface TaskAttachment {
  name: string;
  url: string;
  type: 'file' | 'link';
}

export interface TaskComment {
  id: string;
  text: string;
  createdAt: Date;
  author: {
    email: string;
    company: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'design-review';
  userId: string;
  author?: {
    company: string;
    email: string;
  };
  createdAt: Date;
  deadline: Date;
  attachments?: TaskAttachment[];
  links?: string[];
  comments?: TaskComment[];
}

interface FirestoreTaskComment {
  text: string;
  createdAt: Timestamp;
  author: {
    email: string;
    company: string;
  };
}

interface FirestoreTask {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'design-review';
  userId: string;
  author?: {
    company: string;
    email: string;
  };
  createdAt: Timestamp | null;
  deadline: Timestamp;
  attachments?: TaskAttachment[];
  links?: string[];
  comments?: FirestoreTaskComment[];
}

const convertFirestoreTaskToTask = (doc: QueryDocumentSnapshot<DocumentData>): Task => {
  const data = doc.data() as FirestoreTask;
  const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
  const deadline = data.deadline ? data.deadline.toDate() : new Date();
  
  const comments = data.comments?.map((comment, index) => ({
    id: `${doc.id}-comment-${index}`,
    text: comment.text,
    createdAt: comment.createdAt.toDate(),
    author: comment.author
  })) || [];
  
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    status: data.status,
    userId: data.userId,
    author: data.author,
    createdAt,
    deadline,
    attachments: data.attachments || [],
    links: data.links || [],
    comments
  };
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
  try {
    const now = new Date();
    const firestoreTask: Omit<FirestoreTask, 'createdAt'> = {
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      deadline: Timestamp.fromDate(task.deadline),
      attachments: task.attachments || [],
      links: task.links || [],
      author: task.author
    };

    const docRef = await addDoc(collection(db, 'tasks'), {
      ...firestoreTask,
      createdAt: Timestamp.fromDate(now)
    });

    // Получаем созданную задачу, чтобы убедиться, что она сохранилась
    const taskDoc = await getDoc(docRef);
    if (!taskDoc.exists()) {
      throw new Error('Задача не была создана');
    }

    return convertFirestoreTaskToTask(taskDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const updateData: Partial<FirestoreTask> = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.userId) updateData.userId = updates.userId;
    if (updates.deadline) updateData.deadline = Timestamp.fromDate(updates.deadline);
    
    await updateDoc(taskRef, updateData);

    // Получаем обновленную задачу
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error('Задача не найдена');
    }

    return convertFirestoreTaskToTask(taskDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    // Сначала получаем все задачи без сортировки
    const tasksQuery = query(collection(db, 'tasks'));
    
    const querySnapshot = await getDocs(tasksQuery);
    const tasks = querySnapshot.docs.map(convertFirestoreTaskToTask);
    
    // Сортируем на стороне клиента
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting all tasks:', error);
    throw error;
  }
};

export const getUserTasks = async (userId: string, isAdmin: boolean): Promise<Task[]> => {
  try {
    if (isAdmin) {
      return getAllTasks();
    }
    
    // Для обычных пользователей получаем только их задачи без сортировки
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    const tasks = querySnapshot.docs.map(convertFirestoreTaskToTask);
    
    // Сортируем на стороне клиента
    const sortedTasks = tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log(`Retrieved ${sortedTasks.length} tasks for user ${userId}`);
    return sortedTasks;
  } catch (error) {
    console.error(`Error fetching tasks for user ${userId}:`, error);
    throw error;
  }
};

// Функция для загрузки файла в Storage
export const uploadFile = async (file: File, taskId: string): Promise<string> => {
  try {
    // Создаем безопасное имя файла
    const timestamp = Date.now();
    const safeFileName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'));
    const storageRef = ref(storage, `tasks/${taskId}/${timestamp}_${safeFileName}`);
    
    // Загружаем файл
    const snapshot = await uploadBytes(storageRef, file);
    
    // Получаем URL для скачивания
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    throw new Error('Не удалось загрузить файл. Пожалуйста, попробуйте снова.');
  }
};

export const addTaskComment = async (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      throw new Error('Задача не найдена');
    }
    
    const currentComments = taskDoc.data().comments || [];
    const newComment: FirestoreTaskComment = {
      text: comment.text,
      createdAt: Timestamp.fromDate(new Date()),
      author: comment.author
    };
    
    await updateDoc(taskRef, {
      comments: [...currentComments, newComment]
    });

    const updatedTaskDoc = await getDoc(taskRef);
    return convertFirestoreTaskToTask(updatedTaskDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
