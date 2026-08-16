import Flat from '../models/Flat.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';
import Notice from '../models/Notice.js';
import Complaint from '../models/Complaint.js';
import Visitor from '../models/Visitor.js';
import Facility from '../models/Facility.js';
import Poll from '../models/Poll.js';
import Emergency from '../models/Emergency.js';

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

export const getFlats = async (req, res, next) => {
  try {
    const flats = await Flat.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: flats.length,
      data: flats
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

export const getResidents = async (req, res, next) => {
  try {
    const residents = await User.find({ role: 'Resident' })
      .select('-password')
      .populate('flat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: residents.length,
      data: residents
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

export const getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate('flat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
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

export const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('created_by', 'username role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: 'resident_id',
        select: 'username role flat_id',
        populate: { path: 'flat_id' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'In-Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Pending, In-Progress, Resolved) is required.'
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('resident_id', 'username role flat_id');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitorLogs = async (req, res, next) => {
  try {
    const visitors = await Visitor.find()
      .populate('flat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  } catch (error) {
    next(error);
  }
};

export const getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    next(error);
  }
};

export const createFacility = async (req, res, next) => {
  try {
    const { name, description, location, timing, capacity, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Facility name is required.'
      });
    }

    const facility = await Facility.create({
      name,
      description,
      location,
      timing,
      capacity,
      status,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

export const updateFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findByIdAndDelete(id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getPollsAdmin = async (req, res, next) => {
  try {
    const polls = await Poll.find()
      .populate('created_by', 'username role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    next(error);
  }
};

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, expires_at } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'question and an array of at least 2 options are required.'
      });
    }

    const formattedOptions = options.map((opt) =>
      typeof opt === 'string' ? { option_text: opt, votes: 0 } : opt
    );

    const poll = await Poll.create({
      question,
      options: formattedOptions,
      created_by: req.user.id,
      expires_at: expires_at ? new Date(expires_at) : null
    });

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

export const updatePoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Poll updated successfully',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencies = async (req, res, next) => {
  try {
    const emergencies = await Emergency.find()
      .populate('created_by', 'username role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    next(error);
  }
};

export const createEmergency = async (req, res, next) => {
  try {
    const { title, description, type, location, contact_number } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'title and description are required.'
      });
    }

    const emergency = await Emergency.create({
      title,
      description,
      type,
      location,
      contact_number,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert created successfully',
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmergency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency record not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency record updated successfully',
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};
