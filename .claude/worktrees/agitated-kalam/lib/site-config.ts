import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164 } from "@/lib/contact";

export const siteConfig = {
  companyName: "BP Slib",
  address: "",
  phone: CONTACT_PHONE_E164,
  phoneDisplay: CONTACT_PHONE_DISPLAY,
  email: "info@bpslib.dk",
  serviceArea: "Sjælland",
  cvr: "45700453",
  openingHours: {
    weekdays: "07.00-17.00",
    weekend: "Lukket"
  },
  estimatorRetentionDays: 30,
  rateLimit: {
    estimatorSubmitPerHour: 12,
    bookingSubmitPerHour: 10,
    acuteBookingSubmitPerHour: 12,
    contactSubmitPerHour: 10,
    windowSeconds: 60 * 60
  },
  anmeldHaandvaerker: {
    enabled: false,
    profileUrl: "",
    widgetHtml: null
  },
  showSvarSammeDag: true,
  topbarMessage: "Svar samme dag"
};

export const homeConfig = {
  trustBadges: ["15+ års erfaring", "Kun massiv træ", "Svar samme dag"]
};
