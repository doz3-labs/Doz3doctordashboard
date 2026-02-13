import { useState } from "react";
import { ArrowLeft, Phone, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "../../context/AuthContext";

export function LoginScreen() {
  const { onboardingStep, login, verifyOtp, skipToApp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    login(phone);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setError("");
    const success = verifyOtp(otp);
    if (!success) {
      setError("Invalid OTP. Please try again.");
    }
  };

  const isOtpStep = onboardingStep === "otp";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#1a6bb5] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 p-1.5">
            <img src={`${import.meta.env.BASE_URL}doz3-logo.png`} alt="DOZ3" className="w-10 h-10 object-contain brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to DOZ3</h1>
          <p className="text-sm text-muted-foreground mt-1">Doctor Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-border/60 p-6 sm:p-8">
          {!isOtpStep ? (
            <>
              {/* Phone Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">+91</span>
                    <div className="w-px h-5 bg-border" />
                  </div>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError("");
                    }}
                    placeholder="Enter your phone number"
                    className="pl-20 py-6 text-base"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  We'll send a 6-digit OTP to verify your number
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive mb-4">{error}</p>
              )}

              <Button
                onClick={handleSendOtp}
                className="w-full bg-[#0F4C81] hover:bg-[#0d3f6b] text-white py-6 text-base font-semibold rounded-xl"
                disabled={phone.length < 10}
              >
                Send OTP
              </Button>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <button
                onClick={() => login("")}
                className="flex items-center gap-1.5 text-xl text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change number
              </button>

              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[#0F4C81]" />
                  <label className="text-sm font-semibold text-foreground">
                    Enter OTP
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Sent to +91 {phone.slice(0, 2)}****{phone.slice(-2)}
                </p>
              </div>

              <div className="flex gap-2 mb-6 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newOtp = otp.split("");
                      newOtp[i] = val;
                      setOtp(newOtp.join("").slice(0, 6));
                      setError("");
                      // Auto-focus next input
                      if (val && i < 5) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        prev?.focus();
                      }
                    }}
                    className="w-11 h-13 text-center text-xl font-bold border-2 border-border rounded-lg focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all bg-muted/30"
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive mb-4 text-center">{error}</p>
              )}

              <Button
                onClick={handleVerifyOtp}
                className="w-full bg-[#0F4C81] hover:bg-[#0d3f6b] text-white py-6 text-base font-semibold rounded-xl"
                disabled={otp.length !== 6}
              >
                Verify & Continue
              </Button>

              <button className="w-full text-center text-sm text-[#0F4C81] hover:underline mt-4">
                Resend OTP
              </button>
            </>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-6">
          <button
            onClick={skipToApp}
            className="text-xl text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Skip to Dashboard (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
