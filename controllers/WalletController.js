// package imports
const Sequelize = require("sequelize");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Deposits = require("../models").Deposit;
const Transactions = require("../models").Transaction;
const Referrals = require("../models").Referral;
const Chats = require("../models").Chat;
const CryptBank = require("../models").CryptBank;
const DollarValue = require("../models").DollarValue;


// imports initialization
const Op = Sequelize.Op;

exports.walletPage = (req, res, next) => {
    Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        })
        .then(unansweredChats => {
            Users.findOne({
                    where: {
                        id: {
                            [Op.eq]: req.session.userId
                        }
                    }
                })
                .then(user => {
                    if (user) {
                        Referrals.findAll({
                                where: {
                                    referral_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(referral => {
                                CryptBank.findOne({})
                                    .then(bank => {
                                        DollarValue.findOne({})
                                            .then(dollar => {
                                                res.render("dashboards/users/user_wallet", {
                                                    user: user,
                                                    email: user.email,
                                                    phone: user.phone,
                                                    wallet: user.wallet,
                                                    referral: user.referral_count,
                                                    referral_amount: referral.length * 1000,
                                                    messages: unansweredChats,
                                                    bank: bank,
                                                    dollar: dollar
                                                });
                                            })
                                            .catch(error => {
                                                req.flash('error', "Server error!");
                                                res.redirect("/");
                                            });
                                    })
                                    .catch(error => {
                                        req.flash('error', "Server error!");
                                        res.redirect("/");
                                    });
                            })
                            .catch(error => {
                                req.flash('error', "Server error!");
                                res.redirect("/");
                            });
                    } else {
                        res.redirect("back");
                    }
                })
                .catch(error => {
                    req.flash('error', "Server error!");
                    res.redirect("/");
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.fundWallet = (req, res, next) => {
    // first check if the user email is valid
    let email = req.body.email;
    let amount = req.body.amount;
    let reference = req.body.reference;
    let channel = req.body.channel;
    let userId;
    Users.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        })
        .then(user => {
            if (user) {
                userId = user.id;
                // if user exists, get amount paid and add to wallet
                let userWallet = Math.abs(Number(user.wallet));
                amount = (amount == null || amount == "") ? 0 : Math.abs(Number(amount));
                let currentWallet = userWallet + amount;
                Users.update({
                        wallet: currentWallet
                    }, {
                        where: {
                            email: {
                                [Op.eq]: email
                            }
                        }
                    })
                    .then(wallet => {
                        console.log("user2 from wallet is  id is for " + userId);
                        // add it to transaction as deposits, and also add it to the deposit table with useful details
                        Transactions.create({
                                user_id: userId,
                                amount,
                                type: "DEPOSIT"
                            })
                            .then(transaction => {
                                Deposits.create({
                                        user_id: userId,
                                        amount,
                                        reference,
                                        channel
                                    })
                                    .then(deposit => {
                                        res.status(200).json({
                                            status: true,
                                            message: "done"
                                        });
                                    })
                                    .catch(error => {
                                        console.log(`deposit error`);
                                        res.redirect("back");
                                    });
                            })
                            .catch(error => {
                                console.log(`transaction error`);
                                res.redirect("back");
                            });
                    })
                    .catch(error => {
                        console.log(`wallet update error`);
                        res.redirect("back");
                    });
            } else {
                console.log(`user not found`);
                res.redirect("back");
            }
        })
        .catch(error => {
            console.log(`fetching user error`);
            res.redirect("back");
        });
}