"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Subtle route-change entrance animation. Keyed by pathname so each navigation
 * remounts and fades/rises in. No exit animation — avoids App Router streaming
 * jank while still giving motion that signals "new page".
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col min-h-0"
    >
      {children}
    </motion.div>
  );
}
