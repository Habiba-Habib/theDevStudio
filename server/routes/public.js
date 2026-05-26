const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Public pages
router.get('/', (req, res) => res.render('public/index'));
router.get('/home', (req, res) => res.render('public/home'));
router.get('/page-404', (req, res) => res.render('public/page-404'));


// Challenges
router.get('/challenges/:id', (req, res) => res.render('challenges/challenge-description'));


// Instructor public pages
router.get('/become-instructor', (req, res) => res.render('instructor/become-instructor'));
router.get('/become-instructor/step2', (req, res) => res.render('instructor/become-instructor2'));
router.get('/become-instructor/step3', (req, res) => res.render('instructor/become-instructor3'));

module.exports = router;