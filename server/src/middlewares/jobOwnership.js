const { Job } = require('../models');

module.exports = {
  ownJob: async (req, res, next) => {
    try {
      const jobId = req.params.id;
      if (!jobId) return res.status(400).json({ success: false, error: 'Job ID required' });

      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      if (job.employerId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You do not own this job' });
      }
      req.job = job;
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};