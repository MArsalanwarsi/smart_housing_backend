import Flat from '../models/Flat.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';
import Notice from '../models/Notice.js';

export const createFlat = async (req, res, next) => {
  try {
    const { block_name, flat_number, occupancy_type } = req.body;

    if (!block_name || !flat_number || !occupancy_type) {
      return res.status(400).json({
        success: false,
        message: 'block_name, flat_number, and occupancy_type are required.'
      });
    }

    const existingFlat = await Flat.findOne({ block_name, flat_number });
    if (existingFlat) {
      return res.status(409).json({
        success: false,
        message: `Flat ${flat_number} in Block ${block_name} already exists.`
      });
    }

    const flat = await Flat.create({
      block_name,
      flat_number,
      occupancy_type
    });

    res.status(201).json({
      success: true,
      message: 'Flat created successfully',
      data: flat
    });
  } catch (error) {
    next(error);
  }
};

export const onboardResident = async (req, res, next) => {
  try {
    const { username, password, flat_id } = req.body;

    if (!username || !password || !flat_id) {
      return res.status(400).json({
        success: false,
        message: 'username, password, and flat_id are required.'
      });
    }

    const flat = await Flat.findById(flat_id);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: 'Specified flat does not exist.'
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already in use.'
      });
    }

    const user = await User.create({
      username,
      password,
      role: 'Resident',
      flat_id
    });

    res.status(201).json({
      success: true,
      message: 'Resident onboarded successfully',
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        flat_id: user.flat_id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateBills = async (req, res, next) => {
  try {
    const { amount_due, due_date } = req.body;

    if (!amount_due || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'amount_due and due_date are required.'
      });
    }

    const flats = await Flat.find();
    if (flats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No flats found to generate bills for.'
      });
    }

    const billDocuments = flats.map((flat) => ({
      flat_id: flat._id,
      amount_due,
      due_date: new Date(due_date),
      payment_status: 'Pending'
    }));

    const createdBills = await Bill.insertMany(billDocuments);

    res.status(201).json({
      success: true,
      message: `Generated ${createdBills.length} maintenance bills successfully.`,
      count: createdBills.length,
      data: createdBills
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastNotice = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'title and description are required.'
      });
    }

    const notice = await Notice.create({
      title,
      description,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Notice broadcasted successfully',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};
