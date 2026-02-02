# Internationalization (i18n) Guide

This project uses **react-i18next** for internationalization support, currently supporting **English** and **Spanish**.

## Features

- 🌍 English and Spanish language support
- 🔄 Automatic language detection from browser
- 💾 Language preference saved in localStorage
- 🎯 Easy language switching with LanguageSwitcher component

## Files Structure

```
src/
├── i18n/
│   ├── config.ts              # i18n configuration
│   └── locales/
│       ├── en.json            # English translations
│       └── es.json            # Spanish translations
└── components/
    └── ui/
        └── LanguageSwitcher.tsx  # Language toggle component
```

## How to Use

### 1. In React Components

Import and use the `useTranslation` hook:

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('auth.login')}</p>
    </div>
  );
}
```

### 1b. Using the Custom Hook (Recommended)

For more convenience, use our custom `useLanguage` hook:

```typescript
import { useLanguage } from '@/hooks/useLanguage';

export function MyComponent() {
  const { t, currentLanguage, toggleLanguage, isEnglish } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>Current language: {currentLanguage}</p>
      <button onClick={toggleLanguage}>
        Switch to {isEnglish ? 'Spanish' : 'English'}
      </button>
    </div>
  );
}
```

### 2. Language Switcher

Add the `LanguageSwitcher` component anywhere in your app:

```typescript
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function MyPage() {
  return (
    <div>
      <LanguageSwitcher />
      {/* Your content */}
    </div>
  );
}
```

### 3. Adding New Translations

To add new translations, edit both language files:

**src/i18n/locales/en.json**
```json
{
  "mySection": {
    "myKey": "My English text"
  }
}
```

**src/i18n/locales/es.json**
```json
{
  "mySection": {
    "myKey": "Mi texto en español"
  }
}
```

Then use it: `{t('mySection.myKey')}`

## Available Translation Keys

### Common
- `common.appName` - Application name
- `common.loading` - Loading text
- `common.error` - Error text
- `common.save`, `cancel`, `delete`, `edit`, `create`, etc.

### Authentication
- `auth.login` - Log in
- `auth.register` - Sign up / Registro
- `auth.email` - Email
- `auth.password` - Password
- `auth.name` - Name
- `auth.rememberMe` - Remember me
- `auth.forgotPassword` - Forgot password?
- `auth.noAccount` - Don't have an account?
- `auth.hasAccount` - Already have an account?

### Validation
- `validation.required` - Required field message
- `validation.invalidEmail` - Invalid email message
- `validation.passwordTooShort` - Password length requirement
- `validation.passwordsDoNotMatch` - Password mismatch message

## Programmatic Language Change

You can change the language programmatically:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const changeToSpanish = () => {
    i18n.changeLanguage('es');
  };
  
  const changeToEnglish = () => {
    i18n.changeLanguage('en');
  };
  
  // Get current language
  const currentLang = i18n.language; // 'en' or 'es'
}
```

## Adding a New Language

1. Create a new language file: `src/i18n/locales/[lang].json`
2. Add the language to the config:

```typescript
// src/i18n/config.ts
import fr from './locales/fr.json'; // Import the new language

i18n.init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr }, // Add new language
  },
  // ...
});
```

3. Update the LanguageSwitcher component to include the new language option.

## Notes

- Language preference is automatically saved to `localStorage`
- The browser's default language is detected on first visit
- Fallback language is English if a translation is missing
