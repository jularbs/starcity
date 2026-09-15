export type ApiError = {
  status: boolean;
  error: { message: string; code?: string; details?: unknown };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export function isApiError(error: unknown): error is ApiError {
  if (!isRecord(error) || !isRecord(error.error)) return false;

  return typeof error.error.message === "string" && typeof error.error.code === "string";
}

export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred") {
  if (isApiError(error)) return error.error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  if (isRecord(error) && isRecord(error.error)) {
    if (typeof error.error.message === "string") return error.error.message;
  }

  return fallback;
}

export function getValidationErrorMessage(error: unknown): { [key: string]: string } {
  if (isApiError(error) && error.error.code === "VALIDATION_ERROR") {
    return error.error.details as { [key: string]: string };
  }
  return {};
}
