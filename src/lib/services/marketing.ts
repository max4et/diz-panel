import { type Service } from "../types";

export const marketingServices: Service[] = [
  {
    id: "static-banners",
    name: "Статичные баннеры",
    description: "Дизайн рекламных баннеров",
    price: 300,
    estimatedHours: 6,
    category: "marketing"
  },
  {
    id: "animated-banners",
    name: "Анимационные баннеры",
    description: "Создание анимированных баннеров",
    price: 500,
    estimatedHours: 10,
    category: "marketing"
  },
  {
    id: "social-media",
    name: "Дизайн для соцсетей",
    description: "Оформление социальных сетей",
    price: 800,
    estimatedHours: 16,
    category: "marketing"
  },
  {
    id: "presentations",
    name: "Презентации",
    description: "Дизайн презентационных материалов",
    price: 1000,
    estimatedHours: 20,
    category: "marketing"
  }
]; 