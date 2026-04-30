import { useState } from "react";
import { motion } from "framer-motion";
import { AuthMode, AuthUser, requestOtp, verifyOtp } from "../api/auth";

interface LoginSignupPageProps {
  onAuthenticated: (user: AuthUser) => void;
}

export function LoginSignupPage({ onAuthenticated }: LoginSignupPageProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    otp: "",
  });

  const isSignup = mode === "signup";
  const email = formData.email.trim().toLowerCase();

  const validateEmail = () => email.endsWith("@bennett.edu.in");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!validateEmail()) {
      setMessage("Only @bennett.edu.in emails are allowed.");
      return;
    }

    if (isSignup && (!formData.fullName.trim() || !formData.username.trim())) {
      setMessage("Full name and username are required for signup.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await requestOtp({
        mode,
        email,
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
      });
      setStep("otp");
      if (result.deliveredByEmail === false && result.devOtp) {
        setMessage(`SMTP not configured. Use dev OTP: ${result.devOtp}`);
      } else {
        setMessage("OTP sent to your university email.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to request OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!formData.otp.trim()) {
      setMessage("Enter the OTP sent to your email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { user } = await verifyOtp({ mode, email, otp: formData.otp.trim() });
      onAuthenticated(user);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OTP verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen flex selection:bg-indigo-200 selection:text-indigo-900 bg-stone-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-person-scrolling-through-phone-6229/1080p.mp4"
            type="video/mp4"
          />
        </video>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white/90">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-md"
          >
            <h1 className="text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">
              students^2
            </h1>
            <p className="text-2xl mb-4 font-light text-indigo-100">
              University-only social network
            </p>
            <p className="text-lg opacity-80 leading-relaxed text-indigo-200">
              Access is restricted to students with a valid bennett.edu.in email.
            </p>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full glass-panel p-10 rounded-2xl relative z-10"
        >
          <motion.div variants={itemVariants} className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              students^2
            </h1>
          </motion.div>

          <div className="space-y-6">
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                {step === "otp" ? "Verify OTP" : isSignup ? "Create Account" : "Sign In"}
              </h2>
              <p className="text-slate-500 font-medium">
                {step === "otp"
                  ? `Enter the OTP sent to ${email}`
                  : "Use your bennett.edu.in email address"}
              </p>
            </motion.div>

            {step === "details" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                {isSignup && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required={isSignup}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="Aarav Sharma"
                      />
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        required={isSignup}
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value.toLowerCase() })
                        }
                        className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="john.doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                    Bennett Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                    placeholder="you@bennett.edu.in"
                  />
                </div>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? "Sending OTP..." : "Send OTP"}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-1">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="6-digit OTP"
                />

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="w-full text-indigo-600 font-semibold"
                >
                  Change details
                </button>
              </form>
            )}

            {message && (
              <p className="text-center text-sm text-slate-600 bg-slate-100 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <motion.div variants={itemVariants} className="text-center text-sm pt-2">
              <span className="text-slate-500 font-medium">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(isSignup ? "signin" : "signup");
                  setStep("details");
                  setMessage("");
                  setFormData((prev) => ({ ...prev, otp: "" }));
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </motion.div>
          </div>

          <motion.p variants={itemVariants} className="mt-8 text-xs text-center text-slate-400">
            By continuing, you agree to students^2's{" "}
            <a href="#" className="underline hover:text-slate-600 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}