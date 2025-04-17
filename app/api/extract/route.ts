import { NextRequest, NextResponse } from "next/server";
import { mistral } from "@ai-sdk/mistral";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const schema = z.object({
  transactionDetails: z
    .array(
      z.object({
        transactionDate: z.string().describe("Date of transaction"),
        balance: z.number().describe("Balance after transaction"),
      })
    )
    .describe(
      "Array of last transaction of each day, including date and balance"
    ),
  specialTransactions: z
    .array(
      z.object({
        date: z.string().describe("Date of transaction"),
        remark: z.string().describe("Transaction remark or description"),
        withdrawalAmount: z.number().describe("Amount withdrawn"),
      })
    )
    .describe(
      "Array of special transactions like CMS, ACH, EMI, Loan EMI, Business Loan"
    ),
});

// const model = mistral("mistral-large-latest");
const model = openai("gpt-4o-2024-05-13");

export const POST = async (req: NextRequest) => {
  const formdata = await req.formData();
  const file = formdata.get("file") as File;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { object } = await generateObject({
    model,
    messages: [
      {
        role: "system",
        content: `You are a financial data extraction assistant. Extract two sets of data:

1. For each day in the bank statement, identify and extract only the last transaction's date and final balance. Format dates as YYYY-MM-DD. Ensure all balance numbers have 2 decimal places. Sort by date ascending.

2. Extract all transactions that contain any of these keywords (case insensitive):
   - CMS
   - ACH
   - EMI
   - Loan EMI
   - Business Loan
For these transactions, capture the date (YYYY-MM-DD format), full remark/description, and withdrawal amount.`
      },
      {
        role: "user",
        content: [
          {
            type: "file",
            data: fileBuffer,
            mimeType: "application/pdf",
            filename: file.name,
          },
        ],
      },
    ],
    schema,
  });

  return NextResponse.json({
    dailyBalances: object.transactionDetails,
    specialTransactions: object.specialTransactions,
  });
};
