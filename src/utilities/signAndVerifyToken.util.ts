// import jwt from "jsonwebtoken";

// export function signJwt(object: object, options?: jwt.SignOptions | undefined) {
//   return jwt.sign(object, process.env.JWT_SECRET as string, {
//     ...(options && options),
//   });
// }

// export function verifyJwt(token: string) {
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
//     return {
//       valid: true,
//       expired: false,
//       decoded,
//     };
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (e: any) {
//     return {
//       valid: false,
//       expired: e.message === "jwt expired",
//       decoded: null,
//     };
//   }
// }

import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

// Properly type the signJwt function
export function signJwt(payload: object, options?: SignOptions): string {
  const privateKey = process.env.JWT_SECRET;

  if (!privateKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, privateKey, {
    ...(options && options),
  });
}

// Properly type the verifyJwt function
export function verifyJwt(token: string): {
  valid: boolean;
  expired: boolean;
  decoded: string | JwtPayload | null;
} {
  const publicKey = process.env.JWT_SECRET;

  if (!publicKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === "jwt expired",
      decoded: null,
    };
  }
}
