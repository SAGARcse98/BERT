"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBertStore } from "@/lib/store";

export function ToastContainer() {
  const { toasts, dismissToast } = useBertStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const accentBar =
            toast.variant === "emerald"
              ? "border-l-4 border-l-emerald-600"
              : toast.variant === "rose"
              ? "border-l-4 border-l-rose-600"
              : "border-l-4 border-l-rose-500";

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 ${accentBar} bg-white dark:bg-zinc-900 px-5 py-4 shadow-lg`}
            >
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
