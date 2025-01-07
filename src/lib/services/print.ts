import { type Service } from "../types";

export const printServices: Service[] = [
  {
    id: "posters-flyers",
    name: "Постеры и флаеры",
    description: "Дизайн рекламных материалов",
    price: 500,
    estimatedHours: 10,
    category: "print"
  },
  {
    id: "brochures-catalogs",
    name: "Брошюры и каталоги",
    description: "Разработка печатных каталогов",
    price: 1200,
    estimatedHours: 24,
    category: "print"
  },
  {
    id: "business-cards",
    name: "Визитки",
    description: "Дизайн визитных карточек",
    price: 200,
    estimatedHours: 4,
    category: "print"
  },
  {
    id: "packaging",
    name: "Печать на упаковке",
    description: "Дизайн упаковочных материалов",
    price: 1500,
    estimatedHours: 30,
    category: "print"
  }
]; 