'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { CartoonButton } from '@/components/ui/cartoon-button';
import { useAuth } from './auth-provider';
import { useState } from 'react';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signInWithEmail, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  async function handleSend() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Sign-in error:', message);
      setError(message || 'Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!code || code.length < 4) {
      setError('Please enter the verification code from your email');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyOtp(email, code);
      // Upon successful verification, modal will close via auth state change or manually
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('OTP verification error:', message);
      setError(message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setSent(false);
    setError(null);
    setLoading(false);
    setCode('');
    onOpenChange(false);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !sent && !loading) {
      handleSend();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="backdrop-blur-lg bg-white/10 border-white/20 w-[88vw] sm:w-full sm:max-w-sm text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sign in</DialogTitle>
          <DialogDescription>
            Enter your email to receive a teleport key.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {sent ? (
            <>
              <div className="text-center space-y-3">
                <p className="text-green-400 text-sm">
                  OTP sent! Enter the code from your email to complete sign-in.
                </p>
                <p className="text-white/60 text-xs">
                  {"Don't see it? Check your spam folder or request a new code."}
                </p>
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) handleVerify();
                }}
                className="rounded-md bg-black/20 backdrop-blur px-4 py-2 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
                required
                disabled={loading}
              />

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                  {error}
                </p>
              )}

              <CartoonButton
                variant="primary"
                size="md"
                onClick={handleVerify}
                isLoading={loading}
                loadingText="Verifying..."
              >
                Verify Code ✅
              </CartoonButton>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="rounded-md bg-black/20 backdrop-blur px-4 py-2 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={loading}
              />
              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                  {error}
                </p>
              )}
              
              <CartoonButton
                variant="primary"
                size="md"
                onClick={handleSend}
                isLoading={loading}
                loadingText="Engaging..."
              >
                Engage Warp Drive ✨
              </CartoonButton>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <CartoonButton variant="default" size="sm" type="button">
              Close
            </CartoonButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}