function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10) firstCheck = 0;
  if (firstCheck !== parseInt(cpf.charAt(9), 10)) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10) secondCheck = 0;
  if (secondCheck !== parseInt(cpf.charAt(10), 10)) return false;

  return true;
}

export function isValidBRMobilePhone(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  const ddd = digits.slice(0, 2);
  const subscriber = digits.slice(2);
  if (ddd[0] === '0' || ddd === '00') return false;
  if (subscriber[0] !== '9') return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}
