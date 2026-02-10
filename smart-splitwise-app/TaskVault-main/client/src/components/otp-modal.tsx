import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVerifyOTP, useResendOTP } from "@/hooks/use-auth";
import { validateOTPCode } from "@/lib/auth-utils";
import { Shield, AlertTriangle } from "lucide-react";

interface OTPModalProps {
  email: string;
  onClose: () => void;
}

export function OTPModal({ email, onClose }: OTPModalProps) {
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (validateOTPCode(pastedData)) {
      const newOtpCode = pastedData.split("");
      setOtpCode(newOtpCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpCode.join("");
    if (!validateOTPCode(code)) {
      return;
    }

    try {
      await verifyOTPMutation.mutateAsync({ email, code });
      onClose();
    } catch (error) {
      setAttempts(attempts + 1);
      if (attempts + 1 >= 5) {
        setIsLocked(true);
      }
      // Clear OTP inputs on error
      setOtpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTPMutation.mutateAsync(email);
      setResendTimer(30);
      setOtpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isCodeComplete = otpCode.every(digit => digit !== "");
  const attemptsRemaining = Math.max(0, 5 - attempts);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Secure Login</h2>
            <p className="text-slate-600">Enter the OTP sent to your email</p>
            <p className="text-sm text-slate-500 mt-1">{email}</p>
          </div>

          {/* Security Status */}
          <div className="bg-slate-50 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Security Level:</span>
              <span className="text-success font-medium">High</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">Attempts Remaining:</span>
              <span className={`font-medium ${attemptsRemaining <= 2 ? 'text-error' : 'text-warning'}`}>
                {attemptsRemaining}/5
              </span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              6-Digit Verification Code
            </label>
            <div className="flex space-x-2 justify-center">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="otp-input"
                  disabled={isLocked || verifyOTPMutation.isPending}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleVerifyOTP}
              disabled={!isCodeComplete || verifyOTPMutation.isPending || isLocked}
              className="w-full"
            >
              {verifyOTPMutation.isPending ? "Verifying..." : "Verify & Login"}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || resendOTPMutation.isPending || isLocked}
              className="w-full"
            >
              {resendOTPMutation.isPending 
                ? "Sending..." 
                : resendTimer > 0 
                ? `Resend Code (${resendTimer}s)` 
                : "Resend Code"
              }
            </Button>
          </div>

          {/* Brute Force Warning */}
          {attempts >= 3 && !isLocked && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-warning mr-2" />
                <span className="text-sm text-amber-800">
                  Account will be locked after {attemptsRemaining} more failed attempts
                </span>
              </div>
            </div>
          )}

          {/* Account Locked */}
          {isLocked && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-error mr-2" />
                <span className="text-sm text-red-800">
                  Account locked due to too many failed attempts. Please try again later.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
