interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  domain?: string;
  path?: string;
}

export const getCookieOptions = (maxAge: number): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN;

  // ✅ Clean the domain - remove protocol and trailing slashes
  let cleanDomain: string | undefined;
  if (cookieDomain) {
    cleanDomain = cookieDomain
      .replace(/^https?:\/\//, "") // Remove http:// or https://
      .replace(/\/.*$/, "") // Remove any path
      .trim();
  }

  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS only)
    sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production
    maxAge,
    path: "/", // ✅ IMPORTANT: Make cookie available on all paths
    // Only set domain in production if explicitly configured
    ...(isProduction && cleanDomain && { domain: cleanDomain }),
  };

  // 🔍 Detailed logging
  console.log("🍪 Cookie Configuration:", {
    NODE_ENV: process.env.NODE_ENV,
    isProduction,
    rawCookieDomain: cookieDomain,
    cleanDomain,
    willSetDomain: isProduction && !!cleanDomain,
    options,
    maxAgeMinutes: Math.round(maxAge / 60000),
  });

  return options;
};
