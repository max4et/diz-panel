import { type Service } from "../types";

export const videoServices: Service[] = [
  {
    id: "animation-videos",
    name: "Анимационные ролики",
    description: "Создание анимационных видео",
    price: 2000,
    estimatedHours: 40,
    category: "video"
  },
  {
    id: "social-videos",
    name: "Видеоролики для соцсетей",
    description: "Создание контента для соцсетей",
    price: 1500,
    estimatedHours: 30,
    category: "video"
  },
  {
    id: "presentation-videos",
    name: "Презентационные видеоролики",
    description: "Создание презентационных видео",
    price: 2500,
    estimatedHours: 50,
    category: "video"
  },
  {
    id: "trailers",
    name: "Трейлеры и видеореклама",
    description: "Создание рекламных видеороликов",
    price: 3000,
    estimatedHours: 60,
    category: "video"
  }
]; 