"use client";

import {
  AlertCircleIcon,
  PaperclipIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Spinner } from "./spinner";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { exportToCSV, formatINR } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";

export const PDFUploader = () => {
  const maxSize = 10 * 1024 * 1024; // 10MB default

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      clearFiles,
    },
  ] = useFileUpload({
    maxSize,
    multiple: false,
    accept: "application/pdf",
  });

  const file = files[0];

  const { mutate, isPending, data } = useMutation({
    mutationFn: async () => {
      const formdata = new FormData();
      if (file) {
        formdata.append("file", file.file as File);
      }
      const { data } = await axios.post("/api/extract", file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data as {
        dailyBalances: {
          transactionDate: string;
          balance: number;
        }[];
        specialTransactions: {
          date: string;
          remark: string;
          withdrawalAmount: number;
        }[];
      };
    },
    onSuccess: () => {
      clearFiles();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleUpload = () => {
    mutate();
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-6xl mx-auto">
      <div className="space-y-4 max-w-md mx-auto w-full">
        <h1 className="text-xl md:text-2xl font-semibold">
          Transactions Extractor
        </h1>
        {/* Drop area */}
        <div
          role="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload file"
            disabled={Boolean(file)}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <UploadIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">Upload file</p>
            <p className="text-muted-foreground text-xs">
              Drag & drop or click to browse (max. {formatBytes(maxSize)})
            </p>
          </div>
        </div>

        {errors.length > 0 && (
          <div
            className="text-destructive flex items-center gap-1 text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}

        {/* File list */}
        {file && (
          <div className="space-y-2">
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <PaperclipIcon
                  className="size-4 shrink-0 opacity-60"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">
                    {file.file.name}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => removeFile(files[0]?.id)}
                aria-label="Remove file"
                disabled={isPending}
              >
                <XIcon className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button disabled={isPending || !file} onClick={handleUpload}>
            {isPending && <Spinner />} Upload
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg md:text-xl">
                Daily Balances
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCSV(data.dailyBalances, "daily-balances")
                }
              >
                <DownloadIcon />
                Download CSV
              </Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dailyBalances.map((txn, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {txn.transactionDate}
                      </TableCell>
                      <TableCell>{formatINR(txn.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg md:text-xl">
                Special Transactions
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCSV(data.specialTransactions, "special-transactions")
                }
              >
                <DownloadIcon />
                Download CSV
              </Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>EMI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.specialTransactions.map((txn, i) => (
                    <TableRow key={i}>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell>{txn.remark}</TableCell>
                      <TableCell>{formatINR(txn.withdrawalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
