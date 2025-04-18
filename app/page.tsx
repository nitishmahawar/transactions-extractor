import { PDFUploader } from "@/components/pdf-uploader";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import React from "react";

const Page = () => {
  return (
    <div className="px-4 py-6 pb-12">
      <PDFUploader />

      <div className="absolute bottom-4 right-4">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Page;
