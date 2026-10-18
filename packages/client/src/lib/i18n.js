import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to ZenithBazaar",
      login: "Login",
      register: "Register",
      logout: "Logout",
      dashboard: "Dashboard",
      currency: "NPR",
      profile: "Profile",
      cart: "Cart",
      products: "Products",
      orders: "Orders",
      adminPanel: "Admin Panel",
      vendorPanel: "Vendor Panel"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
