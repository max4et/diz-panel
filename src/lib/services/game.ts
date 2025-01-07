import { type Service } from "../types";

export const gameServices: Service[] = [
  {
    id: "game-interfaces",
    name: "Интерфейсы игр",
    description: "Дизайн игровых интерфейсов",
    price: 2000,
    estimatedHours: 40,
    category: "game"
  },
  {
    id: "character-design",
    name: "Дизайн персонажей",
    description: "Создание игровых персонажей",
    price: 1500,
    estimatedHours: 30,
    category: "game"
  },
  {
    id: "level-design",
    name: "Дизайн уровней",
    description: "Проектирование игровых уровней",
    price: 2500,
    estimatedHours: 50,
    category: "game"
  },
  {
    id: "game-animations",
    name: "Анимации для игр",
    description: "Создание игровых анимаций",
    price: 1800,
    estimatedHours: 36,
    category: "game"
  }
]; 