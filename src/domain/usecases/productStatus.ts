import { ProductStatus } from '../entities';

export const LOW_STOCK_THRESHOLD = 2;
export const EXPIRATION_WARNING_DAYS = 3;

function getToday(): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function parseDateOnly(date?: string): Date | null {
  if (!date) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsedDate = new Date(
    year,
    month - 1,
    day
  );

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

export function isValidExpirationDate(
  expirationDate?: string
): boolean {
  if (!expirationDate) {
    return true;
  }

  return parseDateOnly(expirationDate) !== null;
}

export function isProductExpired(
  expirationDate?: string
): boolean {
  const expiration = parseDateOnly(expirationDate);

  if (!expiration) {
    return false;
  }

  return expiration.getTime() < getToday().getTime();
}

export function isProductExpiringSoon(
  expirationDate?: string
): boolean {
  const expiration = parseDateOnly(expirationDate);

  if (!expiration) {
    return false;
  }

  const today = getToday();

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  const differenceInDays = Math.round(
    (expiration.getTime() - today.getTime()) /
      millisecondsPerDay
  );

  return (
    differenceInDays >= 0 &&
    differenceInDays <= EXPIRATION_WARNING_DAYS
  );
}

export function getProductStatus(
  quantity: number,
  expirationDate?: string
): ProductStatus {
  if (isProductExpired(expirationDate)) {
    return 'expired';
  }

  if (quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return 'low_stock';
  }

  return 'available';
}