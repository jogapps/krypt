// package imports
const Sequelize = require("sequelize");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Investments = require("../models").Investment;
const Package = require("../models").Package;
const Chats = require("../models").Chat;
// imports initialization
const Op = Sequelize.Op;


exports.userInvestments = (req, res, next) => {
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
        Investments.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            include: ["package"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            res.render("dashboards/users/user_investment", {
                investments: investments,
                messages: unansweredChats
            });
        })
        .catch(error => {
            //res.redirect("/");
            req.flash('error', `Server Error`);
                                //res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}