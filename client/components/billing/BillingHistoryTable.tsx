"use client";

import React from "react";
import { Download, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  payments: Payment[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  PartiallyPaid: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function BillingHistoryTable({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No billing history found.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-36">
              Billing Date
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Invoice
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-32">
              Amount
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-28">
              Status
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-20 text-center">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const isPaid = payment.paymentStatus === "Paid";
            const statusLabel =
              payment.paymentStatus === "PartiallyPaid"
                ? "Partially Paid"
                : payment.paymentStatus;

            return (
              <TableRow
                key={payment.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(payment.dueDate)}
                </TableCell>

                {/* Invoice */}
                <TableCell>
                  <p className="text-sm font-semibold text-foreground">
                    Monthly Rent
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inv. #{String(payment.id).padStart(5, "0")}
                  </p>
                </TableCell>

                {/* Amount */}
                <TableCell>
                  <p className="text-sm font-bold text-foreground">
                    ${payment.amountDue.toLocaleString()}
                  </p>
                  {payment.amountPaid !== payment.amountDue && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paid: ${payment.amountPaid.toLocaleString()}
                    </p>
                  )}
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                      STATUS_STYLES[payment.paymentStatus] ??
                        "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {statusLabel}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="text-center">
                  {isPaid ? (
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Download invoice"
                    >
                      <Download className="size-4" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground/40">
                      <Lock className="size-4" />
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
