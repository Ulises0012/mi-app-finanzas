import { Ionicons } from '@expo/vector-icons';

export type Categoria = {
  id: string;
  nombre: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  tipo: 'ingreso' | 'gasto';
};

export const CATEGORIES: Categoria[] = [
  { id: 'comida', nombre: 'Comida', icono: 'fast-food', color: '#FF9F5A', tipo: 'gasto' },
  { id: 'transporte', nombre: 'Transporte', icono: 'car', color: '#5EC9E8', tipo: 'gasto' },
  { id: 'entretenimiento', nombre: 'Entretenimiento', icono: 'game-controller', color: '#C792F2', tipo: 'gasto' },
  { id: 'servicios', nombre: 'Servicios', icono: 'flash', color: '#FFC15E', tipo: 'gasto' },
  { id: 'salud', nombre: 'Salud', icono: 'medkit', color: '#FA5E6B', tipo: 'gasto' },
  { id: 'otros_gasto', nombre: 'Otros', icono: 'ellipsis-horizontal', color: '#8FA6FF', tipo: 'gasto' },
  { id: 'salario', nombre: 'Salario', icono: 'cash', color: '#4ADE9A', tipo: 'ingreso' },
  { id: 'otros_ingreso', nombre: 'Otros ingresos', icono: 'wallet', color: '#4ADE9A', tipo: 'ingreso' },
];