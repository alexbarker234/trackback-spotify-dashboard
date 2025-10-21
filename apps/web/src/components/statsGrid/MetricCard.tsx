interface MetricCardProps {
  title: string;
  mainText: number | string;
  secondaryText?: string;
  gradientFrom: string;
  gradientTo: string;
  blurColor: string;
  textColor: string;
}

export default function MetricCard({
  title,
  mainText,
  secondaryText,
  gradientFrom,
  gradientTo,
  blurColor,
  textColor
}: MetricCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 backdrop-blur-sm transition-all`}
    >
      <div
        className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${blurColor} blur-2xl`}
      ></div>
      <div className="relative">
        <h3 className="mb-2 text-sm font-medium text-gray-400">{title}</h3>
        <p className={`xs:text-3xl text-2xl font-bold ${textColor}`}>
          {typeof mainText === "number" ? mainText.toLocaleString() : mainText}
        </p>
        {secondaryText && <p className="text-sm text-gray-500">{secondaryText}</p>}
      </div>
    </div>
  );
}
