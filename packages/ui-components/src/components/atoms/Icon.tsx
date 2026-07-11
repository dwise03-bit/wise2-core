import * as React from 'react'
import * as Icons from 'lucide-react'

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: keyof typeof Icons
  size?: number | string
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, className = '', ...props }, ref) => {
    const IconComponent = Icons[name] as React.ComponentType<any>

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in lucide-react`)
      return null
    }

    return <IconComponent ref={ref} size={size} className={className} {...props} />
  }
)

Icon.displayName = 'Icon'
