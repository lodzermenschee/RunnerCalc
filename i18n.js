import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import pl from './locales/pl.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'pl',
    lng: 'pl',               // domyślny język
    resources: {
      pl: { translation: pl },
      en: { translation: en },
      de: { translation: de },  // rejestrujemy niemiecki
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
