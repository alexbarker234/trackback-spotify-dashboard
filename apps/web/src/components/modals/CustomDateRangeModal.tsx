"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { useEffect, useState } from "react";
import Button from "../Button";
import CalendarRangeSelector from "../calendar/CalendarRangeSelector";
import Modal from "./Modal";

type CustomDateRangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CustomDateRangeModal({ isOpen, onClose }: CustomDateRangeModalProps) {
  const { startDate, endDate, handleCustomDateRange } = useDateRange();
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | null>(
    startDate && endDate ? [startDate, endDate] : null
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedRange(startDate && endDate ? [startDate, endDate] : null);
    }
  }, [isOpen, startDate, endDate]);

  const handleSave = () => {
    if (selectedRange) {
      handleCustomDateRange(selectedRange[0], selectedRange[1]);
      onClose();
    }
  };

  const handleRangeChange = (value: [Date, Date]) => {
    setSelectedRange(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Custom Date Range">
      <div className="flex flex-col gap-4">
        <div className="mx-auto w-full max-w-md">
          <CalendarRangeSelector onChange={handleRangeChange} initialValue={selectedRange} />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            variant="ghost"
            onClick={onClose}
            className="cursor-pointer disabled:cursor-not-allowed"
          />
          <Button
            label="Save"
            variant="primary"
            onClick={handleSave}
            disabled={!selectedRange}
            className="cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </Modal>
  );
}
