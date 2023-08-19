import { Response } from "express";
import { MysqlError } from "mysql";

interface error {
  message: string | MysqlError;
}

function throwGenericError(
  res: Response,
  error_code: number,
  error_message: string | MysqlError,
  debug: any = null
) {
  if (debug !== null) console.log(debug);
  const error: error = {
    message: error_message,
  };

  res.status(error_code).json(error);
}

export default throwGenericError;
