import { useTranslation } from 'react-i18next';

/**
 * Custom hook for managing language preferences
 * Provides easy access to language switching and current language info
 */
export function useLanguage() {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language;
  
  const isEnglish = currentLanguage === 'en';
  const isSpanish = currentLanguage === 'es';

  const changeLanguage = (lang: 'en' | 'es') => {
    i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const setEnglish = () => changeLanguage('en');
  const setSpanish = () => changeLanguage('es');

  return {
    // Current state
    currentLanguage,
    isEnglish,
    isSpanish,
    
    // Translation function
    t,
    
    // Language changing functions
    changeLanguage,
    toggleLanguage,
    setEnglish,
    setSpanish,
    
    // Raw i18n instance if needed
    i18n,
  };
}
