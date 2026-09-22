/**
 * Formats a number into Indonesian Rupiah currency format.
 * @param {number} amount - Amount to format
 * @returns {string} Formatted string (e.g. "Rp 14.999.000")
 */
export const formatRupiah = (amount) => {
  if (typeof amount !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};
