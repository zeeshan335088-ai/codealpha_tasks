
import { cn } from "../../lib/utils"

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all",
        className
      )}
      {...props}
    />
  )
}

export default Input
