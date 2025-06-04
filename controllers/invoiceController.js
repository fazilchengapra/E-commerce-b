const PDFDocument = require('pdfkit');
const moment = require('moment');
const Order = require('../model/Order');

exports.getInvoiceByOrderId = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // 🛑 Allow only if order is paid & delivered
    if (order.paymentStatus !== 'paid' || order.orderStatus !== 'delivered') {
      return res.status(403).json({ message: 'Invoice available only after payment and delivery' });
    }

    // ✅ Role check
    const isAdmin = req.role === 'superadmin';
    const isOwner = order.user._id.toString() === req.userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You are not authorized to access this invoice' });
    }

    // 📄 Start PDF generation
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${moment(order.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.moveDown();

    // Shipping info
    doc.fontSize(12).text(`Customer: ${order.shippingAddress.fullName}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.text(`Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`);
    doc.moveDown();

    // Order items
    doc.fontSize(12).text('Items:', { underline: true });
    doc.moveDown(0.5);

    order.orderItems.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}`);
    });

    doc.moveDown();
    doc.text(`Shipping: $${order.shippingPrice.toFixed(2)}`);
    doc.text(`Tax: $${order.taxPrice.toFixed(2)}`);
    doc.text(`Total: $${order.totalPrice.toFixed(2)}`, { bold: true });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
};
