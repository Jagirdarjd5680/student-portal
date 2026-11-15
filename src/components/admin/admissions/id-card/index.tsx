"use client";

import { Button } from "@/components/ui/button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import type { Admission } from "@/types";
import { useState } from "react";
import {
  AadhaarCard,
  DrivingLicenseCard,
  GenericIdCard,
  PanCard,
  PassportCard,
  VoterIdCard,
} from "./cards";
import { toCardData } from "./utils";

const CARDS: Record<string, typeof AadhaarCard> = {
  "Aadhar Card": AadhaarCard,
  "PAN Card": PanCard,
  "Driving License": DrivingLicenseCard,
  "Voter ID": VoterIdCard,
  Passport: PassportCard,
};

// View-only preview of the selected identity proof, filled with the student's
// details. Number is masked until "Show" is pressed. Never part of any PDF.
export default function IdProofCard({ admission }: { admission: Admission }) {
  const [reveal, setReveal] = useState(false);

  if (!admission.identity_proof && !admission.identity_number) {
    return (
      <div className="flex aspect-[86/54] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        No identity proof added
      </div>
    );
  }

  const Card = CARDS[admission.identity_proof || ""] || GenericIdCard;
  return (
    <div className="space-y-2">
      <Card d={toCardData(admission, reveal)} />
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{admission.identity_proof || "Identity Proof"}</span>
        {admission.identity_number && (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setReveal((v) => !v)}
          >
            {reveal ? (
              <EyeCloseIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4 fill-current" />
            )}
            {reveal ? "Hide number" : "Show number"}
          </Button>
        )}
      </div>
    </div>
  );
}
