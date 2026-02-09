/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname = null;

try {
  supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null;
} catch (error) {
  supabaseHostname = null;
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  });
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname }]
      : [{ protocol: "https", hostname: "*.supabase.co" }]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
