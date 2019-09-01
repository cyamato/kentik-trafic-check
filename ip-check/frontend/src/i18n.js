import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

let initObj = {
  fallbackLng: ["en", "en-US", "fr", "cn", "jp", "es"],
  debug: false,
  interpolation: {
    escapeValue: false,
  },
};

if (typeof(window.Storage) !== "undefined") {
  const lng = window.localStorage.getItem("langauge");
  if (lng) {
    console.log("Using Stored Language Settings");
    initObj.lng = lng;
  }
} else {
  console.log("Local Storage not found, detecting language settings from browser");
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(initObj);

export default i18n;