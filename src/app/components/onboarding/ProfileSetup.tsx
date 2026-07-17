import { useState } from "react";
import { User, Stethoscope, Building2, Award, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { useAuth } from "../../context/AuthContext";
import type { DoctorProfile } from "../../types/doctor";

const SPECIALIZATIONS = [
  "General Medicine",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopaedics",
  "Paediatrics",
  "Psychiatry",
  "Pulmonology",
  "Urology",
  "Other",
];

const QUALIFICATIONS = [
  "MBBS",
  "MBBS, MD",
  "MBBS, MS",
  "MBBS, MD (Internal Medicine)",
  "MBBS, MD (Paediatrics)",
  "MBBS, MD (Cardiology)",
  "MBBS, MD (Dermatology)",
  "MBBS, DNB",
  "BDS",
  "BHMS",
  "BAMS",
  "Other",
];

export function ProfileSetup() {
  const { completeProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    fullName: "",
    qualification: "",
    specialization: "",
    registrationNumber: "",
    experience: "",
    clinicName: "",
    clinicAddress: "",
    email: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.qualification) newErrors.qualification = "Select your qualification";
    if (!form.specialization) newErrors.specialization = "Select your specialization";
    if (!form.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
    if (!form.clinicAddress.trim()) newErrors.clinicAddress = "Clinic address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleComplete = () => {
    if (!validateStep2()) return;

    const profile: DoctorProfile = {
      id: "DOC-" + Date.now().toString(36).toUpperCase(),
      fullName: form.fullName.startsWith("Dr.") ? form.fullName : `Dr. ${form.fullName}`,
      phone: "", // Already captured during login
      email: form.email,
      qualification: form.qualification,
      specialization: form.specialization,
      registrationNumber: form.registrationNumber,
      clinicName: form.clinicName,
      clinicAddress: form.clinicAddress,
      experience: parseInt(form.experience) || 0,
    };

    completeProfile(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#0F4C81]" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? "bg-[#0F4C81] text-white" : "bg-muted text-muted-foreground"
            }`}>1</div>
            <span className="text-sm font-medium hidden sm:inline">Doctor Details</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#0F4C81]" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? "bg-[#0F4C81] text-white" : "bg-muted text-muted-foreground"
            }`}>2</div>
            <span className="text-sm font-medium hidden sm:inline">Clinic Details</span>
          </div>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl shadow-black/5 border-border/60">
          {step === 1 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#0F4C81]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Doctor Profile</h2>
                  <p className="text-xs text-muted-foreground">Your professional details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Please enter your full name"
                    className="py-5"
                  />
                  {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Qualification *</label>
                  <select
                    value={form.qualification}
                    onChange={(e) => updateField("qualification", e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
                  >
                    <option value="">Select qualification</option>
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  {errors.qualification && <p className="text-xs text-destructive mt-1">{errors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Specialization *</label>
                  <select
                    value={form.specialization}
                    onChange={(e) => updateField("specialization", e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.specialization && <p className="text-xs text-destructive mt-1">{errors.specialization}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <Award className="w-3.5 h-3.5 inline mr-1" />
                      Registration No. *
                    </label>
                    <Input
                      value={form.registrationNumber}
                      onChange={(e) => updateField("registrationNumber", e.target.value)}
                      placeholder="MCI-12345678"
                      className="py-5"
                    />
                    {errors.registrationNumber && <p className="text-xs text-destructive mt-1">{errors.registrationNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Experience (years)</label>
                    <Input
                      type="number"
                      value={form.experience}
                      onChange={(e) => updateField("experience", e.target.value)}
                      placeholder="your experience in years"
                      className="py-5"
                      min={0}
                      max={60}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full mt-6 bg-[#0F4C81] hover:bg-[#0d3f6b] text-white py-6 text-base font-semibold rounded-xl"
              >
                Next: Clinic Details
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#0F4C81]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Clinic Details</h2>
                  <p className="text-xs text-muted-foreground">Where you practice</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Clinic / Hospital Name *</label>
                  <Input
                    value={form.clinicName}
                    onChange={(e) => updateField("clinicName", e.target.value)}
                    placeholder="DOZ3 Digital Health Clinic"
                    className="py-5"
                  />
                  {errors.clinicName && <p className="text-xs text-destructive mt-1">{errors.clinicName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Clinic Address *</label>
                  <textarea
                    value={form.clinicAddress}
                    onChange={(e) => updateField("clinicAddress", e.target.value)}
                    placeholder="42, 1st Cross, Indiranagar, Bengaluru - 560038"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] resize-none h-24"
                  />
                  {errors.clinicAddress && <p className="text-xs text-destructive mt-1">{errors.clinicAddress}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email (optional)</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="dr.priya@doz3.health"
                    className="py-5"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="py-6 px-6 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-[#0F4C81] hover:bg-[#0d3f6b] text-white py-6 text-base font-semibold rounded-xl"
                >
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Complete Setup
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
