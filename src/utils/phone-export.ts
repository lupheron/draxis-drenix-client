/** Phone lines for checknumber.ai (one country per file, country code included). */

export function digitsOnly(phone: string | null | undefined): string {
  return String(phone ?? "").replace(/\D+/g, "");
}

/**
 * Normalize to checknumber.ai line format:
 * digits only, with country code (US 10-digit → prepend 1).
 */
export function toCheckNumberLine(
  phone: string | null | undefined,
): string | null {
  const digits = digitsOnly(phone);
  if (!digits) return null;
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

export function buildCheckNumberFileContent(
  phones: Array<string | null | undefined>,
): { lines: string[]; skipped: number } {
  const seen = new Set<string>();
  const lines: string[] = [];
  let skipped = 0;

  for (const phone of phones) {
    const line = toCheckNumberLine(phone);
    if (!line) {
      skipped += 1;
      continue;
    }
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }

  return { lines, skipped };
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
