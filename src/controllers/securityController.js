import Visitor from '../models/Visitor.js';
import Flat from '../models/Flat.js';

export const verifyPass = async (req, res, next) => {
  try {
    const { gate_pass_code } = req.body;

    if (!gate_pass_code) {
      return res.status(400).json({
        success: false,
        message: 'gate_pass_code is required.'
      });
    }

    const visitor = await Visitor.findOne({ gate_pass_code });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Invalid gate pass code. Visitor not found.'
      });
    }

    if (visitor.status === 'Entered') {
      return res.status(400).json({
        success: false,
        message: 'Visitor pass has already been used and visitor is currently on premises.'
      });
    }

    if (visitor.status === 'Exited') {
      return res.status(400).json({
        success: false,
        message: 'Visitor pass has expired because visitor has already exited.'
      });
    }

    visitor.status = 'Entered';
    visitor.entry_timestamp = new Date();
    await visitor.save();
    await visitor.populate('flat_id');

    res.status(200).json({
      success: true,
      message: 'Gate pass verified. Visitor entry recorded successfully.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

export const logWalkInVisitor = async (req, res, next) => {
  try {
    const { visitor_name, phone, vehicle_number, flat_id } = req.body;

    if (!visitor_name || !phone || !flat_id) {
      return res.status(400).json({
        success: false,
        message: 'visitor_name, phone, and flat_id are required for walk-in visitors.'
      });
    }

    const flat = await Flat.findById(flat_id);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: 'Specified flat does not exist.'
      });
    }

    const visitor = await Visitor.create({
      visitor_name,
      phone,
      vehicle_number: vehicle_number || '',
      flat_id,
      status: 'Entered',
      entry_timestamp: new Date()
    });

    await visitor.populate('flat_id');

    res.status(201).json({
      success: true,
      message: 'Walk-in visitor entry logged successfully.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveVisitors = async (req, res, next) => {
  try {
    const activeVisitors = await Visitor.find({ status: 'Entered' })
      .populate('flat_id')
      .sort({ entry_timestamp: -1 });

    res.status(200).json({
      success: true,
      count: activeVisitors.length,
      data: activeVisitors
    });
  } catch (error) {
    next(error);
  }
};
