"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles, Terminal, ShieldCheck, Megaphone, Settings, HelpCircle, GraduationCap, Globe2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => {
  return (
    <button
      className={`w-full flex items-center text-black gap-3 px-4 py-3 rounded-xl transition-colors ${
        active 
          ? "bg-[#D0FB3B] " 
          : " cursor-not-allowed"
      }`}
    >
      <div>
        {icon}
      </div>
      <span className={`text-[11px] font-bold tracking-wider uppercase`}>
        {label}
      </span>
    </button>
  );
};

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return toast.error("Please enter email first");
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Verification code sent to your email!");
        setIsFlipped(true);
      } else {
        toast.error(data.message || "Failed to request password reset");
      }
    } catch (error) {
      toast.error("Error requesting password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length < 6) return toast.error("Please enter valid 6-digit OTP");
    if (!formData.newPassword || formData.newPassword.length < 6) return toast.error("Password must be at least 6 characters long");
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password reset successfully! Please log in.");
        router.push("/login");
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (error) {
      toast.error("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">

      {/* ── Sidebar (desktop only) ── */}
      <div className="hidden lg:flex w-[260px] bg-[#FAFAFA] flex-col h-screen py-8 px-4 relative z-20 shadow-2xl shrink-0">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-[#C6F16D] flex items-center justify-center text-black shadow-[0_0_15px_rgba(198,241,109,0.3)]">
            <Sparkles className="w-5 h-5" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide leading-tight">ACADEMIC<br/>CURATOR</span>
            <span className="text-[9px] text-gray-500 font-bold tracking-widest mt-1">EDITORIAL JOURNEY</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavItem icon={<Sparkles className="w-4 h-4" />} label="JOURNEY" active />
          <NavItem icon={<Terminal className="w-4 h-4" />} label="COMMAND CENTER" />
          <NavItem icon={<ShieldCheck className="w-4 h-4" />} label="VERIFICATION" />
          <NavItem icon={<Megaphone className="w-4 h-4" />} label="MARKETING" />
        </nav>

        <div className="flex flex-col gap-1 mt-auto">
          <NavItem icon={<Settings className="w-4 h-4" />} label="SETTINGS" />
          <NavItem icon={<HelpCircle className="w-4 h-4" />} label="SUPPORT" />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 relative overflow-hidden flex flex-col lg:flex-row items-center justify-center">

        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#E1F0C4]/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#F4E6E6]/60 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

        {/* ── Mobile top bar ── */}
        <div className="lg:hidden flex items-center gap-3 w-full px-6 pt-6 pb-2 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-[#C6F16D] flex items-center justify-center text-black shadow-[0_0_15px_rgba(198,241,109,0.3)]">
            <Sparkles className="w-4 h-4" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wide leading-tight">ACADEMIC CURATOR</span>
            <span className="text-[9px] text-gray-500 font-bold tracking-widest">EDITORIAL JOURNEY</span>
          </div>
        </div>

        {/* ── Inner wrapper ── */}
        <div className="w-full max-w-[1000px] px-4 sm:px-8 flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 relative z-10 py-6 lg:py-0">

          {/* ── Left Text Column (hidden on mobile, shown on lg) ── */}
          <div className="hidden lg:block max-w-[460px]">
            <div className="bg-[#EDDCFF] text-[#8B48F6] text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full w-fit mb-6 uppercase shadow-sm">
              Student Portal
            </div>
            
            <h1 className="text-[64px] leading-[1.05] font-semibold text-[#1A1A1A] tracking-tight mb-6">
              Reset Your<br/>
              <span className="text-[#4D6B19] font-bold">Account</span><br/>
              <span className="font-bold">Password.</span>
            </h1>
            
            <p className="text-[#666666] text-base mb-10 leading-relaxed pr-8">
              Verify your registered identity and configure a secure new password for your student gateway.
            </p>
            
            <div className="flex gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 border border-gray-100">
                <GraduationCap className="w-6 h-6 text-[#4D6B19] mb-3" />
                <div className="text-2xl font-bold text-[#1A1A1A] mb-1">1,200+</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">GLOBAL PARTNERS</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 border border-gray-100">
                <Globe2 className="w-6 h-6 text-[#8B48F6] mb-3" />
                <div className="text-2xl font-bold text-[#1A1A1A] mb-1">45</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">COUNTRIES REACHED</div>
              </div>
            </div>
          </div>

          {/* ── Mobile hero text ── */}
          <div className="lg:hidden w-full text-center px-2">
            <div className="bg-[#EDDCFF] text-[#8B48F6] text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full w-fit mx-auto mb-4 uppercase shadow-sm">
              Student Portal
            </div>
            <h1 className="text-[36px] sm:text-[48px] leading-[1.1] font-semibold text-[#1A1A1A] tracking-tight mb-3">
              Reset Your{" "}
              <span className="text-[#4D6B19] font-bold">Account</span>{" "}
              <span className="font-bold">Password.</span>
            </h1>
            <p className="text-[#666666] text-sm sm:text-base mb-6 leading-relaxed max-w-[480px] mx-auto">
              Verify your registered identity and configure a secure new password for your student gateway.
            </p>
          </div>

          {/* ── Flipping Card Mechanism ── */}
          <div className="w-full max-w-[420px] lg:w-[400px] lg:max-w-none min-h-[500px] lg:h-[580px] shrink-0 [perspective:1500px]">
            <div className={`relative w-full h-full min-h-[500px] lg:min-h-0 transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* FRONT SIDE (Request Reset Code) */}
              <div className={`absolute w-full h-full [backface-visibility:hidden] bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col justify-between`}>
                <div>
                  <button 
                    onClick={() => router.push("/")}
                    className="flex items-center gap-1 text-[13px] text-[#808080] hover:text-[#1A1A1A] transition-colors mb-6 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>
                  <div className="text-left mb-6">
                    <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2">Forgot Password?</h2>
                    <p className="text-[#666666] text-[13px]">Enter your email and we'll send you a verification code (OTP) to reset your password.</p>
                  </div>
                  
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#666666] tracking-widest ml-1">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        required
                        placeholder="student@university.edu"
                        className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C6F16D] hover:bg-[#b5e359] text-[#1A1A1A] font-semibold py-3.5 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code (OTP)"}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="text-center text-[13px] text-[#666666] mt-4">
                  Remember your password?{" "}
                  <button 
                    onClick={() => router.push("/")} 
                    className="text-[#8B48F6] font-semibold hover:underline"
                  >
                    Log In
                  </button>
                </div>
              </div>
              
              {/* BACK SIDE (Enter Code & Reset Password) */}
              <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col justify-between">
                <div>
                  <button 
                    onClick={() => setIsFlipped(false)}
                    className="flex items-center gap-1 text-[13px] text-[#808080] hover:text-[#1A1A1A] transition-colors mb-6 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change Email
                  </button>
                  <div className="text-left mb-6">
                    <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2">Check your email</h2>
                    <p className="text-[#666666] text-[13px]">
                      We've sent a 6-digit verification code to <span className="font-semibold text-black">{formData.email}</span>.
                    </p>
                  </div>
                  
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#666666] tracking-widest ml-1">ENTER 6-DIGIT CODE</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="• • • • • •"
                        className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[20px] text-center tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all font-semibold"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#666666] tracking-widest ml-1">NEW PASSWORD</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || formData.otp.length < 6 || formData.newPassword.length < 6}
                        className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-3.5 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-black/10"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset & Continue"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="text-center text-[13px] text-[#808080] mt-4">
                  Didn't receive the code?{" "}
                  <button onClick={handleRequestReset} className="text-[#1A1A1A] font-semibold hover:underline">
                    Resend
                  </button>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
