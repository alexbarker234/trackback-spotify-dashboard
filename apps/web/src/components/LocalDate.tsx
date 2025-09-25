"use client";
import { formatDate } from "@/lib/utils/timeUtils";
import { useEffect, useState } from "react";

type LocalDateProps = {
  date: Date | string;
};

export default function LocalDate({ date }: LocalDateProps) {
  const [localDate, setLocalDate] = useState<string>("");

  useEffect(() => {
    let d: Date;
    if (typeof date === "string") {
      d = new Date(date);
    } else {
      d = date;
    }
    setLocalDate(formatDate(d.getTime()));
  }, [date]);

  return <span>{localDate}</span>;
}
