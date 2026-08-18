"user client"

//* Components Imports
import Input from "../ui/input"

//* Libraries Imports
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"

export function InputPassword({ className, ...props }: React.ComponentProps<"input">) {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <div className="relative">
            <Input 
                className={className}
                type={showPassword ? "text" : "password"}
                {...props}
            />
            {showPassword ? (
                <EyeOffIcon
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground"
                    onClick={() => setShowPassword(false)}
                />
            ) : (
                <EyeIcon
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground"
                    onClick={() => setShowPassword(true)}
                />
            )}
        </div>

    )
}
