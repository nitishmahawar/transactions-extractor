import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]);

  // Convert headers to more readable format
  const prettyHeaders = headers.map((header) => {
    if (header === "transactionDate") return "Date";
    if (header === "withdrawalAmount") return "Amount";
    return header.charAt(0).toUpperCase() + header.slice(1);
  });

  const csvRows = [
    prettyHeaders.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];

          // Format dates as DD/MM/YYYY
          if (header === "transactionDate" || header === "date") {
            if (value && typeof value === "string") {
              try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  // Format as DD/MM/YYYY
                  const day = date.getDate().toString().padStart(2, "0");
                  const month = (date.getMonth() + 1)
                    .toString()
                    .padStart(2, "0");
                  const year = date.getFullYear();
                  return `"${day}/${month}/${year}"`;
                }
              } catch (e) {
                // Fall back to original if parsing fails
              }
            }
            // If we couldn't parse the date or format it, use original with text formatting
            if (value && typeof value === "string" && value.includes("-")) {
              // Try to convert YYYY-MM-DD to DD/MM/YYYY directly
              const parts = value.split("-");
              if (parts.length === 3) {
                return `"${parts[2]}/${parts[1]}/${parts[0]}"`;
              }
            }
            return `"${value || ""}"`;
          }

          if (typeof value === "number") {
            return value.toString();
          }

          // Escape quotes and wrap in quotes for other string values
          return `"${String(value || "").replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  const BOM = "\uFEFF";
  const csvContent = BOM + csvRows.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
