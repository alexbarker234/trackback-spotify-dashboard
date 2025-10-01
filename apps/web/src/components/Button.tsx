import { cn } from "@/lib/utils/cn";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

interface BaseButtonProps {
  label: string;
  icon?: IconDefinition;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  title?: string;
}

interface ButtonAsButtonProps extends BaseButtonProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

interface ButtonAsLinkProps extends BaseButtonProps {
  href: string;
  type?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function Button({
  label,
  icon,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  loadingLabel,
  className,
  onClick,
  title,
  href
}: ButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed justify-center";

  const variantClasses = {
    primary: "bg-spotify-green hover:bg-spotify-green/80 text-white",
    secondary: "bg-zinc-600 hover:bg-zinc-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    ghost: "text-red-400 hover:text-red-300 hover:bg-red-900/20"
  };

  const displayLabel = loading && loadingLabel ? loadingLabel : label;

  if (href) {
    return (
      <Link href={href} title={title} className={cn(baseClasses, variantClasses[variant], className)}>
        {icon && <FontAwesomeIcon icon={icon} className={`${displayLabel ? "mr-2" : ""}`} />}
        {displayLabel}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {icon && <FontAwesomeIcon icon={icon} className={`${displayLabel ? "mr-2" : ""}`} />}
      {displayLabel}
    </button>
  );
}
