const { User } = require("../models/user.model");
const {HandCashConnect} = require('@handcash/handcash-connect');
require('dotenv').config()
const handCashConnect = new HandCashConnect(process.env.appId);

// login page
module.exports.getLoginLink = async (req, res, next) => {

  // fetch authentication url using the SDK
  const redirectUrl = await handCashConnect.getRedirectionUrl();
  
  // return page with a login button
  res.render('index', {
    redirectUrl: redirectUrl,
    docTitle: 'Login',
    path: '/'
  })
};

// authenticate
module.exports.getAuthenticate = async (req, res, next) => {

  // create a user upon a new login
  const authToken = req.query.authToken;

  // get user profile, and save alias to the user 
  const account = await handCashConnect.getAccountFromAuthToken(authToken);
  const { publicProfile } = await account.profile.getCurrentProfile()
  const connectId = publicProfile.id

  // check if the user exists, if not create a new one
  let user = await User.findOne({connectId: connectId})
  if(!user){
    user = new User();
    user.connectId = connectId
  }

  // update authToken
  user.connectAuthToken = authToken
  
  // save user
  await user.save();

  // generating a jwt
  req.session.accessToken = user.generateAuthToken();
  res.redirect('/auth/profile'); 
};

// returns user's information
module.exports.getCurrentUser = async (req, res) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);
  const { publicProfile, privateProfile } = await account.profile.getCurrentProfile();
  const spendableBalance = await account.wallet.getSpendableBalance()
  const permissions = await account.profile.getPermissions()
  // print it out

  // display public profile
  res.render('profile', {
    publicProfile: publicProfile,
    privateProfile: privateProfile,
    spendableBalance: spendableBalance,
    permissions: permissions,
    path: '/profile'
  }) 
}

// returns user's information
module.exports.getFriends = async (req, res) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);
  const friends = await account.profile.getFriends()

  // print it out
  console.log(friends)

  // display public profile
  res.render('friends', {
    friends: friends,
    path: '/friends'
  }) 
}
