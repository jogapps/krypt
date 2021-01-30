// package imports
const Sequelize = require("sequelize");
const moment = require("moment");

// local imports
const Referrals = require("../models").Referral;
const Users = require("../models").User;
const Packages = require("../models").Package;
const Kycs = require("../models").Kyc;
const Investments = require("../models").Investment;
const Chats = require("../models").Chat;

// imports initialization
const Op = Sequelize.Op;


exports.home = (req, res, next) => {
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
            if (req.session.role == 2 || req.session.role == "2" || req.session.role == 3 || req.session.role == "3") {

                // get user wallet, referral count, total investment, active investment, kyc
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
                            }).then(referral => {
                                Investments.findAll({
                                        where: {
                                            user_id: {
                                                [Op.eq]: req.session.userId
                                            }
                                        },
                                        paranoid: false,
                                    })
                                    .then(investment => {
                                        Investments.findAll({
                                                where: {
                                                    [Op.and]: [{
                                                            user_id: {
                                                                [Op.eq]: req.session.userId
                                                            }
                                                        },
                                                        {
                                                            expiredAt: {
                                                                [Op.gte]: moment().format('YYYY-MM-DD HH:mm:ss')
                                                            }
                                                        }
                                                    ]
                                                },
                                                paranoid: false,
                                            })
                                            .then(activeInvestments => {
                                                Kycs.findOne({
                                                        where: {
                                                            user_id: {
                                                                [Op.eq]: req.session.userId
                                                            }
                                                        }
                                                    })
                                                    .then(kyc => {
                                                        if (kyc) {
                                                            res.render("dashboards/users/user_home", {
                                                                user: user,
                                                                kyc: kyc.status,
                                                                wallet: user.wallet,
                                                                referral: referral.length,
                                                                investment: investment.length,
                                                                active_investment: activeInvestments.length,
                                                                messages: unansweredChats
                                                            });
                                                        } else {
                                                            res.render("dashboards/users/user_home", {
                                                                user: user,
                                                                kyc: 0,
                                                                wallet: user.wallet,
                                                                referral: referral.length,
                                                                referral_amount: referral.length * 1000,
                                                                investment: investment.length,
                                                                active_investment: activeInvestments.length,
                                                                messages: unansweredChats
                                                            });
                                                        }
                                                    })
                                                    .catch(error => {
                                                        res.redirect("/");
                                                    });
                                            })
                                            .catch(error => {
                                                res.redirect("/");
                                            });
                                    })
                                    .catch(error => {
                                        res.redirect("/");
                                    });
                            }).catch(error => {
                                res.redirect("/");
                            });

                        } else {
                            res.redirect("/");
                        }
                    })
                    .catch(error => {
                        res.redirect("/");
                    });
            } else if (req.session.role == 1 || req.session.role == "1") {
                Users.findAll({
                        where: {
                            deletedAt: {
                                [Op.eq]: null
                            }
                        }
                    })
                    .then(users => {
                        let usersCount = users.length;
                        Users.findAll({
                                where: {
                                    role: {
                                        [Op.eq]: 2
                                    }
                                }
                            })
                            .then(admins => {
                                let adminCount = admins.length;
                                Users.findAll({
                                        where: {
                                            role: {
                                                [Op.eq]: 3
                                            }
                                        },
                                        order: [
                                            ['createdAt', 'DESC'],
                                        ],
                                    })
                                    .then(activeUsers => {
                                        let activeUsersCount = activeUsers.length;
                                        Packages.findAll({
                                                where: {
                                                    deletedAt: {
                                                        [Op.eq]: null
                                                    }
                                                }
                                            })
                                            .then(packages => {
                                                let packageCount = packages.length;
                                                Referrals.findAll({
                                                        where: {
                                                            deletedAt: {
                                                                [Op.eq]: null
                                                            }
                                                        }
                                                    })
                                                    .then(referrals => {
                                                        let referralCount = referrals.length;
                                                        res.render("dashboards/home", {
                                                            usersCount: usersCount,
                                                            adminCount: adminCount,
                                                            activeUsersCount: activeUsersCount,
                                                            referralCount: referralCount,
                                                            packageCount: packageCount,
                                                            users: activeUsers,
                                                            messages: unansweredChats
                                                        });
                                                    })
                                                    .catch(error => {
                                                        res.redirect("/");
                                                    });
                                            })
                                            .catch(error => {
                                                res.redirect("/");
                                            });
                                    })
                                    .catch(error => {
                                        res.redirect("/");
                                    });
                            })
                            .catch(error => {
                                res.redirect("/");
                            });
                    })
                    .catch(error => {
                        res.redirect("/");
                    });
                //res.render("dashboards/home");    
            } else {
                res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });


}

exports.password = (req, res, next) => {
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
            if (req.session.role == 2 || req.session.role == "2" || req.session.role == 3 || req.session.role == "3") {
                res.render("dashboards/users/user_password", {
                    messages: unansweredChats
                });
            } else if (req.session.role == 1 || req.session == "1") {
                res.render("dashboards/change_password", {
                    messages: unansweredChats
                });
            } else {
                res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.userReferral = (req, res, next) => {
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
            Referrals.findAll({
                    where: {
                        referral_id: req.session.userId
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["user"],
                })
                .then(referrals => {
                    Users.findOne({
                            where: {
                                id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(user => {
                            res.render("dashboards/users/user_referral", {
                                referrals: referrals,
                                messages: unansweredChats,
                                user: user
                            });
                        })
                        .catch(error => {
                            req.flash('error', "Server error!");
                            res.redirect("/");
                        });
                })
                .catch(error => {
                    res.redirect("/");
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.allReferral = (req, res, next) => {
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
            Referrals.findAll({
                    where: {
                        deletedAt: null
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["referrals", "user"],
                })
                .then(referrals => {
                    res.render("dashboards/all_referrals", {
                        referrals: referrals,
                        messages: unansweredChats
                    });
                })
                .catch(error => {
                    //res.redirect("/");
                    console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}