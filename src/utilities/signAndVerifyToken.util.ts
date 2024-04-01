import jwt from "jsonwebtoken";

export function signJwt(object: object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, process.env.JWT_SECRET as string, {
    ...(options && options),
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return {
      valid: true,
      expired: false,
      decoded,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}
