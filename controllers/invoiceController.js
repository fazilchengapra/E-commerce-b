const PDFDocument = require("pdfkit");
const moment = require("moment");
const Order = require("../model/Order");

exports.getInvoiceByOrderId = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🛑 Allow only if order is paid & delivered
    if (order.paymentStatus !== "paid" || order.orderStatus !== "delivered") {
      return res
        .status(403)
        .json({ message: "Invoice available only after payment and delivery" });
    }

    // ✅ Role check
    const isAdmin = req.role === "superadmin";
    const isOwner = order.user._id.toString() === req.userId.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this invoice" });
    }

    // 📄 Start PDF generation
    const doc = new PDFDocument({ margin: 50 });

    doc.registerFont("Bold", "fonts/Roboto-Bold.ttf");
    doc.registerFont("Regular", "fonts/Roboto-Regular.ttf");
    doc.registerFont("semiBold", "fonts/Roboto-SemiBold.ttf");
    doc.registerFont("Medium", "fonts/Roboto-Medium.ttf");

    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left - 35;
    const imageWidth = 100;

    const imageX = pageWidth - margin - imageWidth; // Right aligned

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.invoiceId}.pdf`
    );
    doc.pipe(res);

    // Header
    doc
      .font("semiBold")
      .fontSize(10)
      .fillColor("#000")
      .text("Order Id : " + order._id, { align: "left" });
    doc.moveDown(0.3);
    doc
      .font("Bold")
      .fontSize(20)
      .text(`Invoice #${order.invoiceId}`, { align: "left" });
    doc.moveDown(0.2);
    doc.image("public/images/sampleLogo.jpg", imageX, 20, {
      width: imageWidth,
    });
    doc.moveUp(0.8);
    doc.font("semiBold").fontSize(15).text("Shoppee.", { align: "right" });
    doc.moveDown(0.5);
    doc
      .fillColor("#A4A4A4")
      .font("Regular")
      .fontSize(10)
      .text(`${moment(order.createdAt).format("MMMM D, YYYY")}`, {
        align: "right",
      });
    doc.moveDown();

    // Billing info
    doc.fillColor("#000").font("Bold").fontSize(11).text("BILL TO");
    doc.moveDown(0.5);
    doc.font("Bold").fontSize(11).text(`${order.shippingAddress.fullName},`);
    doc
      .font("Regular")
      .text(
        `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`
      );
    doc.text(`${order.shippingAddress.country}`);
    doc.moveDown();

    // 🧾 Draw Items Table Header
    doc.moveDown(1);
    doc.font("Bold").fontSize(11);
    doc
      .fillColor("#f0f0f0")
      .rect(doc.x, doc.y, doc.page.width - 100, 20)
      .fill();

    doc.fillColor("#000");
    const startX = doc.x;
    let startY = doc.y + 5;

    doc.text("#", startX + 0, startY);
    doc.text("Item", startX + 30, startY);
    doc.text("Qty", startX + 300, startY);
    doc.text("Price", startX + 360, startY);
    doc.text("Total", startX + 450, startY);

    doc.moveDown(1);

    // 📦 List Items
    doc.font("Regular").fontSize(10);

    order.orderItems.forEach((item, index) => {
      const itemY = doc.y;

      doc.text(`${index + 1}`, startX + 0, itemY);
      doc.text(`${item.name}`, startX + 30, itemY, { width: 250 });
      doc.text(`${item.quantity}`, startX + 300, itemY);
      doc.text(
        `₹${(item.price / item.quantity).toFixed(2)}`,
        startX + 360,
        itemY
      );
      doc.text(`₹${item.price.toFixed(2)}`, startX + 430, itemY);

      doc.moveDown(0.7);

      // Optional: Add horizontal line
      doc
        .strokeColor("#e0e0e0")
        .lineWidth(0.5)
        .moveTo(startX, doc.y)
        .lineTo(startX + 500, doc.y)
        .stroke();
    });
    doc.moveDown(2);
    // ✅ Subtotal, Shipping, Total
    const TotalY = doc.y + 10;
    doc
      .fillColor("#636363")
      .font("semiBold")
      .text("Subtotal", startX + 300, TotalY);
    doc
      .fillColor("#000")
      .font("Bold")
      .text(`₹${order.totalPrice - order.shippingPrice.toFixed(2)}`, startX + 430, TotalY);
    doc.moveDown(0.5);

    doc
      .fillColor("#636363")
      .font("semiBold")
      .text("Shipping Charges", startX + 300, TotalY + 30);
    doc
      .fillColor("#000")
      .font("Bold")
      .text(`₹${order.shippingPrice.toFixed(2)}`, startX + 430, TotalY + 30);

    doc.font("Bold").text("Total", startX + 300, TotalY + 60);
    doc
      .font("Bold")
      .text(`₹${order.totalPrice.toFixed(2)}`, startX + 430, TotalY + 60);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
