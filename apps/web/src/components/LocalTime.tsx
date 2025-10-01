"use client";
import { useEffect, useState } from "react";

type LocalTimeProps = {
  date: Date | string;
};

export default function LocalTime({ date }: LocalTimeProps) {
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    let d: Date;
    if (typeof date === "string") {
      d = new Date(date);
    } else {
      d = date;
    }
    setLocalTime(d.toLocaleTimeString());
  }, [date]);

  return <span>{localTime}</span>;
}
