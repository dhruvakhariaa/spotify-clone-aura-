import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface DisplayCardProps {
  id: string;
  className?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  date: string;
  iconClassName?: string;
  titleClassName?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function DisplayCard({
  id,
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title,
  description,
  date,
  iconClassName = "bg-[#33363d] text-white",
  titleClassName = "text-[#8f9299]",
  selected,
  onSelect,
}: DisplayCardProps) {
  return (
    <motion.button
      type="button"
      layoutId={`display-card-${id}`}
      whileHover={{ y: selected ? 0 : -10, rotateX: selected ? 0 : 4 }}
      whileTap={{ scale: 0.98, rotateX: 12 }}
      onClick={() => onSelect?.(id)}
      className={cn(
        "relative flex h-36 w-[min(82vw,22rem)] select-none flex-col justify-between overflow-hidden rounded-xl border border-black/10 bg-white/[0.82] px-4 py-3 text-left text-[#202126] shadow-[0_22px_70px_rgba(0,0,0,.16)] backdrop-blur-xl transition-all duration-500 after:absolute after:-right-2 after:top-0 after:h-full after:w-20 after:bg-gradient-to-l after:from-white/70 after:to-transparent after:content-[''] hover:border-black/20 hover:bg-white/[0.92]",
        selected && "border-white/70 bg-white/[0.94] shadow-[0_18px_60px_rgba(255,255,255,.12)]",
        className
      )}
    >
      <div className="relative flex items-center gap-2">
        <span className={cn("grid size-7 place-items-center rounded-full", iconClassName)}>{icon}</span>
        <p className={cn("text-lg font-bold uppercase", titleClassName)}>{title}</p>
      </div>
      <p className="relative z-10 whitespace-nowrap text-base font-medium text-[#2d2f36]">{description}</p>
      <p className="relative z-10 text-sm font-medium text-[#9a9ca3]">{date}</p>
    </motion.button>
  );
}

export function DisplayCards({ cards, onSelect }: { cards: DisplayCardProps[]; onSelect?: (id: string) => void }) {
  return (
    <motion.div
      className="grid min-h-[360px] w-full [grid-template-areas:'stack'] place-items-center opacity-100 [perspective:1100px]"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {cards.map((card, index) => (
        <DisplayCard
          key={card.id}
          {...card}
          onSelect={onSelect}
          className={cn(
            "[grid-area:stack] transform-gpu",
            index === 0 && "z-[1] -translate-x-10 -translate-y-28 -rotate-3 opacity-25 blur-[0.2px] md:-translate-x-24",
            index === 1 && "z-[2] -translate-x-5 -translate-y-14 -rotate-2 opacity-45 md:-translate-x-12",
            index === 2 && "z-[3] translate-y-0 -rotate-1 opacity-65",
            index === 3 && "z-[4] translate-x-5 translate-y-14 rotate-1 opacity-82 md:translate-x-12",
            index === 4 && "z-[5] translate-x-10 translate-y-28 rotate-2 opacity-100 md:translate-x-24",
            card.className
          )}
        />
      ))}
    </motion.div>
  );
}
