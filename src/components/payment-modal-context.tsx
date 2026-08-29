"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PaymentModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  cryptoUrl?: string;
  cardUrl?: string;
};

const PaymentModalContext = createContext<PaymentModalContextValue | null>(null);

type PaymentModalProviderProps = {
  children: ReactNode;
  cryptoUrl?: string;
  cardUrl?: string;
};

export function PaymentModalProvider({
  children,
  cryptoUrl,
  cardUrl,
}: PaymentModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Pause Lenis smooth scroll while modal is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isOpen) {
      window.__lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      window.__lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      window.__lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      openModal,
      closeModal,
      cryptoUrl,
      cardUrl,
    }),
    [isOpen, openModal, closeModal, cryptoUrl, cardUrl]
  );

  return (
    <PaymentModalContext.Provider value={value}>
      {children}
    </PaymentModalContext.Provider>
  );
}

export function usePaymentModal() {
  const context = useContext(PaymentModalContext);
  if (!context) {
    throw new Error("usePaymentModal must be used within a PaymentModalProvider");
  }
  return context;
}
