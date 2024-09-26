import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";

// Utility function to merge class names
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const buttonVariants = (variant?: string, size?: string) => {
  // Define inline styles for the button variants and sizes
  const styles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "#1d4ed8", // Primary color (e.g., blue)
      color: "#ffffff",           // Primary foreground color (e.g., white)
      border: "none",
    },
    destructive: {
      backgroundColor: "#dc2626", // Destructive color (e.g., red)
      color: "#ffffff",
      border: "none",
    },
    outline: {
      border: "1px solid #e5e7eb", // Border (e.g., light gray)
      backgroundColor: "#ffffff",
      color: "#111827",            // Text color (e.g., dark gray)
    },
    secondary: {
      backgroundColor: "#6b7280", // Secondary color (e.g., gray)
      color: "#ffffff",
      border: "none",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#111827",            // Text color (e.g., dark gray)
      border: "none",
    },
    link: {
      textDecoration: "underline",
      color: "#1d4ed8",            // Link color (e.g., blue)
      backgroundColor: "transparent",
      border: "none",
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    default: { height: "2.5rem", padding: "0.5rem 1rem" }, // Default size
    sm: { height: "2.25rem", padding: "0.5rem 0.75rem" },  // Small size
    lg: { height: "2.75rem", padding: "0.5rem 2rem" },     // Large size
    icon: { height: "2.5rem", width: "2.5rem" },           // Icon size
  };

  return {
    ...styles[variant || "default"],
    ...sizes[size || "default"],
  };
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const buttonStyle = buttonVariants(variant, size);

    return (
      <Comp
        style={buttonStyle}
        className={cn(className || "")} // Keep custom classNames if any
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
