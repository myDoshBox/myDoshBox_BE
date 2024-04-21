interface Validator {
  (value: any): boolean;
}

export const emailValidator: Validator = (value: any): boolean => {
  // Regular expression for validating email addresses
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};
