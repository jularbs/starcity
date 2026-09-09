import { mysqldb } from '../../database/mysql/index.js';
import type { ResultSetHeader } from 'mysql2/promise';

type TurnstileAccessPass = {
  admission_no: string;
  date: string;
  time: string;
  origin: 'smticket' | 'web';
  ticket_type: string;
  expiry: string;
};

const syncAccessPassToTurnstile = async (
  data: TurnstileAccessPass,
): Promise<boolean> => {
  const sql =
    'INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode, expiration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const [result] = await mysqldb.execute<ResultSetHeader>(sql, [
    data.admission_no,
    'Pop Tag',
    data.date,
    data.time,
    'Purchased',
    data.origin,
    '1',
    data.ticket_type,
    data.expiry,
  ]);

  return result.affectedRows === 1;
};

const voidAccessPassInTurnstile = async (
  admission_no: string,
): Promise<boolean> => {
  const sqlTableBarCode =
    'UPDATE tablebarcode SET status = 0, isSnowWorld = 0 WHERE barcode_number = ?;';
  const [resultTableBarcode] = await mysqldb.execute<ResultSetHeader>(
    sqlTableBarCode,
    [admission_no],
  );

  const sqlAdmissionHistory =
    'UPDATE admission_history SET status = "Void" WHERE admission_no=?;';
  const [resultAdmissionHistory] = await mysqldb.execute<ResultSetHeader>(
    sqlAdmissionHistory,
    [admission_no],
  );

  return (
    resultTableBarcode.affectedRows === 1 &&
    resultAdmissionHistory.affectedRows === 1
  );
};

const getAccessPassFromTurnstile = async (
  admission_no: string[],
): Promise<TurnstileAccessPass[] | null> => {
  const sql = `SELECT * FROM admission_history WHERE admission_no IN (?) AND status="Purchased";`;

  const [rows] = await mysqldb.execute<any[]>(sql, [admission_no]);

  if (rows.length === 0) {
    return null;
  }
  return rows.map((row) => ({
    admission_no: row.admission_no,
    date: row.date,
    time: row.time,
    origin: row.origin,
    ticket_type: row.RideCode,
    expiry: row.expiration_date,
  }));
};

export const turnstileSyncRepository = {
  syncAccessPassToTurnstile,
  voidAccessPassInTurnstile,
  getAccessPassFromTurnstile,
};
