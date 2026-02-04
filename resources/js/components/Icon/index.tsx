export interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  icon: string;
}

export function Icon({ icon, className, ... props }: IconProps) {
  return <img 
    {...props}  
    src={`/icons/${icon}.svg`}
    alt={`icon-${icon}`}
    className={`icon-component icon ${className}`}
  />;
}