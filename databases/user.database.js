var mongoose = require('mongoose');
const { liveServer }= require('../.credentials.js');
mongoose.connect(liveServer);
module.exports = exports = mongoose;