const Address = require('../model/Address');

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const existingAddresses = await Address.find({ userId });

    if (existingAddresses.length >= 4) {
      return res.status(400).json({ message: 'Maximum 4 addresses allowed per user.' });
    }

    // If new address is default, unset old default
    if (req.body.isDefault === true) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      isDefault: req.body.isDefault || false,
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all addresses for a user (default on top)
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If changing to default, unset previous default
    if (req.body.isDefault === true) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    // Only update allowed fields
    const fields = ['fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'isDefault'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    await address.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;

    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ✅ BONUS: Set an existing address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset others and set this one as default
    await Address.updateMany({ userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ message: 'Default address updated successfully', address });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
