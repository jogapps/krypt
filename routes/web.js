// package imports
const express = require('express');
const session = require("express-session");
const flash = require("express-flash-messages");
const passport = require("passport");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const FacebookStrategy = require("passport-facebook").Strategy;
//const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Sequelize = require("sequelize");

const uniqueString = require('unique-string');
const generateUniqueId = require('generate-unique-id');

// imports initialization
const Op = Sequelize.Op;
const router = express.Router();

// local imports
const Users = require("../models").User;
const Referrals = require("../models").Referral;
const parameters = require("../config/params");
const AuthController = require("../controllers/AuthController");
const DashboardController = require("../controllers/DashboardController");
const PackageController = require("../controllers/PackageController");
const ManagerController = require("../controllers/ManagerController");
const UserController = require("../controllers/UserController");
const ChatController = require("../controllers/ChatController");
const WalletController = require("../controllers/WalletController");
const CoinqvestController = require("../controllers/CoinqvestController");
const InvestmentController = require("../controllers/InvestmentController");
const TransactionController = require("../controllers/TransactionController");
const BankDepositController = require("../controllers/BankDepositController");
const KycController = require("../controllers/KycController");
const ProfileController = require("../controllers/ProfileController");
const PaystackController = require("../controllers/PaystackController");
const AuthMiddleware = require("../middlewares/auth_middleware");
const CryptBankController = require('../controllers/CryptBankController');
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

// middlewares

router.use(passport.initialize());
router.use(passport.session());
router.use(cookieParser());

// router.use(session({
//     name: parameters.SESSION_NAME,
//     resave: false,
//     saveUninitialized: false,
//     unset: 'destroy',
//     secret: parameters.SESSION_SECRET,
//     cookie: {
//         maxAge: SEVEN_DAYS,
//         sameSite: true,
//         //secure: parameters.NODE_ENV === "production",
//         secure: process.env.NODE_ENV == "production" ? true : false
//     }
// }));

router.use(cookieSession({
    name: parameters.SESSION_NAME,
    keys: [parameters.SESSION_SECRET, parameters.SESSION_SECRET]
  }))

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

router.use(flash());

// ensuring when users logout they can't go back with back button
router.use(function (req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
// routes

router.use(function(req, res, next) {
    res.locals.role = req.session.role;
    next();
  });

passport.use(new FacebookStrategy({
        clientID: parameters.CLIENT_ID_FB,
        clientSecret: parameters.CLIENT_SECRET_FB,
        callbackURL: `${parameters.SITE_URL}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

passport.use(new GoogleStrategy({
        clientID: parameters.CLIENT_ID_GOOGLE,
        clientSecret: parameters.CLIENT_SECRET_GOOGLE,
        callbackURL: `${parameters.SITE_URL}/auth/google/callback`,
        realm: parameters.SITE_URL,
        passReqToCallback: true
    },
    function (request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

router.get("/", AuthMiddleware.redirectHome, AuthController.index);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/'
    }), (req, res) => {
        // if email exists and user does not have token
        // return email exists
        // else try to login the user
        Users.findOne({
                where: {
                    [Op.and]: [{
                            email: {
                                [Op.eq]: req.user.emails[0].value
                            }
                        },
                        {
                            oauth_id: {
                                [Op.eq]: req.user.id
                            }
                        }
                    ],
                },
            })
            .then((user) => {
                if (!user) {
                    let name = req.user.displayName;
                    let email = req.user.emails[0].value;
                    let uniqueRef = generateUniqueId({
                        length: 8,
                        useLetters: true
                      });
                    //let phone = req.body.phone;
                    //let password = bcrypt.hashSync(req.body.password, 10);

                    // check the user with that particular reference
                    Users.findOne({
                            where: {
                                reference: {
                                    [Op.eq]: req.session.ref
                                }
                            }
                        })
                        .then(refuser => {
                            // if the reference is valid, add it to the user as its referral
                            if (refuser) {
                                Users.create({
                                        name: name,
                                        email: email,
                                        //phone: phone,
                                        //password: password,
                                        reference: uniqueRef,
                                        referral_id: refuser.id,
                                        oauth_id: req.user.id,
                                        //facebook_token: req.user.accessToken
                                    })
                                    .then((newuser) => {
                                        // add user to the referral section
                                        Referrals.create({
                                                referral_id: refuser.id,
                                                user_id: newuser.id
                                            })
                                            .then(referral => {
                                                req.session.userId = newuser.id;
                                                req.session.role = newuser.role;
                                                return res.redirect(`${parameters.SITE_URL}/home`);
                                            })
                                            .catch(error => {
                                                req.flash('error', "Something went wrong try again");
                                                res.redirect("back");
                                            });
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            } else {
                                // if referral is not valid, just create the user like that
                                Users.create({
                                        name: name,
                                        email: email,
                                        reference: uniqueRef,
                                        oauth_id: req.user.id,
                                    })
                                    .then((newuser2) => {
                                        req.session.userId = newuser2.id;
                                        req.session.role = newuser2.role;
                                        req.session.views
                                        return res.redirect(`${parameters.SITE_URL}/home`);
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            }
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong try again");
                            res.redirect("back");
                        });
                } else {
                    req.session.userId = user.id;
                    req.session.role = user.role;
                    return res.redirect(`${parameters.SITE_URL}/home`);
                }
            })
            .catch(error => {
                req.flash('error', "Something went wrong try again");
                res.redirect("back");
            });
    });

router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    function (req, res) {
        // if email exists and user does not have token
        // return email exists
        // else try to login the user
        Users.findOne({
                where: {
                    [Op.and]: [{
                            email: {
                                [Op.eq]: req.user.emails[0].value
                            }
                        },
                        {
                            oauth_id: {
                                [Op.eq]: req.user.id
                            }
                        }
                    ],
                },
            })
            .then((user) => {
                if (!user) {
                    let name = req.user.displayName;
                    let email = req.user.emails[0].value;
                    let uniqueRef = generateUniqueId({
                        length: 8,
                        useLetters: true
                      });
                    //let phone = req.body.phone;
                    //let password = bcrypt.hashSync(req.body.password, 10);

                    // check the user with that particular reference
                    Users.findOne({
                            where: {
                                reference: {
                                    [Op.eq]: req.session.ref
                                }
                            }
                        })
                        .then(refuser => {
                            // if the reference is valid, add it to the user as its referral
                            if (refuser) {
                                Users.create({
                                        name: name,
                                        email: email,
                                        //phone: phone,
                                        //password: password,
                                        reference: uniqueRef,
                                        referral_id: refuser.id,
                                        oauth_id: req.user.id,
                                        //facebook_token: req.user.accessToken
                                    })
                                    .then((newuser) => {
                                        // add user to the referral section
                                        Referrals.create({
                                                referral_id: refuser.id,
                                                user_id: newuser.id
                                            })
                                            .then(referral => {
                                                req.session.userId = newuser.id;
                                                req.session.role = newuser.role;
                                                return res.redirect(`${parameters.SITE_URL}/home`);
                                            })
                                            .catch(error => {
                                                req.flash('error', "Something went wrong try again");
                                                res.redirect("back");
                                            });
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            } else {
                                // if referral is not valid, just create the user like that
                                Users.create({
                                        name: name,
                                        email: email,
                                        reference: uniqueRef,
                                        oauth_id: req.user.id,
                                    })
                                    .then((newuser2) => {
                                        req.session.userId = newuser2.id;
                                        req.session.role = newuser2.role;
                                        return res.redirect(`${parameters.SITE_URL}/home`);
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            }
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong try again");
                            res.redirect("back");
                        });
                } else {
                    req.session.userId = user.id;
                    req.session.role = user.role;
                    return res.redirect(`${parameters.SITE_URL}/home`);
                }
            })
            .catch(error => {
                req.flash('error', "Something went wrong try again");
                res.redirect("back");
            });
    });


router.post("/signin", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.login);
router.get("/signup", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.signup);
router.post("/signup", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.register);
//router.get("/signup", AuthController.signup);
//router.post("/signup", AuthController.register);
router.get("/reset", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.getLink);
router.post("/reset", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.postGetLink);
router.get("/resetpassword", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.resetPassword);
router.post("/resetpassword", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.postResetPassword);
router.post("/logout", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], AuthController.logout);
router.get("/twofactor", AuthController.twofaPage);
router.post("/twofactor",  AuthController.verify2FaKey);
router.get("/validateemail",  AuthController.emailFaPage);
router.post("/validateemail",  AuthController.verifyEmail);
router.get("/home", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], DashboardController.home);
router.get("/password", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], DashboardController.password);
router.post("/update-password", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], AuthController.changePassword);

// coinqvest routes
router.post("/createcheckout", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], CoinqvestController.createCheckout);

// users specific routes
router.get("/fundwallet", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], WalletController.walletPage);
router.post("/fundwallet", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], WalletController.fundWallet);


// users
router.get("/settings", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.settingsPage);
router.get("/users", AuthMiddleware.redirectAdminLogin, UserController.allUsers);
router.get("/packages", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], PackageController.usersPackages);
router.get("/referrals", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], DashboardController.userReferral);
router.get("/allreferrals", AuthMiddleware.redirectAdminLogin, DashboardController.allReferral);
router.get("/user_chat", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ChatController.userChatPage);
router.get("/user_kyc", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], KycController.userKyc);
router.get("/profile", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.profilePage);
router.get("/editprofile", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.editProfilePage);
router.get("/profilesettings", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.editSettingsPage);
router.post("/editprofile", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.updateProfile);
router.post("/updatetwoway", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.updateTwoWay);
router.post("/emailtwoway", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], ProfileController.updateEmailWay);
router.post("/user_kyc", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], KycController.uploadKyc);
router.get("/withdraw", [AuthMiddleware.validatedKYC, AuthMiddleware.authVerirfication], TransactionController.withdrawWallet);
router.post("/userwithdraw", [AuthMiddleware.validatedKYC, AuthMiddleware.authVerirfication], TransactionController.withdrawFromWallet);
router.get("/mywithdraws", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], TransactionController.aUserWithdrawals);
router.get("/investments", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], InvestmentController.userInvestments);
router.get("/deposits", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], TransactionController.userDeposits);
router.get("/bankdeposits", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], BankDepositController.usersUploads);
router.get("/bank-unapproved", AuthMiddleware.redirectAdminLogin, BankDepositController.unApprovedDeposit);
router.get("/bank-approved", AuthMiddleware.redirectAdminLogin, BankDepositController.approvedDeposit);
router.post("/approve-deposit", AuthMiddleware.redirectAdminLogin, BankDepositController.approveDeposits);
router.post("/disapprove-deposit", AuthMiddleware.redirectAdminLogin, BankDepositController.unApproveADeposits);
router.post("/uploadproof", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], BankDepositController.uploadBankDeposit);
router.post("/investpackage", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], PackageController.investPackage);
router.get("/banklist", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], PaystackController.getBanks);
router.post("/verifyAccount", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], PaystackController.verifyAccount);
router.post("/createwithdrawal", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], PaystackController.createTransferRecipient);
router.get("/unapprovedpaystack", AuthMiddleware.redirectAdminLogin, TransactionController.unappWithdrawPaystack);
router.post("/adminpayout", AuthMiddleware.redirectAdminLogin, PaystackController.payWithPaystack);

router.get("/dollarpage", AuthMiddleware.redirectAdminLogin, CryptBankController.dollarPage);
router.post("/dollarpage", AuthMiddleware.redirectAdminLogin, CryptBankController.postUpdateDollar);
router.get("/bankdetails", AuthMiddleware.redirectAdminLogin, CryptBankController.cryptBank);
router.post("/bankdetails", AuthMiddleware.redirectAdminLogin, CryptBankController.postUpdateBank);
router.get("/unapproved-kycs", AuthMiddleware.redirectAdminLogin, KycController.unApprovedKyc);
router.get("/approved-kycs", AuthMiddleware.redirectAdminLogin, KycController.approvedKyc);
router.post("/approve-akyc", AuthMiddleware.redirectAdminLogin, KycController.approveAKYC);
router.post("/disapprove-akyc", AuthMiddleware.redirectAdminLogin, KycController.disApproveAKYC);
router.get("/unapproved-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.unapprovedWithdrawals);
router.get("/approved-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.approvedWithdrawals);
router.post("/unapprove-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.postDisApproveWithdrawal);
router.post("/approve-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.postApproveWithdrawal);

router.get("/view-kycs/:id", AuthMiddleware.redirectAdminLogin, KycController.viewAKyc);
router.get("/packages/:id", [AuthMiddleware.redirectUserLogin, AuthMiddleware.authVerirfication], PackageController.eachPackage);
router.get("/bankdeposit/:id", AuthMiddleware.redirectAdminLogin, BankDepositController.viewADeposit);
router.get("/chats/:id", AuthMiddleware.redirectAdminLogin, ChatController.chatPage);
router.post("/delete/user", AuthMiddleware.redirectAdminLogin, UserController.deleteUser);
router.get("/deleted/users", AuthMiddleware.redirectAdminLogin, UserController.viewDeletedUsers);
router.post("/restore/user", AuthMiddleware.redirectAdminLogin, UserController.restoreUser);

// packages
router.get("/add/package", AuthMiddleware.redirectAdminLogin, PackageController.addPackage);
router.get("/view/packages", AuthMiddleware.redirectAdminLogin, PackageController.adminAllPackages);
router.post("/add/package", AuthMiddleware.redirectAdminLogin, PackageController.postAddPackage);
router.post("/update/package", AuthMiddleware.redirectAdminLogin, PackageController.postUpdatePackage);
router.post("/delete/package", AuthMiddleware.redirectAdminLogin, PackageController.deletePackage);

// managers
router.get("/add/manager", AuthMiddleware.redirectAdminLogin, ManagerController.addManager);
router.post("/add/manager", AuthMiddleware.redirectAdminLogin, ManagerController.postAddManagers);
router.get("/view/managers", AuthMiddleware.redirectAdminLogin, ManagerController.allAdmins);
router.post("/update/manager", AuthMiddleware.redirectAdminLogin, ManagerController.postUpdateManagers);
router.post("/delete/managers", AuthMiddleware.redirectAdminLogin, ManagerController.deleteManager);

router.get("/edit/package/:id", AuthMiddleware.redirectAdminLogin, PackageController.editPackage);
router.get("/edit/manager/:id", AuthMiddleware.redirectAdminLogin, ManagerController.editManager);

module.exports = router;