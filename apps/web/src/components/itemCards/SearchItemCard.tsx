import ItemCard from "./ItemCard";

interface SearchItemCardProps {
  href: string;
  imageUrl: string | null;
  title: string;
  subtitle: string;
}

export default function SearchItemCard({ href, imageUrl, title, subtitle }: SearchItemCardProps) {
  return <ItemCard href={href} imageUrl={imageUrl} title={title} subtitle={subtitle} />;
}
