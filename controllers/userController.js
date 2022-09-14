const APIFeatures = require("../utils/apiFeatures");
const User = require("./../models/userModel");
const hookAsync = require('./../utils/hookAsync');
const factory = require('./handlerFactory');


exports.getAllUsers = factory.getAll(User)

exports.getUser = factory.getOne(User)