import { type Service } from "../types";

export const webServices: Service[] = [
  {
    id: "landing-pages",
    name: "Лендинг-страницы",
    description: "Дизайн продающих одностраничных сайтов",
    price: 1500,
    estimatedHours: 30,
    category: "web"
  },
  {
    id: "corporate-sites",
    name: "Корпоративные сайты",
    description: "Дизайн многостраничных корпоративных сайтов",
    price: 3000,
    estimatedHours: 60,
    category: "web"
  },
  {
    id: "ecommerce",
    name: "Интернет-магазины",
    description: "Дизайн платформ электронной коммерции",
    price: 4000,
    estimatedHours: 80,
    category: "web"
  },
  {
    id: "android-apps",
    name: "Дизайн приложений для Android",
    description: "Разработка дизайна для Android-приложений",
    price: 2500,
    estimatedHours: 50,
    category: "web"
  },
  {
    id: "ios-apps",
    name: "Дизайн приложений для iOS",
    description: "Разработка дизайна для iOS-приложений",
    price: 2800,
    estimatedHours: 55,
    category: "web"
  },
  {
    id: "ux-design",
    name: "UX Дизайн",
    description: "Проектирование пользовательского опыта",
    price: 2000,
    estimatedHours: 40,
    category: "web"
  },
  {
    id: "ui-design",
    name: "UI Дизайн",
    description: "Разработка пользовательского интерфейса",
    price: 1800,
    estimatedHours: 35,
    category: "web"
  }
]; 