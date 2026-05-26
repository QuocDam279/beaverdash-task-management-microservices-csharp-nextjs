"use client";

import * as React from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface AlertConfirmContextType {
  alert: (message: string, title?: string, variant?: "danger" | "warning" | "info" | "success") => Promise<void>;
  confirm: (
    message: string,
    options?: {
      title?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "danger" | "warning" | "info" | "success";
    }
  ) => Promise<boolean>;
}

const AlertConfirmContext = React.createContext<AlertConfirmContextType | undefined>(undefined);

export function AlertConfirmProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant: "danger" | "warning" | "info" | "success";
    showCancel: boolean;
    resolve: (value: boolean) => void;
  } | null>(null);

  const alert = React.useCallback(
    (
      message: string,
      title = "Thông báo",
      variant: "danger" | "warning" | "info" | "success" = "info"
    ) => {
      return new Promise<void>((resolve) => {
        setModalState({
          isOpen: true,
          title,
          message,
          confirmLabel: "OK",
          cancelLabel: undefined,
          variant,
          showCancel: false,
          resolve: () => resolve(),
        });
      });
    },
    []
  );

  const confirm = React.useCallback(
    (
      message: string,
      options?: {
        title?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        variant?: "danger" | "warning" | "info" | "success";
      }
    ) => {
      return new Promise<boolean>((resolve) => {
        setModalState({
          isOpen: true,
          title: options?.title || "Xác nhận",
          message,
          confirmLabel: options?.confirmLabel || "Xác nhận",
          cancelLabel: options?.cancelLabel || "Hủy bỏ",
          variant: options?.variant || "info",
          showCancel: true,
          resolve,
        });
      });
    },
    []
  );

  const handleClose = () => {
    if (modalState) {
      modalState.resolve(false);
      setModalState(null);
    }
  };

  const handleConfirm = () => {
    if (modalState) {
      modalState.resolve(true);
      setModalState(null);
    }
  };

  return (
    <AlertConfirmContext.Provider value={{ alert, confirm }}>
      {children}
      {modalState && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          confirmLabel={modalState.confirmLabel}
          cancelLabel={modalState.showCancel ? modalState.cancelLabel : undefined}
          onConfirm={handleConfirm}
          onClose={handleClose}
          variant={modalState.variant}
        />
      )}
    </AlertConfirmContext.Provider>
  );
}

export function useAlertConfirm() {
  const context = React.useContext(AlertConfirmContext);
  if (!context) {
    throw new Error("useAlertConfirm must be used within an AlertConfirmProvider");
  }
  return context;
}
