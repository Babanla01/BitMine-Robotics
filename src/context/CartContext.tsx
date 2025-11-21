import { createContext, useReducer, ReactNode, Dispatch, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  categories: string[];
  ageGroup: string;
}

export interface CartItem extends Product {
  qty: number;
}

interface State {
  items: CartItem[];
}

type Action =
  | { type: 'ADD_TO_CART'; product: Product }
  | { type: 'REMOVE_FROM_CART'; id: number }
  | { type: 'ADJUST_QTY'; id: number; qty: number }
  | { type: 'CLEAR_CART' };

const initialState: State = { items: [] };
const STORAGE_KEY = 'bitmine-cart';

const loadState = (): State => {
  if (typeof window === 'undefined') return initialState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as State;
      if (Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to parse cart from storage', error);
  }
  return initialState;
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) return state; // do not add duplicate
      return {
        ...state,
        items: [...state.items, { ...action.product, qty: 1 }],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
      };
    case 'ADJUST_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, qty: action.qty < 1 ? 1 : action.qty } : i
        ),
      };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save cart', error);
    }
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
