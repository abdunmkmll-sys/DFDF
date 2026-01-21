
import { User } from './types';

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'أنس', handle: '@anas_fun', avatar: '', points: 150 },
  { id: '2', name: 'عبدو', handle: '@abdou_cool', avatar: '', points: 420 },
  { id: '3', name: 'يزيد', handle: '@yazeed_star', avatar: '', points: 90 },
  { id: '4', name: 'ميزو', handle: '@mizo_hero', avatar: '', points: 310 },
  { id: '5', name: 'خرباوي', handle: '@kharbawi_boss', avatar: '', points: 200 },
  { id: '6', name: 'باسم', handle: '@bassem_smile', avatar: '', points: 180 },
  { id: '7', name: 'خالد', handle: '@khaled_logic', avatar: '', points: 250 },
  { id: '8', name: 'إيهاب', handle: '@ihab_vibes', avatar: '', points: 130 },
  { id: '9', name: 'عبدالله', handle: '@abdullah_gold', avatar: '', points: 280 },
  { id: '10', name: 'تامر', handle: '@tamer_joy', avatar: '', points: 170 },
];

export const CATEGORY_LABELS = {
  PRO: 'مميزات نحبها',
  CON: 'سلوكيات للتحسين',
  WISH: 'أمنيات للتغيير'
};

export const CATEGORY_COLORS = {
  PRO: 'bg-green-400',
  CON: 'bg-red-400',
  WISH: 'bg-blue-400'
};
