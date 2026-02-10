import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border/50 placeholder:text-muted-foreground/70 dark:bg-secondary/50 flex field-sizing-content min-h-20 w-full rounded-lg border bg-transparent px-3 py-3 text-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-secondary/30",
        "hover:border-border hover:bg-secondary/30",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
