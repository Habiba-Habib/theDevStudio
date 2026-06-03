const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/payment');
const bcrypt = require("bcryptjs");
//const upload = require('../config/cloudinary');

// ─── DASHBOARD ────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  try {
    const instructor = await User.findById(req.session.user._id);
    
    // Get published courses
    const publishedCourses = await Course.find({ 
      instructor: req.session.user._id,
      isPublished: true 
    });
    
    // Get draft courses
    const draftCourses = await Course.find({ 
      instructor: req.session.user._id,
      isPublished: false 
    });

    const courseIds = publishedCourses.map(course => course._id);

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const enrollmentData = new Array(6).fill(0);
    const revenueData = new Array(6).fill(0);

    publishedCourses.forEach(course => {
      const createdMonth = course.createdAt ? course.createdAt.getMonth() : null;

      if (createdMonth !== null && createdMonth < 6) {
        enrollmentData[createdMonth] += course.students.length;
      }
    });

    const payments = await Payment.find({
      course: { $in: courseIds },
      status: 'successful'
    });

    payments.forEach(payment => {
      const paymentMonth = payment.createdAt ? payment.createdAt.getMonth() : null;

      if (paymentMonth !== null && paymentMonth < 6) {
        revenueData[paymentMonth] += payment.amount;
      }
    });

    // Stats for dashboard (only published courses)
    const totalCourses = publishedCourses.length;
    const totalStudents = publishedCourses.reduce((sum, c) => sum + c.students.length, 0);
    const totalRevenue = publishedCourses.reduce((sum, c) => sum + (c.price * c.students.length), 0);

    res.render('instructor/dashboard', {
      instructor,
      publishedCourses,     // ← Make sure this is here
      draftCourses,         // ← Make sure this is here
      stats: {
        totalCourses,
        totalStudents,
        totalRevenue,
        studentsChange: '',
        coursesChange: '',
        revenueChange: '',
        ratingChange: '',
        avgRating: publishedCourses.length
          ? (publishedCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / publishedCourses.length).toFixed(1)
          : '0.0'
      },
      chartData: {
        months: monthLabels,
        enrollments: enrollmentData,
        revenue: revenueData
      }
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error');
  }
};


// ─── PROFILE ──────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect("/auth/login");
    }

    const instructor = await User.findById(req.session.user._id);

    if (!instructor) {
      return res.status(404).render("public/page-404", {
        message: "Instructor not found"
      });
    }

    const instructorCourses = await Course.find({
      instructor: req.session.user._id
    });

    res.render("shared/profile", {
      user: instructor,
      completedCourses: [],
      certificates: [],
      instructorCourses,
      adminStats: null,
      rank: null
    });
  } catch (err) {
    console.error("Instructor profile error:", err);
    res.status(500).render("public/page-404", {
      message: "Server error"
    });
  }
};

exports.getEditProfile = async (req, res) => {
  try {
    const instructor = await User.findById(req.session.user._id);
    res.render('shared/edit-profile', { user: instructor, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      bio,
      location,
      avatar,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    const userId = req.session.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/auth/login");
    }

    const updateData = {
      name: name?.trim(),
      email: email?.trim(),
      bio: bio?.trim(),
      location: location?.trim(),
      avatar: (avatar || '').replace(/^.*\//, ''), // keep filename only
    };

    if (username && username.trim()) {
      const usernameExists = await User.findOne({
        username: username.trim(),
        _id: { $ne: userId }
      });

      if (usernameExists) {
        return res.render("shared/edit-profile", {
          user,
          errors: ["Username is already taken."]
        });
      }

      updateData.username = username.trim();
    } else {
      updateData.$unset = { username: "" };
    }

    if (email && email.trim()) {
      const emailExists = await User.findOne({
        email: email.trim(),
        _id: { $ne: userId }
      });

      if (emailExists) {
        return res.render("shared/edit-profile", {
          user,
          errors: ["Email is already used by another account."]
        });
      }
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.render("shared/edit-profile", {
          user,
          errors: ["Please fill all password fields."]
        });
      }

      if (newPassword !== confirmPassword) {
        return res.render("shared/edit-profile", {
          user,
          errors: ["New passwords do not match."]
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.render("shared/edit-profile", {
          user,
          errors: ["Current password is incorrect."]
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    req.session.user = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    };

    res.redirect("/instructor/profile");
  } catch (err) {
    console.error("Instructor update profile error:", err);
    res.status(500).send("Failed to update profile.");
  }
};

// ─── CREATE COURSE — STEP 1 ───────────────────────────────────
// Collects: title, shortDescription, fullDescription,
//           category, level, thumbnail

exports.getCreateStep1 = async (req, res) => {
  try {
    // Check if there's an in-progress course to resume
    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

   res.render('instructor/create-step1', {
  draft,
  errors: [],
  title: 'Create New Course - EduPlatform',
  basePath: '/',
  pageTitle: 'Create New Course',
  pageDescription: 'Share your knowledge with students worldwide',
  courseTitle: draft?.title || '',
  shortDescription: draft?.shortDescription || '',
  fullDescription: draft?.fullDescription || '',
  category: draft?.category || 'Web Development',
  level: draft?.level || 'Beginner',
  submitButtonText: 'Next: Add Curriculum'
});
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.postCreateStep1 = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, category, level, offersCertificate } = req.body;
    
    // Check if a draft already exists — update it, don't create a new one
    let course = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

    const thumbnailUrl = req.file
      ? req.file.path // Streams remote Cloudinary URL!
      : (course?.thumbnail || '');

    if (course) {
      // Update existing draft
      await Course.findByIdAndUpdate(course._id, {
        title,
        shortDescription,
        fullDescription,
        category,
        level,
        thumbnail: thumbnailUrl,
        offersCertificate: offersCertificate === 'true'
      });
    } else {
      // Create new draft
      course = await Course.create({
        title,
        shortDescription,
        fullDescription,
        category,
        level,
        thumbnail: thumbnailUrl,
        instructor: req.session.user._id,
        isPublished: false,
        offersCertificate: offersCertificate === 'true'
      });
    }

    // Move to step 2
    res.redirect('/instructor/create/step2');
  } catch (err) {
    console.error(err);
    res.status(500).render('public/page-404', {
      message: 'Failed to create course'
    });
  }
};

// ─── CREATE COURSE — STEP 2 ───────────────────────────────────
// Collects: learning outcomes, sections, lessons

exports.getCreateStep2 = async (req, res) => {
  try {
    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

    // If no draft exists, send back to step 1
    if (!draft) return res.redirect('/instructor/create/step1');

    res.render('instructor/create-step2', { draft, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.postCreateStep2 = async (req, res) => {
  try {
    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

    if (!draft) return res.redirect('/instructor/create/step1');

    // outcomes[] comes as array from form
    let outcomesArray = req.body['outcomes[]'] || req.body.outcomes || [];
    if (!Array.isArray(outcomesArray)) outcomesArray = [outcomesArray];
    outcomesArray = outcomesArray.map(o => o.trim()).filter(o => o);

    // sections come as sections[0][title], sections[0][lessons][0][title], sections[0][lessons][0][videoUrl] etc.
    const rawSections = req.body.sections || {};
    const sectionsArray = Object.keys(rawSections).map(i => {
      const sec = rawSections[i];
      const rawLessons = sec.lessons || {};
      
      // Convert lessons object to array
      const lessonsArray = Object.keys(rawLessons).map(j => {
        const lesson = rawLessons[j];
        return {
          title: (lesson.title || '').trim(),
          type: 'video',
          videoSource: lesson.videoSource || 'url',
          videoUrl: (lesson.videoUrl || '').trim(),
          videoFile: '', // Will be handled in edit page with file uploads
          content: '',
          duration: ''
        };
      }).filter(l => l.title); // Only include lessons with titles
      
      return {
        title: (sec.title || '').trim(),
        lessons: lessonsArray
      };
    }).filter(s => s.title); // Only include sections with titles

    await Course.findByIdAndUpdate(draft._id, {
      learningOutcomes: outcomesArray,
      sections: sectionsArray
    });

    res.redirect('/instructor/create/step3');
  } catch (err) {
    console.error('Step 2 error:', err);
    res.status(500).render('public/page-404', { message: 'Failed to save curriculum' });
  }
};



// ─── CREATE COURSE — STEP 3 ───────────────────────────────────
// Collects: price, duration — shows preview — final publish

exports.getCreateStep3 = async (req, res) => {
  try {
    // Check if a specific course ID is provided (editing existing draft)
    const courseId = req.query.courseId;
    
    let draft;
    if (courseId) {
      // Load specific draft by ID
      draft = await Course.findOne({
        _id: courseId,
        instructor: req.session.user._id,
        isPublished: false
      });
    } else {
      // Find any draft for this instructor
      draft = await Course.findOne({
        instructor: req.session.user._id,
        isPublished: false
      });
    }

    if (!draft) return res.redirect('/instructor/create/step1');

    res.render('instructor/create-step3', { draft, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};


exports.postCreateStep3 = async (req, res) => {
  try {
    console.log('========================================');
    console.log('POST CREATE STEP 3 - DEBUGGING');
    console.log('========================================');
    console.log('req.body:', req.body);
    console.log('req.query:', req.query);
    console.log('User ID:', req.session.user._id);
    
    const { price, duration, action, courseId } = req.body;
    
    console.log('Extracted values:');
    console.log('- price:', price);
    console.log('- duration:', duration);
    console.log('- action:', action);
    console.log('- courseId:', courseId);

    // Try to find the specific draft
    let draft;
    if (courseId) {
      console.log('Looking for draft with specific courseId:', courseId);
      draft = await Course.findOne({
        _id: courseId,
        instructor: req.session.user._id,
        isPublished: false
      });
    } else {
      console.log('Looking for ANY draft for this instructor');
      draft = await Course.findOne({
        instructor: req.session.user._id,
        isPublished: false
      });
    }

    console.log('Draft found?', draft ? 'YES' : 'NO');
    if (draft) {
      console.log('Draft ID:', draft._id);
      console.log('Draft title:', draft.title);
      console.log('Draft isPublished:', draft.isPublished);
    }

    if (!draft) {
      console.log('NO DRAFT FOUND - Redirecting or returning error');
      if (action === 'draft') {
        return res.json({ success: false, message: 'No draft found' });
      }
      return res.redirect('/instructor/create/step1');
    }

    console.log('Updating course with:');
    console.log('- price:', Number(price) || 0);
    console.log('- duration:', duration);
    console.log('- isPublished:', action === 'publish');

    // Update price and duration
    const updatedCourse = await Course.findByIdAndUpdate(
      draft._id,
      {
        price: Number(price) || 0,
        duration: duration,
        isPublished: false,
        approvalStatus: action === "publish" ? "pending" : "pending",
        submittedAt: action === "publish" ? new Date() : draft.submittedAt
      },
      { new: true }
    );

    console.log('Course updated successfully');
    console.log('Updated course isPublished:', updatedCourse.isPublished);

    // If saving as draft, return JSON response
    if (action === 'draft') {
      console.log('Action is DRAFT - returning JSON response');
      return res.json({ 
        success: true, 
        message: 'Draft saved successfully' 
      });
    }

    // If publishing, render success page
    if (action === 'publish') {
      console.log('Action is PUBLISH - rendering page-created');
      console.log('Course title:', updatedCourse.title);
      return res.render('instructor/page-created', {
        courseTitle: updatedCourse.title
      });
    }

    // Default fallback
    console.log('No specific action - redirecting to dashboard');
    res.redirect('/instructor/dashboard');

  } catch (err) {
    console.error('========================================');
    console.error('STEP 3 ERROR:');
    console.error('========================================');
    console.error(err);
    console.error('Stack trace:', err.stack);
    
    if (req.body.action === 'draft') {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save draft' 
      });
    }
    
    res.status(500).render('public/page-404', { 
      message: 'Failed to publish course' 
    });
  }
};




// ─── DELETE DRAFT ─────────────────────────────────────────────

exports.deleteDraft = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const draft = await Course.findOneAndDelete({
      _id: courseId,
      instructor: req.session.user._id,
      isPublished: false
    });

    if (!draft) {
      return res.status(404).render('public/page-404', { 
        message: 'Draft not found or already published' 
      });
    }

    res.redirect('/instructor/dashboard');
  } catch (err) {
    console.error('Delete draft error:', err);
    res.status(500).render('public/page-404', { 
      message: 'Failed to delete draft' 
    });
  }
};




// ─── EDIT COURSE ──────────────────────────────────────────────

exports.getEditCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.session.user._id // security: only their own courses
    });

    if (!course) return res.status(404).render('public/error-404');

    res.render('instructor/edit-course', { course, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, category, level, price, duration, isPublished } = req.body;

    const updateData = { 
      title, 
      shortDescription, 
      fullDescription, 
      category, 
      level, 
      price, 
      duration,
      isPublished: isPublished === 'true' // Save published state!
    };

    // Handle thumbnail upload
    if (req.files && req.files.length > 0) {
      const thumbnailFile = req.files.find(f => f.fieldname === 'thumbnail');
      if (thumbnailFile) {
        updateData.thumbnail = thumbnailFile.path; // Remote Cloudinary path
      }
    }


    // Handle learning outcomes
    let outcomesArray = req.body['outcomes[]'] || req.body.outcomes || [];
    if (!Array.isArray(outcomesArray)) outcomesArray = [outcomesArray];
    updateData.learningOutcomes = outcomesArray.map(o => o.trim()).filter(o => o);


    // 1. Process all uploaded files first to build a map of lesson videos
    const uploadedVideos = {};
    (req.files || []).forEach(file => {
      if (file.fieldname === 'thumbnail') {
        updateData.thumbnail = file.path; // Remote Cloudinary path
      }
      const rMatch = file.fieldname.match(/^sections_(\d+)_lessons_(\d+)_resourceFile$/);
if (rMatch) uploadedResources[`${rMatch[1]}_${rMatch[2]}`] = file.path;

      const uploadedResources = {};


      const match = file.fieldname.match(/^sections_(\d+)_lessons_(\d+)_videoFile$/);
      if (match) {
        uploadedVideos[`${match[1]}_${match[2]}`] = file.path; // Remote Cloudinary path
      }
    });

    // 2. Handle sections, mapping lessons robustly whether they are arrays or sparse objects
    const rawSections = req.body.sections || {};

    updateData.sections = Object.keys(rawSections).map(i => {
      const sec = rawSections[i];
      let lessons = sec.lessons || [];
      let lessonsList = [];

      if (Array.isArray(lessons)) {
        lessonsList = lessons.map((l, j) => {
          const fileKey = `${i}_${j}`;
          const videoFile = uploadedVideos[fileKey] || l.existingVideoFile || '';
          return {
            title: (l.title || '').trim(),
            type: 'video',
            videoSource: l.videoSource || 'url',
            videoUrl: (l.videoUrl || '').trim(),
            videoFile: videoFile,
            resourceFile: uploadedResources[fileKey] || l.existingResourceFile || '',

            duration: (l.duration || '').trim(),
            content: ''
            
          };
        });
      } else {
        // It's an object with keys (e.g. '0', '1', '2' due to sparse indices after deletions)
        lessonsList = Object.keys(lessons).map(j => {
          const l = lessons[j];
          const fileKey = `${i}_${j}`;
          const videoFile = uploadedVideos[fileKey] || l.existingVideoFile || '';
          return {
            title: (l.title || '').trim(),
            type: 'video',
            videoSource: l.videoSource || 'url',
            videoUrl: (l.videoUrl || '').trim(),
            videoFile: videoFile,
            resourceFile: uploadedResources[fileKey] || l.existingResourceFile || '',
            duration: (l.duration || '').trim(),
            content: ''
          };
        });
      }

      return {
        title: (sec.title || '').trim(),
        lessons: lessonsList.filter(l => l.title)
      };
    }).filter(s => s.title);

    // 3. Save updates to database
    await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.session.user._id },
      updateData,
      { new: true }
    );

       // Redirect with query parameter so EJS shows the popup
    res.redirect(`/instructor/courses/${req.params.id}/edit?saved=true`);


  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).send('Failed to update course. Please try again.');
  }
};


// ─── DELETE COURSE ────────────────────────────────────────────

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.session.user._id // security: only their own courses
    });

    res.redirect('/instructor/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── VIEW ENROLLED STUDENTS ───────────────────────────────────

exports.getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.session.user._id
    });

    if (!course) return res.status(404).render('public/error-404');

    const students = await User.find({
      enrolledCourses: course._id,
      role: 'student'
    }).select('name email avatar memberSince progress lastActive enrolledAt');

    // Calculate stats
    const avgProgress = students.length
      ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
      : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeToday = students.filter(s =>
      s.lastActive && new Date(s.lastActive) >= today
    ).length;

    const nearCompletion = students.filter(s =>
      (s.progress || 0) >= 80
    ).length;

    // Fetch submissions for this course (if you have a Submission model)
    // For now, pass empty array to prevent error
    const submissions = [];

    res.render('instructor/enrolled-students', {
      course,
      students,
      avgProgress,
      activeToday,
      nearCompletion,
      submissions  // Add this
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};



