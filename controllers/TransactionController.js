// package imports
const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
const helpers = require("../helpers/cryptedge_helpers");
const Deposits = require("../models").Deposit;
const Withdrawals = require("../models").Withdrawal;
const Chats = require("../models").Chat;

// imports initialization
const Op = Sequelize.Op;

exports.userDeposits = (req, res, next) => {
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
            }]
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Deposits.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(deposits => {
            res.render("dashboards/users/user_deposit", {
                deposits: deposits,
                messages: unansweredChats
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

exports.aUserWithdrawals = (req, res, next) => {
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
            }]
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Withdrawals.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/users/user_withdrawals", {
                withdrawals: withdrawals,
                messages: unansweredChats
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


exports.withdrawWallet = (req, res, next) => {
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
            }]
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
                res.render("dashboards/users/user_withdrawing", {
                    user: user,
                    messages: unansweredChats
                });
            } else {
                res.redirect("back");
            }
        })
        .catch(error => {
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.withdrawFromWallet = (req, res, next) => {
    let {
        bank,
        acc_name,
        acc_number,
        amount
    } = req.body;

    if (!bank || !acc_name || !acc_number || !amount) {
        req.flash('warning', "Enter all fields");
        res.redirect("back");
    } else if (!helpers.isNumeric(acc_number)) {
        req.flash('warning', "Enter valid account number");
        res.redirect("back");
    } else if (!helpers.isNumeric(amount)) {
        req.flash('warning', "Enter valid amount");
        res.redirect("back");
    } else {
        // get user wallet
        Users.findOne({
                where: {
                    id: {
                        [Op.eq]: req.session.userId
                    }
                }
            })
            .then(user => {
                if (user) {
                    let userWallet = Math.abs(Number(user.wallet));
                    amount = Math.abs(Number(amount));
                    let currentWallet = userWallet - amount;
                    if (amount > userWallet) {
                        req.flash('warning', "Insufficient fund");
                        res.redirect("back");
                    } else {
                        Users.update({
                                wallet: currentWallet
                            }, {
                                where: {
                                    id: req.session.userId
                                }
                            })
                            .then(updatedUser => {
                                Withdrawals.create({
                                        user_id: req.session.userId,
                                        amount,
                                        bank,
                                        acc_name,
                                        acc_number,
                                        status: 0
                                    })
                                    .then(withdrawal => {
                                        req.flash('success', "Withdrawal success, awaiting disbursement!");
                                        res.redirect("back");
                                    })
                                    .catch(error => {
                                        req.flash('error', "Server error");
                                        res.redirect("back");
                                    });
                            })
                            .catch(error => {
                                req.flash('error', "Server error");
                                res.redirect("back");
                            });
                    }
                } else {
                    req.flash('warning', "Session expired");
                    res.redirect("back");
                }
            })
            .catch(error => {
                req.flash('error', "Server error");
                res.redirect("back");
            });
    }
}

exports.unapprovedWithdrawals = (req, res, next) => {
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
            }]
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Withdrawals.findAll({
            where: {
                status: {
                    [Op.eq]: 0
                }
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/unapproved_withdrawals", {
                withdrawals: withdrawals,
                messages: unansweredChats
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.unappWithdrawPaystack = (req, res, next) => {
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
            }]
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Withdrawals.findAll({
            where: {
                status: {
                    [Op.eq]: 0
                }
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/unapp_withdrawal_paystack", {
                withdrawals: withdrawals,
                messages: unansweredChats
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}


exports.approvedWithdrawals = (req, res, next) => {
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
            }]
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Withdrawals.findAll({
            where: {
                status: {
                    [Op.eq]: 1
                }
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/approved_withdrawals", {
                withdrawals: withdrawals,
                messages: unansweredChats
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.postApproveWithdrawal = (req, res, next) => {
    id = req.body.id;
    Withdrawals.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
        .then(withdrawal => {
            if(withdrawal) {
                Withdrawals.update({
                    status: 1
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(updatedWithdrawal => {
                    req.flash('success', "Withdrawal updated successfully");
                    res.redirect("back");
                })
                .catch(error => {
                    req.flash('error', "Server error");
                    res.redirect("back");
                });
            } else {
                req.flash('error', "Invalid withdrawal");
                    res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("back");
        });
}

exports.postDisApproveWithdrawal = (req, res, next) => {
    id = req.body.id;
    Withdrawals.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
        .then(withdrawal => {
            if(withdrawal) {
                Withdrawals.update({
                    status: 0
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(updatedWithdrawal => {
                    req.flash('success', "Withdrawal updated successfully");
                    res.redirect("back");
                })
                .catch(error => {
                    req.flash('error', "Server error");
                    res.redirect("back");
                });
            } else {
                req.flash('error', "Invalid withdrawal");
                    res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("back");
        });
}