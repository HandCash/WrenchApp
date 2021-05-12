const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//simple schema
const UserSchema = new mongoose.Schema({
  handcashId: {
    type: String,
  },
  connectAuthToken: {
    type: String,
  },
  xauth: {
    type: String,
  },
});

//custom method to generate authToken 
UserSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ 
    _id: this._id, 
  }, 
    config.get('myprivatekey')
  ); 
  return token;
}

const User = mongoose.model('User', UserSchema);

exports.User = User; 