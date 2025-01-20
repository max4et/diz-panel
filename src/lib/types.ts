export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'design-review' | 'completed';
  userId: string;
  author?: {
    email: string;
    company: string;
  };
  createdAt: Date;
  deadline: Date;
  attachments: {
    name: string;
    url: string;
    type: 'file' | 'link';
  }[];
  comments?: TaskComment[];
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

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedHours: number;
  category: string;
} 