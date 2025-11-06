"use client";

import { formatDate } from "@/lib/utils/timeUtils";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import styles from "./calendar.module.css";

type CalendarRangeSelectorProps = {
  onChange?: (value: [Date, Date]) => void;
  initialValue?: [Date, Date] | null;
};

export default function CalendarRangeSelector({
  onChange,
  initialValue = null
}: CalendarRangeSelectorProps) {
  const [value, setValue] = useState<[Date, Date] | null>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onInternalChange = (value: Date | Date[]) => {
    if (Array.isArray(value)) {
      const valueArray = value as [Date, Date];
      setValue(valueArray);
      onChange?.(valueArray);
    }
  };

  return (
    <div className={styles.calendarContainer}>
      <Calendar selectRange={true} onChange={onInternalChange} value={value || undefined} />
      {/* Display the selected range */}
      <div className="mt-4 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
        {value ? (
          <p className="text-center text-sm text-white">
            {formatDate(value[0].getTime())} - {formatDate(value[1].getTime())}
          </p>
        ) : (
          <p className="text-center text-sm text-gray-400">No range selected</p>
        )}
      </div>
    </div>
  );
}
