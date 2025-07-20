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
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-lg bg-white/10 border-white/20 max-w-md w-full text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sign in</DialogTitle>
          <DialogDescription>
            Enter your email to receive a teleport key.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {sent ? (
            <p className="text-green-400 text-sm">
              Magic link sent! Check your email to complete sign-in.
            </p>
          ) : (
            <>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md bg-black/20 backdrop-blur px-4 py-2 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <CartoonButton
                variant="primary"
                size="md"
                onClick={handleSend}
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