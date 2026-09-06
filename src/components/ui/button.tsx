import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg hover:opacity-90 rounded-md min-h-11 px-4",
        outline:
          "bg-transparent text-fg border border-border hover:border-fg/30 rounded-md min-h-11 px-4",
        ghost:
          "bg-transparent text-muted hover:text-fg hover:bg-raised rounded-md min-h-11 px-3",
        danger:
          "bg-transparent text-danger border border-danger/40 hover:bg-danger/10 rounded-md min-h-11 px-4",
        icon: "bg-transparent text-muted hover:text-fg hover:bg-raised rounded-sm size-11 p-0",
        plus: "bg-accent text-accent-fg rounded-full size-12 p-0 shadow-[var(--shadow-border)] hover:opacity-90",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
