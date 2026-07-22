"use client";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, Terminal, ShieldCheck, Megaphone, Settings, HelpCircle, GraduationCap, Globe2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => {
  return (
    <button
      className={`w-full flex items-center text-black gap-3 px-4 py-3 rounded-xl transition-colors ${
        active 
          ? "bg-[#D0FB3B]" 
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

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'register' | 'otp'>('login');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    otp: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as any;
      if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.email) return toast.error("Please enter email first");
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("OTP sent to your email!");
        setView('otp');
        setIsFlipped(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error("Please enter email and password");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        // NextAuth v5: result.error contains the thrown error message
        const msg = result.error === "CredentialsSignin"
          ? "Invalid credentials. Please check your email and password."
          : (result.error || "Login failed");
        toast.error(msg);
      } else {
        toast.success("Welcome back!");
        const session = await getSession();
        const user = session?.user as any;
        if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      toast.error("Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      return toast.error("Please fill all fields");
    }
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account created! Verify your email.");
        setView('otp');
        setIsFlipped(true);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Error during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length < 6) return toast.error("Please enter valid OTP");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        otp: formData.otp,
        redirect: false,
      });
      if (result?.error) {
        const msg = result.error === "CredentialsSignin"
          ? "Invalid or expired OTP. Please try again."
          : (result.error || "Verification failed");
        toast.error(msg);
      } else {
        toast.success("Verification successful!");
        const session = await getSession();
        const user = session?.user as any;
        if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      toast.error("Verification error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 text-[#8B48F6] animate-spin" />
      </div>
    );
  }

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

        {/* ── Mobile top bar (replaces sidebar on small screens) ── */}
        <div className="lg:hidden flex items-center gap-3 w-full px-6 pt-6 pb-2 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-[#C6F16D] flex items-center justify-center text-black shadow-[0_0_15px_rgba(198,241,109,0.3)]">
            <Sparkles className="w-4 h-4" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wide leading-tight">ACADEMIC CURATOR</span>
            <span className="text-[9px] text-gray-500 font-bold tracking-widest">EDITORIAL JOURNEY</span>
          </div>
        </div>

        {/* ── Inner wrapper: stacked on mobile, side-by-side on lg ── */}
        <div className="w-full max-w-[1000px] px-4 sm:px-8 flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 relative z-10 py-6 lg:py-0">

          {/* ── Left Text Column (hidden on mobile, shown on lg) ── */}
          <div className="hidden lg:block max-w-[460px]">
            <div className="bg-[#EDDCFF] text-[#8B48F6] text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full w-fit mb-6 uppercase shadow-sm">
              Student Portal
            </div>
            
            <h1 className="text-[64px] leading-[1.05] font-semibold text-[#1A1A1A] tracking-tight mb-6">
              Begin Your<br/>
              <span className="text-[#4D6B19] font-bold">Editorial</span><br/>
              <span className="font-bold">Journey.</span>
            </h1>
            
            <p className="text-[#666666] text-base mb-10 leading-relaxed pr-8">
              Access your curated internship paths and academic milestones through our secure student gateway.
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

          {/* ── Mobile hero text (above the card, visible only on mobile/tablet) ── */}
          <div className="lg:hidden w-full text-center px-2">
            <div className="bg-[#EDDCFF] text-[#8B48F6] text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full w-fit mx-auto mb-4 uppercase shadow-sm">
              Student Portal
            </div>
            <h1 className="text-[36px] sm:text-[48px] leading-[1.1] font-semibold text-[#1A1A1A] tracking-tight mb-3">
              Begin Your{" "}
              <span className="text-[#4D6B19] font-bold">Editorial</span>{" "}
              <span className="font-bold">Journey.</span>
            </h1>
            <p className="text-[#666666] text-sm sm:text-base mb-6 leading-relaxed max-w-[480px] mx-auto">
              Access your curated internship paths and academic milestones through our secure student gateway.
            </p>
            {/* Compact stats row on mobile */}
            <div className="flex gap-3 justify-center mb-6">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-[#4D6B19] shrink-0" />
                <div>
                  <div className="text-lg font-bold text-[#1A1A1A] leading-none">1,200+</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Partners</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-3">
                <Globe2 className="w-5 h-5 text-[#8B48F6] shrink-0" />
                <div>
                  <div className="text-lg font-bold text-[#1A1A1A] leading-none">45</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Login Card – Flipping Card Mechanism ── */}
          <div className="w-full max-w-[420px] lg:w-[400px] lg:max-w-none min-h-[600px] lg:h-[680px] shrink-0 [perspective:1500px]">
            <div className={`relative w-full h-full min-h-[600px] lg:min-h-0 transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* FRONT SIDE (Login or Register) */}
              <div className={`absolute w-full h-full [backface-visibility:hidden] bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col`}>
                
                {view === 'login' && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2">Welcome back</h2>
                      <p className="text-[#666666] text-[13px]">Select your preferred login method</p>
                    </div>
                    
                    <button 
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      className="w-full flex items-center justify-center gap-3 rounded-[14px] border border-gray-200 bg-white px-4 py-3.5 text-[14px] font-semibold text-[#333333] hover:bg-gray-50 hover:border-gray-300 transition-all mb-6 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                    
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] font-bold tracking-widest text-[#B3B3B3]">
                        <span className="bg-white px-4">OR LOGIN WITH EMAIL</span>
                      </div>
                    </div>
                    
                    <form onSubmit={handlePasswordLogin} className="space-y-4 flex-1">
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
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold text-[#666666] tracking-widest uppercase">PASSWORD (OPTIONAL FOR OTP)</label>
                          <Link 
                            href="/forgot-password" 
                            className="text-[10px] font-bold text-[#8B48F6] hover:underline uppercase tracking-wider"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                      
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="w-full bg-[#C6F16D] hover:bg-[#b5e359] text-[#1A1A1A] font-semibold py-3.5 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Login Code (OTP)"}
                        </button>
                        
                        <button
                          type="submit"
                          disabled={loading || !formData.password}
                          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#1A1A1A] font-semibold py-3.5 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          Login with Password
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-[13px] text-[#666666]">
                        Don't have an account?{" "}
                        <button 
                          onClick={() => setView('register')} 
                          className="text-[#8B48F6] font-semibold hover:underline"
                        >
                          Sign Up
                        </button>
                      </p>
                    </div>
                  </>
                )}

                {view === 'register' && (
                  <div className="flex flex-col h-full">
                    <div className="text-center mb-4">
                      <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-1">Create Account</h2>
                      <p className="text-[#666666] text-[13px]">Join our editorial journey today</p>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      className="w-full flex items-center justify-center gap-3 rounded-[14px] border border-gray-200 bg-white px-4 py-3 text-[14px] font-semibold text-[#333333] hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign Up with Google
                    </button>
                    
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] font-bold tracking-widest text-[#B3B3B3]">
                        <span className="bg-white px-3">OR SIGN UP WITH EMAIL</span>
                      </div>
                    </div>
                    
                    <form onSubmit={handleRegister} className="space-y-4 flex-1">
                      <div className="flex gap-3">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-[10px] font-bold text-[#666666] tracking-widest ml-1">FIRST NAME</label>
                          <input
                            type="text"
                            required
                            placeholder="John"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <label className="text-[10px] font-bold text-[#666666] tracking-widest ml-1">LAST NAME</label>
                          <input
                            type="text"
                            required
                            placeholder="Doe"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

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
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#666666] tracking-widest ml-1">PASSWORD</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full bg-[#F5F5F5] border border-transparent rounded-[14px] py-3.5 px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#8B48F6] hover:bg-[#7a3be0] text-white font-semibold py-3.5 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up & Verify"}
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-[13px] text-[#666666]">
                        Already have an account?{" "}
                        <button 
                          onClick={() => setView('login')} 
                          className="text-[#4D6B19] font-semibold hover:underline"
                        >
                          Log In
                        </button>
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
              
              {/* BACK SIDE (OTP) */}
              <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col justify-between">
                
                <div className="text-left mb-8">
                  <button 
                    onClick={() => {
                      setIsFlipped(false);
                      setTimeout(() => setView('login'), 500);
                    }}
                    className="flex items-center gap-1 text-[13px] text-[#808080] hover:text-[#1A1A1A] transition-colors mb-6 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-[26px] font-semibold text-[#1A1A1A] mb-2">Check your email</h2>
                  <p className="text-[#666666] text-[14px] leading-relaxed">
                    We've sent a 6-digit verification code to <span className="font-semibold text-black">{formData.email || "your email"}</span>.
                  </p>
                </div>
                
                <form onSubmit={handleOtpVerify} className="space-y-8 flex-1 flex flex-col justify-center">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#666666] tracking-widest text-center block mb-4">ENTER 6-DIGIT CODE</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="• • • • • •"
                      className="w-full bg-[#F5F5F5] border border-transparent rounded-[16px] py-5 px-6 text-[28px] text-center tracking-[0.5em] text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#C6F16D]/60 focus:bg-white focus:border-[#C6F16D]/30 transition-all font-semibold"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || formData.otp.length < 6}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-4 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-black/10"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                  </button>
                </form>

                <div className="mt-8 text-center text-[13px] text-[#808080]">
                  Didn't receive the code?{" "}
                  <button onClick={handleSendOtp} className="text-[#1A1A1A] font-semibold hover:underline">
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
