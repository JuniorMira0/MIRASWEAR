"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

// Tipos
export interface CartStoreItem {
  productVariantId: string;
  quantity: number;
  productName?: string;
  productVariantName?: string;
  productVariantImageUrl?: string;
  productVariantPriceInCents?: number;
  productVariantSizeId?: string | null;
  sizeLabel?: string | null;
}

interface State {
  isLoaded: boolean;
  items: CartStoreItem[];
}

type Action =
  | { type: "LOAD"; payload: CartStoreItem[] }
  | { type: "ADD"; payload: { item: CartStoreItem; mergeQuantity?: boolean } }
  | { type: "REMOVE"; payload: { productVariantId: string } }
  | { type: "DECREASE"; payload: { productVariantId: string } }
  | { type: "CLEAR" };

const LOCAL_KEY = "miraswear-cart";

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOAD":
      return { ...state, isLoaded: true, items: action.payload };
    case "ADD": {
      const existing = state.items.find(
        (i) =>
          i.productVariantId === action.payload.item.productVariantId &&
          i.productVariantSizeId === action.payload.item.productVariantSizeId,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productVariantId === existing.productVariantId &&
            i.productVariantSizeId === existing.productVariantSizeId
              ? {
                  ...i,
                  quantity:
                    action.payload.mergeQuantity === false
                      ? action.payload.item.quantity
                      : i.quantity + action.payload.item.quantity,
                }
              : i,
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload.item] };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) => i.productVariantId !== action.payload.productVariantId,
        ),
      };
    case "DECREASE":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.productVariantId === action.payload.productVariantId
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
};

const CartStoreContext = createContext<{
  state: State;
  addItem: (
    id: string,
    quantity: number,
    details?: Omit<CartStoreItem, "productVariantId" | "quantity">,
  ) => void;
  removeItem: (id: string) => void;
  decrease: (id: string) => void;
  clear: () => void;
  getTotalItems: () => number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
} | null>(null);

export const CartStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, { isLoaded: false, items: [] });
  const firstLoad = useRef(true);
  const [cartOpen, setCartOpen] = useState(false);

  // Load from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed: CartStoreItem[] = JSON.parse(raw);
        dispatch({ type: "LOAD", payload: parsed });
      } else {
        dispatch({ type: "LOAD", payload: [] });
      }
    } catch {
      dispatch({ type: "LOAD", payload: [] });
    }
  }, []);

  // Persist on change (skip until loaded)
  useEffect(() => {
    if (!state.isLoaded) return;
    if (typeof window === "undefined") return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items));
  }, [state.items, state.isLoaded]);

  const addItem = useCallback(
    (
      productVariantId: string,
      quantity: number,
      details?: Omit<CartStoreItem, "productVariantId" | "quantity">,
    ) => {
      dispatch({
        type: "ADD",
        payload: { item: { productVariantId, quantity, ...details } },
      });
    },
    [],
  );
  const removeItem = useCallback(
    (id: string) =>
      dispatch({ type: "REMOVE", payload: { productVariantId: id } }),
    [],
  );
  const decrease = useCallback(
    (id: string) =>
      dispatch({ type: "DECREASE", payload: { productVariantId: id } }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const getTotalItems = useCallback(
    () => state.items.reduce((acc, i) => acc + i.quantity, 0),
    [state.items],
  );

  return (
    <CartStoreContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        decrease,
        clear,
        getTotalItems,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartStoreContext.Provider>
  );
};

export const useCartStore = () => {
  const ctx = useContext(CartStoreContext);
  if (!ctx)
    throw new Error("useCartStore must be used inside CartStoreProvider");
  return ctx;
};
