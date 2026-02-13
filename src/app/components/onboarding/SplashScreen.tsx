import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";

export function SplashScreen() {
  const { login, skipToApp } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e4f] via-[#0F4C81] to-[#1a6bb5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl border border-white/20 p-2">
          <img src="/doz3-logo.png" alt="DOZ3" className="w-14 h-14 object-contain brightness-0 invert" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">DOZ3</h1>
        <p className="text-lg text-blue-200 font-medium mb-2">Doctor Portal</p>
        <p className="text-sm text-blue-300/80 mb-12 leading-relaxed max-w-sm">
          Write prescriptions, manage patients, and deliver medicines — all from one place.
        </p>


        {/* CTA Buttons */}
        <Button
          onClick={() => login("")}
          className="w-full bg-white text-[#0F4C81] hover:bg-blue-50 font-semibold text-base py-6 rounded-xl shadow-lg shadow-black/20 mb-3"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <button
          onClick={skipToApp}
          className="text-xl text-blue-300/70 hover:text-blue-200 transition-colors mt-2"
        >
          Skip to Dashboard (Demo)
        </button>
      </div>
    </div>
  );
}
