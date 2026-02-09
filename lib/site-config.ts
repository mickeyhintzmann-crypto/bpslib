export const siteConfig = {
  companyName: "BP Slib",
  address: "",
  phone: "+4526913737",
  phoneDisplay: "26 91 37 37",
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
