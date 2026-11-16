/**
 * LifeMoney — Life uygulamasının tek para birimi.
 * 1 LifeMoney (LM) = 2,38 ₺
 */

export const LIFEMONEY_CODE = 'LM';
export const LIFEMONEY_NAME = 'LifeMoney';
export const LIFEMONEY_TRY_RATE = 2.38;
export const LIFEMONEY_KURUS_RATE = 238; // 2.38 TL * 100

export type LifeMoneyAmount = number;

export function tryToLifeMoney(tryAmount: number): number {
  if (!Number.isFinite(tryAmount)) return 0;
  return tryAmount / LIFEMONEY_TRY_RATE;
}

export function lifeMoneyToTry(lm: number): number {
  if (!Number.isFinite(lm)) return 0;
  return lm * LIFEMONEY_TRY_RATE;
}

export function kurusToLifeMoney(kurus: number): number {
  if (!Number.isFinite(kurus)) return 0;
  return kurus / LIFEMONEY_KURUS_RATE;
}

export function lifeMoneyToKurus(lm: number): number {
  if (!Number.isFinite(lm)) return 0;
  return Math.round(lm * LIFEMONEY_KURUS_RATE);
}

/** e.g. "12,50 LM" */
export function formatLifeMoney(
  lm: number,
  options?: { compact?: boolean; showCode?: boolean; digits?: number }
): string {
  const digits = options?.digits ?? 2;
  const showCode = options?.showCode !== false;
  const n = Number.isFinite(lm) ? lm : 0;
  const formatted = n.toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  if (options?.compact) {
    return showCode ? `${formatted} ${LIFEMONEY_CODE}` : formatted;
  }
  return showCode ? `${formatted} ${LIFEMONEY_NAME}` : formatted;
}

/** e.g. "≈ 29,75 ₺" */
export function formatTryEquivalent(lm: number): string {
  const tryAmount = lifeMoneyToTry(lm);
  return `≈ ${tryAmount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

export function lifeMoneyRateLabel(): string {
  return `1 ${LIFEMONEY_NAME} = ${LIFEMONEY_TRY_RATE.toFixed(2).replace('.', ',')} ₺`;
}

export const LIFEMONEY_CREDIT_RATE = {
  kurusPerCredit: LIFEMONEY_KURUS_RATE,
  tlPerCredit: LIFEMONEY_TRY_RATE,
  label: lifeMoneyRateLabel(),
} as const;
