import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
};

/**
 * Плавно fade-in + slide-up при скролване.
 * Чист CSS + един общ IntersectionObserver (RevealObserver) — без хидратация за всеки елемент.
 * Без JS съдържанието си остава видимо (скрива се само при html.js).
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: Props) {
  return (
    <Tag className={clsx("reveal", className)} style={delay ? ({ "--d": `${delay}s` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
