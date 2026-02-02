# Quick Translation Keys Reference

This is a quick reference for all available translation keys in the project.

## 🔑 Translation Keys

### Common Keys
| Key | English | Spanish |
|-----|---------|---------|
| `common.appName` | One Million Dollar Admin | Administrador One Million Dollar |
| `common.loading` | Loading... | Cargando... |
| `common.error` | Error | Error |
| `common.success` | Success | Éxito |
| `common.save` | Save | Guardar |
| `common.cancel` | Cancel | Cancelar |
| `common.delete` | Delete | Eliminar |
| `common.edit` | Edit | Editar |
| `common.create` | Create | Crear |
| `common.search` | Search | Buscar |
| `common.filter` | Filter | Filtrar |
| `common.logout` | Logout | Cerrar sesión |

### Authentication Keys
| Key | English | Spanish |
|-----|---------|---------|
| `auth.login` | Log In | Iniciar Sesión |
| `auth.register` | Sign Up | Registrarse |
| `auth.signUp` | Registro | Registro |
| `auth.email` | Email | Correo electrónico |
| `auth.password` | Password | Contraseña |
| `auth.confirmPassword` | Confirm Password | Confirmar contraseña |
| `auth.name` | Name | Nombre |
| `auth.rememberMe` | Remember me | Recordarme |
| `auth.forgotPassword` | Forgot password? | ¿Olvidaste tu contraseña? |
| `auth.noAccount` | Don't have an account? | ¿No tienes una cuenta? |
| `auth.hasAccount` | Already have an account? | ¿Ya tienes una cuenta? |
| `auth.emailPlaceholder` | you@example.com | tu@ejemplo.com |
| `auth.passwordPlaceholder` | Enter your password | Ingresa tu contraseña |
| `auth.namePlaceholder` | Enter your name | Ingresa tu nombre |
| `auth.loginTitle` | Welcome Back | Bienvenido de nuevo |
| `auth.loginSubtitle` | Log in to your account | Inicia sesión en tu cuenta |
| `auth.registerTitle` | Create Account | Crear Cuenta |
| `auth.registerSubtitle` | Sign up to get started | Regístrate para comenzar |

### Home/Dashboard Keys
| Key | English | Spanish |
|-----|---------|---------|
| `home.welcome` | Welcome back | Bienvenido de nuevo |
| `home.dashboard` | Dashboard | Panel de control |
| `home.totalUsers` | Total Users | Total de Usuarios |
| `home.activeSessions` | Active Sessions | Sesiones Activas |
| `home.settings` | Settings | Configuración |
| `home.config` | Config | Configuración |
| `home.userGrowth` | +20.1% from last month | +20.1% del mes pasado |
| `home.sessionGrowth` | +201 since last hour | +201 desde la última hora |
| `home.systemStatus` | System functioning normal | Sistema funcionando normalmente |

### Validation Keys
| Key | English | Spanish |
|-----|---------|---------|
| `validation.required` | This field is required | Este campo es obligatorio |
| `validation.invalidEmail` | Please enter a valid email | Por favor ingresa un correo válido |
| `validation.passwordTooShort` | Password must be at least 8 characters | La contraseña debe tener al menos 8 caracteres |
| `validation.passwordsDoNotMatch` | Passwords do not match | Las contraseñas no coinciden |

---

## 💡 Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <button>{t('auth.login')}</button>
      <p>{t('validation.required')}</p>
    </div>
  );
}
```

---

## ➕ Adding New Keys

1. Add to `src/i18n/locales/en.json`:
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

2. Add to `src/i18n/locales/es.json`:
```json
{
  "mySection": {
    "myKey": "Mi Texto en Español"
  }
}
```

3. Use in your component:
```typescript
{t('mySection.myKey')}
```
