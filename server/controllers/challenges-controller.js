const Challenge = require('../models/challenges');
const User = require("../models/User");


exports.getAllChallenges = async (req, res) => {
  try {
    const { difficulty, category, search } = req.query;

    const filter = { isPublished: true };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const challenges = await Challenge.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.render("guest/challenge-description", {
      challenges,
      filters: { difficulty, category, search },
    });
  } catch (err) {
    console.error("getAllChallenges error:", err);
    res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    if (!challenge) {
      return res.status(404).render("public/error-page", {
        statusCode: 404,
        errorTitle: "Challenge Not Found",
        message: "This challenge does not exist or was removed."
      });
    }

    const visibleTestCases = challenge.testCases.filter((tc) => !tc.isHidden);

    res.render("challenges/challenge-description", {
      challenge,
      visibleTestCases,
    });
  } catch (err) {
    console.error("getChallengeById error:", err);
    res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};

exports.getManageChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.render("admin/manage-challenges", { challenges });
  } catch (err) {
    console.error("getManageChallenges error:", err);
    res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
});
  }
};
exports.getCreateChallenge = (req, res) => {
  res.render("admin/create-challenge", { error: null, formData: {} });
};

exports.postCreateChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      points,
      starterCode,
      isPublished,
    } = req.body;

    const testCases = [];
    if (req.body.testInput) {
      const inputs = Array.isArray(req.body.testInput)
        ? req.body.testInput
        : [req.body.testInput];
      const outputs = Array.isArray(req.body.testOutput)
        ? req.body.testOutput
        : [req.body.testOutput];
      const hidden = Array.isArray(req.body.testHidden)
        ? req.body.testHidden
        : [req.body.testHidden];

      inputs.forEach((input, i) => {
        if (input.trim()) {
          testCases.push({
            input,
            expectedOutput: outputs[i] || "",
            isHidden: hidden[i] === "on",
          });
        }
      });
    }

    const challenge = new Challenge({
      title,
      description,
      difficulty,
      category,
      points: Number(points),
      starterCode,
      testCases,
      createdBy: req.user._id, // set by auth middleware
      isPublished: isPublished === "on",
    });

    await challenge.save();
    res.redirect("/admin/challenges");
  } catch (err) {
    console.error("postCreateChallenge error:", err);
    res.render("admin/create-challenge", {
      error: err.message,
      formData: req.body,
    });
  }
};

exports.getEditChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).render("public/error-page", {
        statusCode: 404,
        errorTitle: "Challenge Not Found",
        message: "This challenge does not exist or was removed."
      });
    }
    res.render("admin/create-challenge", { challenge, error: null });
  } catch (err) {
    console.error("getEditChallenge error:", err);
    res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
});
  }
};

exports.postEditChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      points,
      starterCode,
      isPublished,
    } = req.body;

    const testCases = [];
    if (req.body.testInput) {
      const inputs = Array.isArray(req.body.testInput)
        ? req.body.testInput
        : [req.body.testInput];
      const outputs = Array.isArray(req.body.testOutput)
        ? req.body.testOutput
        : [req.body.testOutput];
      const hidden = Array.isArray(req.body.testHidden)
        ? req.body.testHidden
        : [req.body.testHidden];

      inputs.forEach((input, i) => {
        if (input.trim()) {
          testCases.push({
            input,
            expectedOutput: outputs[i] || "",
            isHidden: hidden[i] === "on",
          });
        }
      });
    }

    await Challenge.findByIdAndUpdate(req.params.id, {
      title,
      description,
      difficulty,
      category,
      points: Number(points),
      starterCode,
      testCases,
      isPublished: isPublished === "on",
    });

    res.redirect("/admin/challenges");
  } catch (err) {
    console.error("postEditChallenge error:", err);
  res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
});
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.redirect("/admin/challenges");
  } catch (err) {
    console.error("deleteChallenge error:", err);
    res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
});
  }
};

