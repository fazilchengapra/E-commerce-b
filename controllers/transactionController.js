const moment = require('moment');
const Order = require('../model/Order');

exports.getTransactionHistory = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    const transactions = orders.map(order => {
      const userName = order.user?.name || 'Unknown User';
      const method = order.paymentMethod;

      let transactionTitle;
      if (order.paymentStatus === 'failed') {
        transactionTitle = `Payment failed from ${method}`;
      } else {
        transactionTitle = `Payment from ${userName}`;
      }

      let status;
      if (order.paymentStatus === 'paid') {
        status = 'Completed';
      } else if (order.paymentStatus === 'failed') {
        status = 'Cancelled';
      } else {
        status = 'In progress';
      }

      return {
        transaction: transactionTitle,
        date: moment(order.createdAt).format('MMM D ,YYYY'), // 👈 formatted like screenshot
        amount: order.totalPrice,
        status
      };
    });

    res.json(transactions);
  } catch (error) {
    console.error('Transaction History Error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};
