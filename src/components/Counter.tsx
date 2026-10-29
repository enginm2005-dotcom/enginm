"use client";
import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Брояч, който се анимира при показване. `null` → "[X]" (placeholder) */
export function Counter({ value, suffix = "", locale = "bg" }: { value: number | null; suffix?: string; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || value === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setN(value);
    const c = animate(0, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);

  if (value === null) return <span ref={ref}>[X]{suffix}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {/* screen reader-ите чуват крайната стойност, не всяка стъпка */}
      <span aria-hidden="true">{n.toLocaleString(locale === "bg" ? "bg-BG" : "en-US")}{suffix}</span>
      <span className="sr-only">{value.toLocaleString(locale === "bg" ? "bg-BG" : "en-US")}{suffix}</span>
    </span>
  );
}
