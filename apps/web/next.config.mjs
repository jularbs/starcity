import path from 'node:path';

const nextConfig = {
  /* config options here */
  output: 'standalone',
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  poweredByHeader: false,
  headers: () => {
    const defaultArr = ["'self'"];
    const fontArr = ["'self'", 'https:', 'data:'];
    const styleArr = ["'self'", "'unsafe-inline'", 'https:'];
    const scriptArr = ["'self'", "'unsafe-inline'", 'https:', "'unsafe-eval'"];

    const connectArr = ["'self'", 'https:'];

    const imgArr = ["'self'", 'data:', 'blob:', 'https:'];

    const frameArr = ["'self'", 'https:'];
    const frameAncestorsArr = ["'self'"];
    const mediaArr = ["'self'", 'blob:', 'https:'];

    const objectArr = ["'self'"];

    if (process.env.NEXT_PUBLIC_ENV == 'development') {
      scriptArr.push("'unsafe-eval'");
      connectArr.push('http:');
      styleArr.push('http:');
      scriptArr.push('http:');
      fontArr.push('http:');
      imgArr.push('http:');
      frameArr.push('http:');
      frameAncestorsArr.push('http:');
      mediaArr.push('http:');
    }

    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value:
              // `upgrade-insecure-requests;` +
              `default-src ${defaultArr.join(' ')};` +
              `font-src ${fontArr.join(' ')};` +
              `style-src ${styleArr.join(' ')};` +
              `script-src ${scriptArr.join(' ')};` +
              `connect-src ${connectArr.join(' ')};` +
              `img-src ${imgArr.join(' ')};` +
              `frame-src ${frameArr.join(' ')};` +
              `frame-ancestors ${frameAncestorsArr.join(' ')};` +
              `media-src ${mediaArr.join(' ')};` +
              `object-src ${objectArr.join(' ')};`,
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },

          {
            key: 'X-Frame-Options',
            value: 'sameorigin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          { key: 'Access-Control-Allow-Headers', value: 'market, request-id' },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '**',
      },
    ],
  },
  cacheMaxMemorySize: 1024 * 256,
  async redirects() {
    return [
      {
        // does not add /docs since basePath: false is set
        source: '/auth/:path',
        destination: 'https://manage.starcity.com.ph/auth/:path',
        basePath: false,
        permanent: true,
      },
      {
        // does not add /docs since basePath: false is set
        source: '/admin/:path',
        destination: 'https://manage.starcity.com.ph/dashboard',
        basePath: false,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
