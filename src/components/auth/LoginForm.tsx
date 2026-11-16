'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LifeLogo } from '@/components/brand/LifeLogo';
import { useLocaleRender } from '@/lib/i18n/runtime';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { setBackground, setTheme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || 'E-posta veya şifre hatalı.');
        return;
      }

      const userProfile = payload.user;
      if (!userProfile?.supabaseId) {
        setError('Giriş başarısız oldu.');
        return;
      }

      setUser({
        id: userProfile.id,
        supabaseId: userProfile.supabaseId,
        lifeosId: userProfile.lifeosId,
        email: userProfile.email,
        displayName: userProfile.displayName,
        avatarUrl: userProfile.avatarUrl || null,
        bio: userProfile.bio || null,
        locale: userProfile.locale || 'tr',
        theme: userProfile.theme || 'dark',
        backgroundType: userProfile.backgroundType || 'default',
        backgroundValue: userProfile.backgroundValue || null,
        createdAt: userProfile.createdAt || new Date().toISOString(),
        updatedAt: userProfile.updatedAt || new Date().toISOString(),
      });

      if (userProfile.backgroundType && userProfile.backgroundType !== 'default') {
        setBackground(userProfile.backgroundType, userProfile.backgroundValue);
      } else {
        setBackground('default', null);
      }

      if (userProfile.theme) {
        setTheme(userProfile.theme);
      }

      router.replace('/home');
    } catch (err) {
      console.error('Login process error:', err);
      setError('Giriş sırasında bir hata oluştu.');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <LifeLogo size={72} priority />
        </motion.div>
        <div className="text-center space-y-1">
          <h1 className="font-[family-name:var(--font-newsreader)] text-4xl font-medium tracking-tight text-foreground italic">
            Life
          </h1>
          <p className="text-sm text-muted-foreground">{localizeText('Kişisel dijital yaşam alanın')}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-5 rounded-3xl border border-border/70 bg-card/80 p-6 backdrop-blur-sm"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{localizeText('Giriş Yap')}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{localizeText('Hesabına hoş geldin.')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            label={localizeText('E-posta')}
            type="email"
            placeholder={localizeText('ornek@email.com')}
            autoComplete="email"
            autoCapitalize="off"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            label={localizeText('Şifre')}
            type={showPassword ? 'text' : 'password'}
            placeholder={localizeText('••••••••')}
            autoComplete="current-password"
            icon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {localizeText(error)}
            </motion.div>
          )}

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            {localizeText('Giriş Yap')}
          </Button>
        </form>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        {localizeText('Hesabın yok mu?')}{' '}
        <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          {localizeText('Hesap oluştur')}
        </Link>
      </p>
    </motion.div>
  );
}
