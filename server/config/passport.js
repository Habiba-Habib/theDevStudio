
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

/**
 * Find user by provider id, or link/create by email.
 */
async function findOrCreateOAuthUser(profile, provider) {
  const providerId = String(profile.id);
  const idField = provider === "google" ? "googleId" : "githubId";

  const email =
    profile.emails?.[0]?.value?.toLowerCase() ||
    profile._json?.email?.toLowerCase() ||
    null;

  let user = await User.findOne({ [idField]: providerId });
  if (user) return user;

  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user[idField] = providerId;
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = provider;
      }
      if (profile.photos?.[0]?.value && !user.avatar) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
      return user;
    }
  }

  const displayName =
    profile.displayName ||
    [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(" ") ||
    profile.username ||
    "User";

  return User.create({
    name: displayName,
    email: email || `${provider}-${providerId}@oauth.thedevstudio.local`,
    [idField]: providerId,
    authProvider: provider,
    avatar: profile.photos?.[0]?.value || "",
    role: "student",
  });
}

function configurePassport() {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            "http://localhost:3000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser(profile, "google");
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  } else {
    console.warn("Google OAuth: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL:
            process.env.GITHUB_CALLBACK_URL ||
            "http://localhost:3000/auth/github/callback",
          scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser(profile, "github");
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  } else {
    console.warn("GitHub OAuth: missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in .env");
  }
}

module.exports = { configurePassport };