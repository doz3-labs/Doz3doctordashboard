import { useState } from "react";
import {
  User,
  Building2,
  Award,
  Phone,
  Mail,
  Stethoscope,
  LogOut,
  Save,
  Shield,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Settings() {
  const { doctor, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fullName: doctor?.fullName ?? "",
    email: doctor?.email ?? "",
    qualification: doctor?.qualification ?? "",
    specialization: doctor?.specialization ?? "",
    registrationNumber: doctor?.registrationNumber ?? "",
    experience: doctor?.experience?.toString() ?? "",
    clinicName: doctor?.clinicName ?? "",
    clinicAddress: doctor?.clinicAddress ?? "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfile({
      fullName: form.fullName,
      email: form.email,
      qualification: form.qualification,
      specialization: form.specialization,
      registrationNumber: form.registrationNumber,
      experience: parseInt(form.experience) || 0,
      clinicName: form.clinicName,
      clinicAddress: form.clinicAddress,
    });
    setIsEditing(false);
    setSaved(true);
    toast.success("Profile updated successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-foreground font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-emerald-600 font-medium animate-in fade-in">Profile saved!</span>
            )}
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{doctor?.fullName ?? "Doctor"}</h3>
                  <p className="text-sm text-muted-foreground">{doctor?.qualification}</p>
                  <p className="text-sm text-muted-foreground">{doctor?.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsField
                  icon={User}
                  label="Full Name"
                  value={form.fullName}
                  onChange={(v) => updateField("fullName", v)}
                  editable={isEditing}
                />
                <SettingsField
                  icon={Mail}
                  label="Email"
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  editable={isEditing}
                />
                <SettingsField
                  icon={Phone}
                  label="Phone"
                  value={doctor?.phone ?? "Not set"}
                  onChange={() => {}}
                  editable={false}
                  hint="Phone number cannot be changed"
                />
                <SettingsField
                  icon={Award}
                  label="Registration Number"
                  value={form.registrationNumber}
                  onChange={(v) => updateField("registrationNumber", v)}
                  editable={isEditing}
                />
                <SettingsField
                  icon={Stethoscope}
                  label="Qualification"
                  value={form.qualification}
                  onChange={(v) => updateField("qualification", v)}
                  editable={isEditing}
                />
                <SettingsField
                  icon={Stethoscope}
                  label="Specialization"
                  value={form.specialization}
                  onChange={(v) => updateField("specialization", v)}
                  editable={isEditing}
                />
              </div>
            </Card>

            {/* Clinic Details */}
            <Card className="p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Clinic Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <SettingsField
                  icon={Building2}
                  label="Clinic / Hospital Name"
                  value={form.clinicName}
                  onChange={(v) => updateField("clinicName", v)}
                  editable={isEditing}
                />
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Clinic Address</label>
                  {isEditing ? (
                    <textarea
                      value={form.clinicAddress}
                      onChange={(e) => updateField("clinicAddress", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  ) : (
                    <p className="text-sm text-foreground py-2">{form.clinicAddress || "Not set"}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-200">
              <h3 className="text-base font-semibold text-red-600 mb-2">Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Logging out will clear your session. You'll need to verify your phone number again.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Logged out successfully");
                  setTimeout(logout, 500);
                }}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsField({
  icon: Icon,
  label,
  value,
  onChange,
  editable,
  hint,
}: {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {editable ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="py-5" />
      ) : (
        <p className="text-sm text-foreground py-2">{value || "Not set"}</p>
      )}
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
