import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import logo from '@/assets/logo.png'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

export default function Register() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const schema = yup.object().shape({
    name: yup
      .string()
      .required(t('validation.required')),
    email: yup
      .string()
      .email(t('validation.invalidEmail'))
      .required(t('validation.required')),
    password: yup
      .string()
      .min(8, t('validation.passwordTooShort'))
      .required(t('validation.required')),
  })

  type RegisterFormInputs = yup.InferType<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true)
    setAuthError('')
    try {
      await registerUser(data.email, data.password, data.name)
      navigate('/')
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <LanguageSwitcher />
      {/* Left Panel - Image */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12"
      >
        <div className="w-full max-w-md aspect-square bg-card/50 rounded-2xl flex items-center justify-center shadow-sm">
          <div className="text-muted-foreground">
            <img src={logo} alt="OMD Logo" className='w-64 h-64' />
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8 bg-card"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{t('common.appName')}</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t('auth.signUp')}</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground font-normal">{t('auth.name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('auth.namePlaceholder')}
                className={`bg-muted/50 border-input ${errors.name ? 'border-destructive' : ''}`}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground font-normal">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className={`bg-muted/50 border-input ${errors.email ? 'border-destructive' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground font-normal">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`bg-muted/50 border-input pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              {/* Keep the static help text only if there are no errors, or just let validation handle it?
                  The original had it always visible. Yup handles it as error.
                  I will remove the static help text to avoid duplication/clutter when error shows.
              */}
              {!errors.password && (
                <p className="text-xs text-muted-foreground">
                  {t('validation.passwordTooShort')}
                </p>
              )}
            </div>

            {authError && <p className="text-sm text-destructive">{authError}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('auth.register')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
