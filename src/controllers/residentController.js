import Bill from '../models/Bill.js';
import Visitor from '../models/Visitor.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

export const getBills = async (req, res, next) => {
  try {
    let flatId = req.user.flat_id;

    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: 'No flat associated with this resident account.'
      });
    }

    const bills = await Bill.find({ flat_id: flatId }).populate('flat_id');

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    next(error);
  }
};

export const payBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found.'
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (flatId && bill.flat_id.toString() !== flatId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only pay bills for your own flat.'
      });
    }

    if (bill.payment_status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Bill has already been paid.'
      });
    }

    bill.payment_status = 'Paid';
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully.',
      data: bill
    });
  } catch (error) {
    next(error);
  }
};

export const generateVisitorPass = async (req, res, next) => {
  try {
    const { visitor_name, phone, vehicle_number } = req.body;

    if (!visitor_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'visitor_name and phone are required.'
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: 'No flat associated with this resident account to issue visitor pass.'
      });
    }

    const gatePassCode = Math.floor(100000 + Math.random() * 900000).toString();

    const visitor = await Visitor.create({
      visitor_name,
      phone,
      vehicle_number: vehicle_number || '',
      flat_id: flatId,
      gate_pass_code: gatePassCode,
      status: 'Pre-Approved'
    });

    res.status(201).json({
      success: true,
      message: 'Visitor pass generated successfully.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

export const raiseComplaint = async (req, res, next) => {
  try {
    const { category, description } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'category and description are required.'
      });
    }

    const photoUrl = req.file ? req.file.path : '';

    const complaint = await Complaint.create({
      resident_id: req.user.id,
      category,
      description,
      photo_url: photoUrl,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully.',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};
