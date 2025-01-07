import { type Service } from "../types";

export const additionalServices: Service[] = [
  {
    id: "design-consulting",
    name: "Консультирование по дизайну",
    description: "Профессиональные консультации",
    price: 500,
    estimatedHours: 10,
    category: "additional"
  },
  {
    id: "interface-redesign",
    name: "Редизайн интерфейсов",
    description: "Обновление существующих интерфейсов",
    price: 1500,
    estimatedHours: 30,
    category: "additional"
  },
  {
    id: "ux-audit",
    name: "Аудит UX/UI",
    description: "Анализ и улучшение интерфейсов",
    price: 1000,
    estimatedHours: 20,
    category: "additional"
  },
  {
    id: "3d-objects",
    name: "Создание 3D-объектов",
    description: "Моделирование и анимация 3D",
    price: 2000,
    estimatedHours: 40,
    category: "additional"
  }
]; 