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
    "px-4 py-2 rounded-lg transition-all flex items-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed justify-center";

  const variantClasses = {
    primary: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white",
    secondary: "bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm border border-white/10",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    success: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
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
