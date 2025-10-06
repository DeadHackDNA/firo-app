import React, { useState } from "react";

interface DateRangeSelectProps {
    onRangeChange: (range: string) => void;
}

export default function DateRangeSelect({ onRangeChange }: DateRangeSelectProps) {
    const [selectedRange, setSelectedRange] = useState("24h");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedRange(value);
        onRangeChange(value);
    };

    return (
        <div className="flex items-center gap-2 bg-white shadow-md rounded-lg px-3 py-2 border border-gray-200">
            <label htmlFor="date-range" className="text-sm font-medium text-gray-700">
                Range of dates:
            </label>
            <select
                id="date-range"
                value={selectedRange}
                onChange={handleChange}
                className="text-sm px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                disabled={true}
            >
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="custom">Custom</option>
            </select>
        </div>
    );
}
