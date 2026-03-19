"use client";

import { useEffect, useState, useCallback, createContext, useContext, useRef } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    requestAnimationFrame(() => setVisible(true));
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setVisible(false);
    setTimeout(() => {
      resolveRef.current?.(result);
      setOptions(null);
    }, 200);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div
          className={`fixed inset-0 z-[90] flex items-center justify-center transition-all duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => handleClose(false)}
          />
          {/* Dialog */}
          <div
            className={`relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-200 ${
              visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="p-6">
              {/* Icon */}
              <div
                className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  options.variant === "danger"
                    ? "bg-red-100"
                    : options.variant === "warning"
                    ? "bg-amber-100"
                    : "bg-blue-100"
                }`}
              >
                <span
                  className={`text-xl ${
                    options.variant === "danger"
                      ? "text-red-600"
                      : options.variant === "warning"
                      ? "text-amber-600"
                      : "text-blue-600"
                  }`}
                >
                  {options.variant === "danger"
                    ? "\u2717"
                    : options.variant === "warning"
                    ? "\u26A0"
                    : "?"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {options.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
                {options.message}
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {options.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
                  options.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : options.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {options.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
