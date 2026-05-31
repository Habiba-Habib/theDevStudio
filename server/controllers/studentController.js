const Payment = require("../models/payment");
const Course = require("../models/Course");
const User = require("../models/User");
const Challenge = require("../models/challenges");

const TAX_RATE = 0.14;
const PROMO_CODES = {
  SAVE10: 0.1,
  EDU20: 0.2,
};

function calculateOrderTotal(coursePrice, promoCode) {
  const basePrice = Number(coursePrice) || 0;
  let subtotal = basePrice;
  const code = (promoCode || "").trim().toUpperCase();

  if (code && PROMO_CODES[code]) {
    subtotal = basePrice * (1 - PROMO_CODES[code]);
  }

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

exports.getPaymentPage = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    res.render("student/course-payment", {
      course: course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

exports.processPayment = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    const paymentMethod = req.body.paymentMethod;
    const cardNumber = req.body.cardNumber;

    let paymentStatus = "failed";

   const cleanCardNumber = (cardNumber || "").replace(/\s/g, "");

if (cleanCardNumber.length === 16) {
  paymentStatus = "successful";
}

    const { total: amountPaid } = calculateOrderTotal(
      course.price,
      req.body.promo
    );

    const payment = await Payment.create({
      student: req.session.userId,
      course: course._id,
      amount: amountPaid,
      paymentMethod: paymentMethod,
      status: paymentStatus,
    });

    if (paymentStatus === "successful") {
      await Course.findByIdAndUpdate(course._id, {
    $addToSet: { students: req.session.userId }
  });

  await User.findByIdAndUpdate(req.session.userId, {
  $addToSet: {
    enrolledCourses: {
      course: course._id,
      progress: 0
    }
  }
});

  return res.render("student/payment-success", {
    course: course,
    payment: payment,
  });
    } else {
      return res.render("student/payment-failed", {
        course: course,
        payment: payment,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};


//Added for dashboard
exports.getDashboard = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const user = await User.findById(req.session.userId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name"
      }
    });

    if (!user) {
      return res.redirect("/auth/login");
    }

        const allCourses = user.enrolledCourses
      .filter(enrollment => enrollment.course)
      .map(enrollment => ({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.instructor?.name || "Unknown Instructor",
        progress: enrollment.progress || 0
      }));

    const courses = allCourses.slice(0, 3);

    const averageProgress = courses.length
      ? Math.round(
          courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
        )
      : 0;

    const allUsersByPoints = await User.find({ role: "student" })
      .sort({ points: -1 })
      .select("_id");

    const currentUserRank =
      allUsersByPoints.findIndex(u => u._id.toString() === user._id.toString()) + 1;

    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(5)
      .select("name avatar points");

    const leaderboard = topUsers.map((user, index) => ({
      name: user.name,
      avatar: user.avatar || "/images/avatars/avatar1g.png",
      points: user.points || 0,
      rank: index + 1
    }));

    const rawChallenges = await Challenge.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(3);

   const challenges = rawChallenges.map(challenge => {
  const dueInDays = challenge.dueDate
  ? Math.max(
      0,
      Math.ceil((challenge.dueDate - new Date()) / (1000 * 60 * 60 * 24))
    )
  : 7;

  return {
    title: challenge.title,
    difficulty: challenge.difficulty,
    points: challenge.points,
    dueInDays
  };
});
    const stats = {
      enrolledCourses: allCourses.length,
      enrolledChange: "",
      progress: averageProgress,
      progressChange: "",
      rank: currentUserRank || 0,
      rankLabel: currentUserRank ? "Global Rank" : "",
      totalPoints: user.points || 0,
      pointsChange: ""
    };

    res.render("student/dashboard", {
      user,
      stats,
      courses,
      challenges,
      leaderboard
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};
exports.getMyCourses = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const user = await User.findById(req.session.userId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name"
      }
    });

    if (!user) {
      return res.redirect("/auth/login");
    }

    const courses = user.enrolledCourses
      .filter(enrollment => enrollment.course)
      .map(enrollment => ({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        image: enrollment.course.thumbnail,
        instructorName: enrollment.course.instructor?.name || "Instructor",
        description: enrollment.course.shortDescription,
        duration: enrollment.course.duration,
        progress: enrollment.progress || 0,
        status: enrollment.progress >= 100 ? "completed" : "ongoing"
      }));

   const avgProgress = courses.length
  ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
  : 0;

res.render("student/my-courses", {
  courses,
  totalCourses: courses.length,
  inProgressCourses: courses.filter(course => course.status !== "completed").length,
  completedCourses: courses.filter(course => course.status === "completed").length,
  avgProgress: `${avgProgress}%`
});

  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};
//leaderboard page
exports.getLeaderboard = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const players = await User.find({ role: "student" })
      .sort({ points: -1 })
      .limit(10);

    const currentUser = await User.findById(req.session.userId);

    if (!currentUser) {
      return res.redirect("/auth/login");
    }

    res.render("student/leaderboard", {
      players,
      topPlayers: players.slice(0, 3),
      currentUser
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

exports.getStartChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).render("public/page-404", {
        message: "Challenge not found",
      });
    }

    res.render("student/start-challenge", {
      challenge: {
        ...challenge.toObject(),
        summary: challenge.description,
        examples: challenge.testCases
          .filter(testCase => !testCase.isHidden)
          .map(testCase => ({
            input: testCase.input,
            output: testCase.expectedOutput,
            explanation: "",
          })),
        constraints: [],
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).render("public/page-404", {
      message: "Server error",
    });
  }
};
// ── parse input string into an array of arguments ──
function parseInput(input) {
  // try wrapping in [] to parse multiple args e.g. "[2,7,11,15], 9"
  try { return JSON.parse('[' + input + ']'); } catch (e) {}
  // try as single JSON value
  try { return [JSON.parse(input)]; } catch (e) {}
  // fallback: return as plain string
  return [input];
}

// ── auto-detect function name from code ──
function detectFnName(code) {
  const match = code.match(
    /(?:function\s+(\w+)\s*\()|(?:(?:var|let|const)\s+(\w+)\s*=\s*function)|(?:(?:var|let|const)\s+(\w+)\s*=\s*\()/
  );
  if (match) return match[1] || match[2] || match[3];
  return null;
}

// ── JDoodle language identifiers ──
const JDOODLE_LANGUAGES = {
  python: { language: 'python3',  versionIndex: '3' },
  cpp:    { language: 'cpp17',    versionIndex: '0' },
};

const JDOODLE_URL           = 'https://api.jdoodle.com/v1/execute';
const JDOODLE_CLIENT_ID     = process.env.JDOODLE_CLIENT_ID     || '';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

// ── convert JSON-style input "[2,7,11,15], 9" → plain stdin lines ──
function convertInputToStdin(rawInput) {
  try {
    const args = JSON.parse('[' + rawInput + ']');
    const lines = [];
    for (const arg of args) {
      if (Array.isArray(arg)) {
        lines.push(String(arg.length));
        lines.push(arg.join(' '));
      } else {
        lines.push(String(arg));
      }
    }
    return lines.join('\n');
  } catch (e) {
    return rawInput;
  }
}

// ── run code via JDoodle API ──
async function runWithJDoodle(code, language, stdin) {
  if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
    return { output: '', error: 'JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET is not set in your .env file.' };
  }

  const lang = JDOODLE_LANGUAGES[language];

  const response = await fetch(JDOODLE_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId:     JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script:       code,
      language:     lang.language,
      versionIndex: lang.versionIndex,
      stdin:        stdin,
    }),
  });

  const data = await response.json();
  console.log('[JDoodle response]', JSON.stringify(data, null, 2));

  // API-level error
  if (data.error) {
    return { output: '', error: data.error };
  }

  // statusCode 200 means success, anything else is an error
  if (data.statusCode && data.statusCode !== 200) {
    return { output: '', error: data.output || 'Execution error' };
  }

  const output = (data.output || '').trim();

  // JDoodle puts compilation/runtime errors in output with a non-zero exitCode
  if (data.exitCode && data.exitCode !== 0 && data.exitCode !== '0') {
    return { output: '', error: output };
  }

  return { output, error: '' };
}

// ── helper: run code against a single test case ──
async function runTestCase(code, language, test) {
  let passed = false;
  let actualOutput = '';
  let error = '';

  try {
    if (language === 'js') {
      const fnName = detectFnName(code);
      if (!fnName) throw new Error('Could not detect function name. Make sure you define a named function.');
      const fn     = new Function(code + `\n return ${fnName};`)();
      const args   = parseInput(test.input);
      const result = fn(...args);
      actualOutput = JSON.stringify(result);
      passed       = actualOutput.trim() === test.expectedOutput.trim();

    } else if (language === 'python' || language === 'cpp') {
      const stdin  = convertInputToStdin(test.input);
      const result = await runWithJDoodle(code, language, stdin);
      if (result.error && !result.output) {
        error        = result.error;
        actualOutput = '';
        passed       = false;
      } else {
        actualOutput = result.output;
        error        = result.error;
        passed       = actualOutput.trim() === test.expectedOutput.trim();
      }

    } else {
      actualOutput = 'Language not supported.';
      passed       = false;
    }
  } catch (e) {
    error  = e.message;
    passed = false;
  }

  return { input: test.input, expected: test.expectedOutput, actual: actualOutput, passed, error };
}

// ── Run Code (visible tests only, returns JSON) ──
exports.runCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const visibleTests = challenge.testCases.filter(t => !t.isHidden);
    const results = await Promise.all(visibleTests.map(t => runTestCase(code, language, t)));

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Submit Solution (all tests, redirect to review page) ──
exports.submitChallenge = async (req, res) => {
  try {
    const { code, language } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // run against ALL test cases
    const results = await Promise.all(challenge.testCases.map(async t => ({
      ...(await runTestCase(code, language, t)),
      isHidden: t.isHidden,
    })));

    const passed     = results.filter(r => r.passed).length;
    const total      = results.length;
    const allPassed  = passed === total;

    // full points only if all tests passed
    const pointsEarned = allPassed ? challenge.points : 0;

    // award points if not already solved and all tests passed
    let alreadySolved = false;
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      alreadySolved = user.badges.some(b => b.name === `solved:${challenge._id}`);
      if (!alreadySolved && allPassed) {
        await User.findByIdAndUpdate(req.session.userId, {
          $inc: { points: pointsEarned },
          $push: { badges: { name: `solved:${challenge._id}`, icon: '⚡' } }
        });
        if (allPassed) {
          await Challenge.findByIdAndUpdate(challenge._id, { $inc: { solvedCount: 1 } });
        }
      }
    }

    // store review data in session and redirect
    req.session.challengeReview = {
      challengeId:    challenge._id.toString(),
      challengeTitle: challenge.title,
      difficulty:     challenge.difficulty,
      totalPoints:    challenge.points,
      pointsEarned:   alreadySolved ? 0 : pointsEarned,
      alreadySolved,
      passed,
      total,
      allPassed,
      code,
      language,
      results,
    };

    res.json({ success: true, redirect: `/student/challenge/${challenge._id}/review` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Review Page ──
exports.getChallengeReview = async (req, res) => {
  try {
    const review = req.session.challengeReview;
    if (!review || review.challengeId !== req.params.id) {
      return res.redirect(`/student/start-challenge/${req.params.id}`);
    }
    res.render('student/challenge-review', { review });
  } catch (err) {
    console.error(err);
    res.status(500).render('public/page-404', { message: 'Server error' });
  }
};

exports.activateInstructorAccount = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.instructorStatus !== 'approved') {
      return res.status(400).json({ message: "Your application is not approved yet" });
    }

    // Change role from student to instructor
    await User.findByIdAndUpdate(req.session.userId, {
      role: 'instructor'
    });

    // Update session
  req.session.role = 'instructor';
if (req.session.user) {
  req.session.user.role = 'instructor';
}


    res.json({ success: true, redirectUrl: '/instructor/dashboard' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
