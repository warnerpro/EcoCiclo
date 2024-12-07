import { CircleHelp, icons, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent } from "react";

type IconsType = {
  [key: string]: ForwardRefExoticComponent<LucideProps>;
};

const iconsWithIndex: IconsType = icons as IconsType;

export const Icon = ({
  name,
  color,
  size,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) => {
  const LucideIcon = iconsWithIndex[name];

  return LucideIcon ? (
    <LucideIcon color={color} size={size} className={className} />
  ) : (
    <CircleHelp color={color} size={size} className={className} />
  );
};
