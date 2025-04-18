import { PDFUploader } from "@/components/pdf-uploader";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import React from "react";

const Page = () => {
  return (
    <div className="px-4 flex flex-col py-6 gap-8 min-h-screen">
      <div className="flex-1">
        <PDFUploader />
      </div>

      <div className="flex justify-end">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Page;
