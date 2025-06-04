const InvoiceCounter = require('../model/InvoiceCounter');

async function generateInvoiceId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 01 to 12

  const counter = await InvoiceCounter.findOneAndUpdate(
    { year, month },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(5, '0');
  return `INV-${year}-${month}-${paddedSeq}`;
}

module.exports = generateInvoiceId;
