import Poll from '../models/Poll.js';

export const votePoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { option_id } = req.body;

    if (!option_id) {
      return res.status(400).json({
        success: false,
        message: 'option_id is required to cast a vote.'
      });
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found.'
      });
    }

    if (poll.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Voting is closed for this poll.'
      });
    }

    if (poll.expires_at && new Date() > new Date(poll.expires_at)) {
      poll.status = 'Closed';
      await poll.save();
      return res.status(400).json({
        success: false,
        message: 'This poll has expired.'
      });
    }

    const userIdStr = req.user.id.toString();
    const hasVoted = poll.voted_by.some((voterId) => voterId.toString() === userIdStr);
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this poll.'
      });
    }

    const selectedOption = poll.options.id(option_id);
    if (!selectedOption) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option_id specified.'
      });
    }

    selectedOption.votes += 1;
    poll.voted_by.push(req.user.id);
    await poll.save();

    res.status(200).json({
      success: true,
      message: 'Vote cast successfully',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

export const getPollResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id).populate('created_by', 'username role');
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found.'
      });
    }

    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
    const userIdStr = req.user ? req.user.id.toString() : null;
    const hasVoted = userIdStr
      ? poll.voted_by.some((voterId) => voterId.toString() === userIdStr)
      : false;

    res.status(200).json({
      success: true,
      data: {
        _id: poll._id,
        question: poll.question,
        status: poll.status,
        expires_at: poll.expires_at,
        created_by: poll.created_by,
        total_votes: totalVotes,
        has_voted: hasVoted,
        options: poll.options.map((opt) => ({
          _id: opt._id,
          option_text: opt.option_text,
          votes: opt.votes,
          percentage: totalVotes > 0 ? Number(((opt.votes / totalVotes) * 100).toFixed(2)) : 0
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
