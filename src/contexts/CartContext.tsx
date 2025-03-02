"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { JsonProduct, JsonCustomizeOption } from "@/types";
import { saveOrderToFirestore, OrderItem, Order } from "@/services/firebase";

// Định nghĩa kiểu dữ liệu cho mục trong giỏ hàng
export interface CartItemOption {
  customizeId: number;
  customizeName: string;
  optionId: number;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; // Unique ID for cart item (product ID + selected options)
  product: JsonProduct;
  quantity: number;
  selectedOptions: CartItemOption[];
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: JsonProduct,
    quantity: number,
    selectedOptions: Record<number, number>
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  saveOrder: (customerInfo: {
    name: string;
    phone: string;
    address: string;
    surcharge?: number;
    surcharge_note?: string;
  }) => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));

    // Calculate totals
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const priceSum = items.reduce((total, item) => total + item.totalPrice, 0);

    setTotalItems(itemCount);
    setTotalPrice(priceSum);
  }, [items]);

  // Generate a unique ID for a cart item based on product ID and selected options
  const generateCartItemId = (
    productId: number,
    selectedOptions: Record<number, number>
  ): string => {
    const optionsString = Object.entries(selectedOptions)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([customizeId, optionId]) => `${customizeId}-${optionId}`)
      .join("_");

    return `${productId}_${optionsString}`;
  };

  // Convert selected options from Record to CartItemOption[]
  const convertSelectedOptions = (
    product: JsonProduct,
    selectedOptions: Record<number, number>
  ): CartItemOption[] => {
    return Object.entries(selectedOptions).map(([customizeIdStr, optionId]) => {
      const customizeId = parseInt(customizeIdStr);
      const customizeItem = product.customize_item.find(
        (item) => item.customize_id === customizeId
      );

      const option = customizeItem?.customize_options.find(
        (opt) => opt.customize_option_id === optionId
      );

      return {
        customizeId,
        customizeName: customizeItem?.customize_item_name || "",
        optionId,
        optionName: option?.customize_option_name || "",
        price: option?.customize_price || 0,
      };
    });
  };

  // Calculate total price for a cart item
  const calculateItemTotalPrice = (
    product: JsonProduct,
    quantity: number,
    selectedOptions: CartItemOption[]
  ): number => {
    const basePrice = product.price;
    const optionsPrice = selectedOptions.reduce(
      (total, option) => total + option.price,
      0
    );

    return (basePrice + optionsPrice) * quantity;
  };

  // Add a product to the cart
  const addToCart = (
    product: JsonProduct,
    quantity: number,
    selectedOptions: Record<number, number>
  ) => {
    const cartItemId = generateCartItemId(
      product.restaurant_item_id,
      selectedOptions
    );
    const cartItemOptions = convertSelectedOptions(product, selectedOptions);
    const itemTotalPrice = calculateItemTotalPrice(
      product,
      quantity,
      cartItemOptions
    );

    // Check if the item already exists in the cart
    const existingItemIndex = items.findIndex((item) => item.id === cartItemId);

    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
        totalPrice: calculateItemTotalPrice(
          product,
          existingItem.quantity + quantity,
          cartItemOptions
        ),
      };

      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: cartItemId,
        product,
        quantity,
        selectedOptions: cartItemOptions,
        totalPrice: itemTotalPrice,
      };

      setItems([...items, newItem]);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Update the quantity of an item in the cart
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          totalPrice: calculateItemTotalPrice(
            item.product,
            quantity,
            item.selectedOptions
          ),
        };
      }
      return item;
    });

    setItems(updatedItems);
  };

  // Clear the cart
  const clearCart = () => {
    setItems([]);
  };

  // Lưu đơn hàng vào Firebase
  const saveOrder = async (customerInfo: {
    name: string;
    phone: string;
    address: string;
    surcharge?: number;
    surcharge_note?: string;
  }): Promise<string> => {
    // Chuyển đổi từ CartItem sang OrderItem
    const orderItems: OrderItem[] = items.map((item) => ({
      product_id: item.product.restaurant_item_id,
      product_name: item.product.item_name,
      quantity: item.quantity,
      price: item.product.price,
      options: item.selectedOptions.map((option) => ({
        customize_id: option.customizeId,
        customize_name: option.customizeName,
        option_id: option.optionId,
        option_name: option.optionName,
        price: option.price,
      })),
      total_price: item.totalPrice,
    }));

    // Tính tổng tiền bao gồm phụ thu
    const surcharge = customerInfo.surcharge || 0;
    const finalTotalPrice = totalPrice + surcharge;

    // Tạo đơn hàng
    const order: Omit<Order, "id" | "created_at"> = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      items: orderItems,
      total_price: finalTotalPrice,
      surcharge: surcharge,
      surcharge_note: customerInfo.surcharge_note || "",
      status: "pending",
    };

    // Lưu đơn hàng vào Firestore
    try {
      const orderId = await saveOrderToFirestore(order);
      return orderId;
    } catch (error) {
      console.error("Error saving order:", error);
      throw new Error("Failed to save order");
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        saveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
