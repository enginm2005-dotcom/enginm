"use client";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/** Зарежда само нужната част от Framer Motion и уважава "намалено движение" на ОС */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
