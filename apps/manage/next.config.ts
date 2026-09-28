import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  headers: async () => {
    const defaultArr = ["'self'"];
    const fontArr = ["'self'", "https:", "data:"];
    const styleArr = ["'self'", "'unsafe-inline'", "https:"];
    const scriptArr = ["'self'", "'unsafe-inline'", "https:"];

    const connectArr = ["'self'", "https:"];

    const imgArr = ["'self'", "data:", "blob:", "https:"];

    const frameArr = ["'self'", "https:"];
    const frameAncestorsArr = ["'self'"];
    const mediaArr = ["'self'", "blob:", "https:"];

    const objectArr = ["'self'"];

    if (process.env.NEXT_PUBLIC_ENV == "development") {
      scriptArr.push("'unsafe-eval'");
      connectArr.push("http:");
      styleArr.push("http:");
      scriptArr.push("http:");
      fontArr.push("http:");
      imgArr.push("http:");
      frameArr.push("http:");
      frameAncestorsArr.push("http:");
      mediaArr.push("http:");
    }

    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              `default-src ${defaultArr.join(" ")};` +
              `font-src ${fontArr.join(" ")};` +
              `style-src ${styleArr.join(" ")};` +
              `script-src ${scriptArr.join(" ")};` +
              `connect-src ${connectArr.join(" ")};` +
              `img-src ${imgArr.join(" ")};` +
              `frame-src ${frameArr.join(" ")};` +
              `frame-ancestors ${frameAncestorsArr.join(" ")};` +
              `media-src ${mediaArr.join(" ")};` +
              `object-src ${objectArr.join(" ")};`,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains;",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
