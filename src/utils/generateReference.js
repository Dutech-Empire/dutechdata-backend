export const generateReference = (prefix = "TXN") => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${prefix}_${timestamp}_${random}`;
};