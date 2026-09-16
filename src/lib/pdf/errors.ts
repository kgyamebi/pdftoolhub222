export class PdfHubError extends Error {
  readonly code: string;
  readonly hint: string;
  readonly recoverable: boolean;

  constructor(code: string, message: string, hint: string, recoverable = true) {
    super(message);
    this.name = "PdfHubError";
    this.code = code;
    this.hint = hint;
    this.recoverable = recoverable;
  }
}

export function toUserError(error: unknown): PdfHubError {
  if (error instanceof PdfHubError) return error;
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (/password|encrypt/i.test(message)) {
    return new PdfHubError(
      "encrypted",
      "This PDF is password-protected.",
      "Unlock it first with the password, or use Unlock PDF.",
    );
  }
  if (/corrupt|invalid|xref|trailer/i.test(message)) {
    return new PdfHubError(
      "corrupt",
      "We couldn't read this PDF.",
      "The file may be damaged. Try Repair PDF, or export a fresh copy from the original app.",
    );
  }
  return new PdfHubError(
    "processing_failed",
    "We couldn't process this file.",
    message || "Try another file, or retry the same one.",
  );
}
