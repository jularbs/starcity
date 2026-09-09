//HELPERS
const { utcToZonedTime } = dateFnsTz;
import { add, format, getDay, nextThursday } from 'date-fns';
import dateFnsTz from 'date-fns-tz';

export const getOpenParkExpiry = () => {
  //adjustable day indices 1 is monday, 2 is tuesday, 3 is wednesday
  const adjustDays = [1, 2, 3];

  const expiryDate = utcToZonedTime(
    add(new Date(), {
      months: 1,
    }),
    'Asia/Manila',
  );

  const dayValue = getDay(expiryDate);

  const inAdjustDays = adjustDays.indexOf(dayValue);
  const shouldAdjust = inAdjustDays >= 0 ? true : false;
  let expiry;

  if (shouldAdjust) {
    expiry = format(nextThursday(expiryDate), 'MMMM dd, yyyy');
  } else {
    expiry = format(expiryDate, 'MMMM dd, yyyy');
  }

  return expiry;
};
