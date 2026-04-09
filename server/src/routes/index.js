'use strict';
const router = require('express').Router();


router.use('/auth', require('./auth.routes'))
router.use('/auth-employer', require('./employer.routes'))
router.use('/company', require('./companyRoutes'))
router.use('/jobs', require('./job.routes'))
router.use('/applications', require('./job.application.routes'))

router.use('/job-assign', require("./job.assign.routes"))

router.use('/ad', require("./admin.routes"))

// pendings 
router.use('/contact', require('./contact.routes'))
router.use('/pages', require('./page.routes'))
router.use('/why-choose-us', require('./whychoose.routes'))
router.use('/organization-logo', require('./org.routes'))
router.use('/services', require('./service.routes'))


module.exports = router;