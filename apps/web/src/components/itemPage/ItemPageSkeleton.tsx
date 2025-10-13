import BackNav from "../BackNav";

export default function ItemPageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-2 py-4 lg:px-8">
      <BackNav />
      {children}
    </div>
  );
}
