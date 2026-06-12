
import { cn } from "../../lib/utils"

const Button = ({
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const variants = {
    default: "bg-sky-600 text-white hover:bg-sky-700",
    outline: "border border-slate-300 bg-white hover:bg-slate-100 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-900"
  }

  const sizes = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-8 py-3"
  }

  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-all duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export default Button
