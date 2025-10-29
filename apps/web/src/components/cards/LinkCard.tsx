import { IconDefinition, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function LinkCard({
  href,
  title,
  description,
  icon
}: {
  href: string;
  title: string;
  description: string;
  icon: IconDefinition;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 backdrop-blur-sm transition-all duration-300 hover:from-purple-900/30 hover:to-pink-900/30"
    >
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center space-x-4">
          <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-2xl transition-transform duration-300 group-hover:scale-110">
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-100 transition-colors duration-300 group-hover:text-purple-300">
              {title}
            </h3>
            <p className="text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
              {description}
            </p>
          </div>
        </div>
        <div className="text-2xl text-purple-400 transition-colors duration-300 group-hover:text-purple-300">
          <FontAwesomeIcon icon={faArrowRight} />
        </div>
      </div>
    </Link>
  );
}
