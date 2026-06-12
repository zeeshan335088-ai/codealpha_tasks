
import { cn } from "../../lib/utils"

const Card = ({ className, children }) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-lg overflow-hidden", className)}>
      {children}
    </div>
  )
}

const CardContent = ({ className, children }) => {
  return <div className={cn("p-6", className)}>{children}</div>
}

export { Card, CardContent }
