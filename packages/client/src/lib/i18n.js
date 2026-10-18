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
  },
  ne: {
    translation: {
      welcome: "ZenithBazaar मा स्वागत छ",
      login: "लगइन",
      register: "दर्ता गर्नुहोस्",
      logout: "लगआउट",
      dashboard: "ड्यासबोर्ड",
      currency: "रु",
      profile: "प्रोफाइल",
      cart: "कार्ट",
      products: "उत्पादनहरू",
      orders: "अर्डरहरू",
      adminPanel: "प्रशासन प्यानल",
      vendorPanel: "विक्रेता प्यानल"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
