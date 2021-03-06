// package imports
const Sequelize = require("sequelize");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Chats = require("../models").Chat;

// imports initialization
const Op = Sequelize.Op;

exports.chatPage = (req, res, next) => {
    //const id = req.params.id;
    const receiverId = req.params.id;
    const userId = req.session.userId;
    // reset all users unread messages to 0
    Chats.update({
            read_status: 1
        }, {
            where: {
                [Op.or]: [{
                        [Op.and]: [{
                            receiver_id: {
                                [Op.eq]: req.session.userId
                            }
                        }, {
                            sender_id: {
                                [Op.eq]: receiverId
                            }
                        }]
                    },
                    {
                        [Op.and]: [{
                            receiver_id: {
                                [Op.eq]: receiverId
                            }
                        }, {
                            sender_id: {
                                [Op.eq]: req.session.userId
                            }
                        }],
                    }
                ],
            }
        })
        .then(updatedChats => {
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
                                    [Op.eq]: receiverId
                                }
                            }
                        })
                        .then(user => {
                            if (user) {

                                // fetch all users chats
                                Chats.findAll({
                                        where: {
                                            [Op.or]: [{
                                                    sender_id: {
                                                        [Op.eq]: receiverId
                                                    }
                                                },
                                                {
                                                    receiver_id: {
                                                        [Op.eq]: receiverId
                                                    }
                                                }
                                            ],
                                        },
                                        order: [
                                            ['createdAt', 'ASC'],
                                        ],
                                    })
                                    .then(chats => {
                                        res.render("dashboards/chat", {
                                            user: user,
                                            userId: userId,
                                            chats: chats,
                                            messages: unansweredChats
                                        });
                                    })
                                    .catch(error => {
                                        res.redirect("/");
                                    });
                            } else {
                                res.redirect("/");
                            }
                        })
                        .catch(error => {
                            res.redirect("/");
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
}

exports.userChatPage = (req, res, next) => {
    //const id = req.params.id;
    // reset all users read messages to 1
    Chats.update({
            read_status: 1
        }, {
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    }
                    // {
                    //    sender_id: {
                    //        [Op.eq]: req.session.userId
                    //    } 
                    // }
                ],
            }
        })
        .then(updated => {
            let receiverId;
            const userId = req.session.userId;
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
                    // find user with admin right, i.e right of one
                    Users.findOne({
                            where: {
                                role: {
                                    [Op.eq]: 1
                                }
                            }
                        })
                        .then(admin => {
                            receiverId = admin.id;
                            Users.findOne({
                                    where: {
                                        id: {
                                            [Op.eq]: userId
                                        }
                                    }
                                })
                                .then(user => {
                                    if (user) {
                                        // fetch all users chats
                                        Chats.findAll({
                                                where: {
                                                    [Op.or]: [{
                                                            sender_id: {
                                                                [Op.eq]: userId
                                                            }
                                                        },
                                                        {
                                                            receiver_id: {
                                                                [Op.eq]: userId
                                                            }
                                                        }
                                                    ],
                                                },
                                                order: [
                                                    ['createdAt', 'ASC'],
                                                ],
                                            })
                                            .then(chats => {
                                                res.render("dashboards/users/user_chat", {
                                                    user: admin,
                                                    userId: userId,
                                                    chats: chats,
                                                    messages: unansweredChats
                                                });
                                            })
                                            .catch(error => {
                                                res.redirect("/");
                                            });
                                    } else {
                                        res.redirect("/");
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
                    req.flash('error', "Server error!");
                    res.redirect("/");
                });
        })
        .catch(error => {
            res.redirect("/");
        });
}