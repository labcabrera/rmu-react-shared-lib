/** Saves a Blob as a file through a temporary link. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked after the click has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
