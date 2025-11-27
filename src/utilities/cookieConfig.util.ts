interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  domain?: string;
}

export const getCookieOptions = (maxAge: number): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction, // Only HTTPS in production
    sameSite: isProduction ? "none" : "lax", // ✅ Changed from "strict"
    maxAge,
    ...(isProduction &&
      process.env.COOKIE_DOMAIN && {
        domain: process.env.COOKIE_DOMAIN,
      }),
  };
};
