import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AuthMfa() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Get TOTP factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData?.totp?.[0];
      if (!totpFactor) {
        setError('No MFA factor found. Contact your administrator.');
        setIsLoading(false);
        return;
      }

      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) throw challengeError;

      // Verify challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        setError('Invalid code. Please try again.');
        setCode('');
        setIsLoading(false);
        return;
      }

      // Refresh session info to get updated AAL
      await refreshSession();
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Verification failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, hsl(187 82% 53% / 0.04) 0%, transparent 60%)',
      }} />

      <div className="relative w-full max-w-sm px-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Verify Identity</h1>
          <p className="text-sm text-muted-foreground mt-1.5 text-center">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-5 border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center gap-6">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={handleVerify}
            className="w-full h-10 font-medium"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Verify'
            )}
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
          <ShieldCheck className="h-3 w-3" />
          <span>Multi-factor authentication required</span>
        </div>
      </div>
    </div>
  );
}
