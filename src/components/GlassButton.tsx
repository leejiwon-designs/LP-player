import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

const glassButtonStyles = `
.glass-button-wrap {
  z-index: 20;
  position: relative;
  display: inline-flex;
}

.glass-button {
  -webkit-tap-highlight-color: transparent;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 34px;
  min-height: 50px;
  cursor: pointer;
}

/* Elevated Tactile Hover State */
.glass-button:hover {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.18);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 16px 32px -6px rgba(0, 0, 0, 0.15),
    0 6px 14px -3px rgba(0, 0, 0, 0.08),
    inset 0 1px 1.5px rgba(255, 255, 255, 1);
}

/* Tactile Active Press */
.glass-button:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: 
    0 2px 6px -1px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(0, 0, 0, 0.06);
  background: #f7f7f9;
}

.glass-button-text {
  font-family: 'Doto', monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #1a191d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
}
`;

const glassButtonVariants = cva(
  "relative cursor-pointer rounded-full transition-all select-none outline-none",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface GlassButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, ...props }, ref) => {
    return (
      <>
        <style>{glassButtonStyles}</style>
        <div className={cn("glass-button-wrap cursor-pointer rounded-full", className)}>
          <button
            className={cn("glass-button", glassButtonVariants({ size }))}
            ref={ref}
            {...props}
          >
            <span className={cn("glass-button-text", contentClassName)}>
              {children}
            </span>
          </button>
        </div>
      </>
    );
  },
);

GlassButton.displayName = "GlassButton";

export default GlassButton;
