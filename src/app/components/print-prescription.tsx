interface PrintPrescriptionProps {
  patientName: string;
  patientAge: number;
  patientWeight: number;
  patientHistory: string;
  symptoms: string;
  medications: Array<{
    drug: string;
    dosage: string;
    morning: number;
    afternoon: number;
    night: number;
  }>;
  additionalInstructions?: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegistration: string;
  clinicName: string;
  clinicAddress: string;
  clinicContact: string;
}

export function PrintPrescription({
  patientName,
  patientAge,
  patientWeight,
  patientHistory,
  symptoms,
  medications,
  additionalInstructions,
  doctorName,
  doctorQualification,
  doctorRegistration,
  clinicName,
  clinicAddress,
  clinicContact,
}: PrintPrescriptionProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const prescriptionNumber = `RX-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

  return (
    <div className="print-only fixed inset-0 bg-white p-12 hidden print:block">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
            }
            .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            @page {
              margin: 0.5cm;
              size: A4;
            }
          }
        `}
      </style>

      {/* Official prescription header */}
      <div className="border-b-4 border-[#0F4C81] pb-4 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/doz3-logo.png" alt="DOZ3" className="w-10 h-10 object-contain" />
          <h1 className="text-3xl font-bold text-[#0F4C81] tracking-tight">
            DOZ3 Digital Health
          </h1>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-gray-800">{doctorName}</p>
            <p className="text-sm text-gray-600">{doctorQualification}</p>
            <p className="text-xs text-gray-500">Reg. No: {doctorRegistration}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{clinicName}</p>
            <p className="text-sm text-gray-600">{clinicAddress}</p>
            <p className="text-xs text-gray-500">{clinicContact}</p>
          </div>
        </div>
      </div>

      {/* Prescription Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Date:</span> {formattedDate}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Rx No:</span> {prescriptionNumber}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Patient Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <span className="font-semibold">Name:</span> {patientName}
            </p>
            <p>
              <span className="font-semibold">Age:</span> {patientAge} years
            </p>
            <p>
              <span className="font-semibold">Weight:</span> {patientWeight} kg
            </p>
            <p>
              <span className="font-semibold">History:</span> {patientHistory}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm">
            <span className="font-semibold">Chief Complaints:</span> {symptoms}
          </p>
        </div>
      </div>

      {/* Medications */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#0F4C81] mb-3 pb-2 border-b-2 border-gray-300">
          ℞ Prescription
        </h3>
        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="border-l-4 border-[#0F4C81] pl-4 py-2">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-lg font-semibold text-gray-900">{index + 1}.</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-semibold text-gray-900">{med.drug}</span>
                    <span className="text-base text-gray-700">{med.dosage}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm font-medium text-gray-600">Frequency: </span>
                    <span className="text-base font-semibold text-[#0F4C81]">
                      {med.morning}-{med.afternoon}-{med.night}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Morning - Afternoon - Night)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">After meals with water</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Instructions */}
      {additionalInstructions && (
        <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Additional Instructions:</h4>
          <p className="text-sm text-gray-700">{additionalInstructions}</p>
        </div>
      )}

      {/* General Instructions */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">General Instructions:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Take medications regularly as prescribed</li>
          <li>Maintain a healthy diet and regular exercise routine</li>
          <li>Monitor blood sugar levels regularly</li>
          <li>Follow up after 15 days or if symptoms persist</li>
        </ul>
      </div>

      {/* Signature */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600 mb-1">Next Follow-up:</p>
            <p className="text-base font-semibold text-gray-800">
              {new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 mb-2"></div>
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold text-gray-900">{doctorName}</p>
              <p className="text-sm text-gray-600">{doctorQualification}</p>
              <p className="text-xs text-gray-500">{doctorRegistration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>This is a computer-generated prescription and is valid with digital signature.</p>
        <p className="mt-1">For queries, contact: {clinicContact}</p>
      </div>
    </div>
  );
}
