import { CheckCircle2, Printer } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { PrintPrescription } from "./print-prescription";
import type { PrescriptionData } from "../types/prescription";

const DEFAULT_ORDER = {
  orderAmount: 450,
  patientName: "Rajesh Kumar",
} as const;

interface OrderConfirmationProps {
  onReturnToDashboard: () => void;
  onNavigate: (screen: "dashboard" | "patient-profile" | "ai-prescriber" | "confirmation") => void;
  prescriptionData?: PrescriptionData | null;
  hideSidebar?: boolean;
}

export function OrderConfirmation({ onReturnToDashboard, onNavigate, prescriptionData, hideSidebar }: OrderConfirmationProps) {
  const data = prescriptionData ?? {
    ...DEFAULT_ORDER,
    patientName: DEFAULT_ORDER.patientName,
    patientAge: 58,
    patientWeight: 72,
    patientHistory: "Hypertension, Type 2 Diabetes",
    symptoms: "Uncontrolled sugar levels, dizziness",
    medications: [
      { drug: "Glimepiride", dosage: "1mg", morning: 1, afternoon: 0, night: 0 },
      { drug: "Metformin", dosage: "500mg", morning: 1, afternoon: 0, night: 1 },
    ],
    orderAmount: DEFAULT_ORDER.orderAmount,
  };
  const patientName = data.patientName;
  const orderAmount = data.orderAmount;

  return (
    <>
      {/* Print-only prescription — MUST be outside the no-print wrapper */}
      <PrintPrescription
        patientName={data.patientName}
        patientAge={data.patientAge}
        patientWeight={data.patientWeight}
        patientHistory={data.patientHistory}
        symptoms={data.symptoms}
        medications={data.medications}
        additionalInstructions={data.additionalInstructions}
        doctorName="Dr. Priya Sharma"
        doctorQualification="MBBS, MD (Internal Medicine)"
        doctorRegistration="KMC-12345678"
        clinicName="DOZ3 Digital Health Clinic"
        clinicAddress="42, 1st Cross, Indiranagar, Bengaluru - 560038"
        clinicContact="+91-80-4567-8901 | care@doz3.health"
      />

      <div className="flex h-full bg-background items-center justify-center no-print">
        <Card className="max-w-lg w-full border border-border shadow-2xl">
          <div className="p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-accent" />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Prescription Sent Successfully!
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Prescription sent to {patientName.split(" ")[0]}'s App for Approval
            </p>

            {/* Order Details */}
            <div className="bg-muted/20 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Patient</span>
                <span className="text-sm font-medium text-foreground">{patientName}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Order Payment</span>
                <span className="text-lg font-semibold text-amber-600">Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-xl font-semibold text-foreground">₹{orderAmount}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              You will be notified once the patient approves and payment is completed.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Prescription
              </Button>
              <Button
                onClick={onReturnToDashboard}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
