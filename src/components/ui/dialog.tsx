import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/80" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 w-[min(92vw,40rem)] max-h-[min(90dvh,44rem)] overflow-y-auto " +
            "-translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface text-fg p-5 sm:p-6 " +
            "shadow-[var(--shadow-border)] border border-border " +
            "focus:outline-none",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <DialogPrimitive.Title className="font-display text-2xl font-semibold leading-snug text-fg">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <Button variant="icon" aria-label="Fechar" className="shrink-0 -mr-1 -mt-1">
              <X className="size-5" />
            </Button>
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
