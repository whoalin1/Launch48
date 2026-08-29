"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePaymentModal } from "@/components/payment-modal-context";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function PaymentModal() {
  const { isOpen, closeModal, cryptoUrl } = usePaymentModal();
  const reduceMotion = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"select" | "card">("select");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        closeModal();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    } else {
      const timer = setTimeout(() => {
        setView("select");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const targetCryptoUrl =
    cryptoUrl && cryptoUrl !== "https://app.oxapay.com/payment/your-payment-link"
      ? cryptoUrl
      : "/api/checkout/crypto";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="payment-modal-root" role="presentation">
          <motion.div
            className="payment-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeModal}
            aria-hidden="true"
          />

          <div
            className="payment-modal-container"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <motion.div
              ref={dialogRef}
              onClick={(e) => e.stopPropagation()}
              className={`payment-modal-dialog ${
                view === "card" ? "payment-modal-dialog--expanded" : ""
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-modal-title"
              tabIndex={-1}
              layout={!reduceMotion}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 32,
                mass: 0.22,
              }}
            >
              {view === "select" ? (
                <>
                  <div className="payment-modal-header">
                    <div>
                      <h2 id="payment-modal-title" className="payment-modal-title">
                        Choose Payment Method
                      </h2>
                      <p className="payment-modal-subtitle">One-time payment of $149 USD</p>
                    </div>
                    <button
                      type="button"
                      className="payment-modal-close"
                      onClick={closeModal}
                      aria-label="Close"
                    >
                      <X size={16} weight="bold" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="payment-modal-actions">
                    <a
                      href={targetCryptoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="payment-btn payment-btn--crypto"
                      onClick={() => closeModal()}
                    >
                      <div className="payment-btn__info">
                        <span className="payment-btn__name">Crypto</span>
                        <span className="payment-btn__meta">BTC, ETH, USDT, SOL & 50+ coins</span>
                      </div>
                      <span className="payment-btn__action">
                        <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                      </span>
                    </a>

                    <button
                      type="button"
                      className="payment-btn payment-btn--card"
                      onClick={() => setView("card")}
                    >
                      <div className="payment-btn__info">
                        <span className="payment-btn__name">Credit, Debit, Apple Pay & More</span>
                        <span className="payment-btn__meta">
                          Credit, Debit, Apple Pay, Google Pay, Revolut, etc.
                        </span>
                      </div>
                      <span className="payment-btn__action">
                        <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="payment-modal-top-bar">
                    <button
                      type="button"
                      className="payment-modal-back-btn"
                      onClick={() => setView("select")}
                    >
                      <ArrowLeft size={13} weight="bold" aria-hidden="true" />
                      <span>Choose method</span>
                    </button>

                    <button
                      type="button"
                      className="payment-modal-close"
                      onClick={closeModal}
                      aria-label="Close"
                    >
                      <X size={16} weight="bold" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="payment-modal-header" style={{ marginBottom: "0.85rem" }}>
                    <div>
                      <h2 id="payment-modal-title" className="payment-modal-title">
                        Card & Mobile Pay
                      </h2>
                      <p className="payment-modal-subtitle">
                        Credit, Debit, Apple Pay, Google Pay, Revolut, etc.
                      </p>
                    </div>
                  </div>

                  <div className="payment-explainer-card">
                    <p className="payment-explainer-text">
                      Card payments are securely converted into crypto (USDC) via our payment provider to settle the $149 build fee.
                    </p>
                    <p className="payment-explainer-text">
                      <strong>No crypto wallet or exchange account required.</strong> You simply pay with your normal credit/debit card, Apple Pay, or Google Pay.
                    </p>

                    <div className="payment-explainer-notice">
                      KYC verification may be required by the provider for fiat-to-crypto (Launch48 is not affiliated).
                    </div>
                  </div>

                  <a
                    href="/api/checkout/card"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="payment-proceed-btn"
                    onClick={() => closeModal()}
                  >
                    <span>Continue to Checkout</span>
                    <span className="payment-btn__action">
                      <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                    </span>
                  </a>
                </>
              )}

              <div className="payment-modal-footer">
                <div className="payment-modal-guarantee">
                  <span>3 revisions included</span>
                  <span className="payment-modal-dot" aria-hidden="true">·</span>
                  <span>48h delivery guarantee</span>
                </div>
                <a
                  href="mailto:customers@launch48.space"
                  className="payment-modal-contact"
                >
                  Questions? <span>customers@launch48.space</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
