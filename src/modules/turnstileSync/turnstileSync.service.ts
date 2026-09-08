import { turnstileSyncRepository } from './turnstileSync.repository.js';
import { format } from 'date-fns';

type TurnstileAccessPassInput = {
  accesspassCode: string;
  origin: 'smticket' | 'web';
  expiry: string;
  date?: string;
};

const addAccessPassToTurnstile = async (data: TurnstileAccessPassInput) => {
  const date = format(new Date(data.date ?? new Date()), 'yyyy-MM-dd');
  const time = format(new Date(data.date ?? new Date()), 'HH:mm:ss');
  const ticketType = data.accesspassCode.match('-(.*)-')[1];
  const formattedData = {
    admission_no: data.accesspassCode,
    ticket_type: ticketType,
    expiry: data.expiry,
    origin: data.origin as 'smticket' | 'web',
    date,
    time,
  };

  return turnstileSyncRepository.syncAccessPassToTurnstile(formattedData);
};

const voidAccessPassInTurnstile = async (accesspassCode: string) => {
  return turnstileSyncRepository.voidAccessPassInTurnstile(accesspassCode);
};

const isTransactionCompleteInTurnstile = async (
  accesspassCodes: string[],
): Promise<boolean> => {
  const accessPassInTurnstile =
    await turnstileSyncRepository.getAccessPassFromTurnstile(accesspassCodes);

  if (accessPassInTurnstile.length !== accesspassCodes.length) return false;

  return true;
};

const getMissingAccessPassesInTurnstile = async (
  accesspassCodes: string[],
): Promise<string[]> => {
  const accessPassInTurnstile =
    await turnstileSyncRepository.getAccessPassFromTurnstile(accesspassCodes);

  const missingAccessPasses = accesspassCodes.filter(
    (code) => !accessPassInTurnstile.some((pass) => pass.admission_no === code),
  );

  return missingAccessPasses;
};

export const turnstileSyncService = {
  addAccessPassToTurnstile,
  voidAccessPassInTurnstile,
  isTransactionCompleteInTurnstile,
  getMissingAccessPassesInTurnstile,
};
