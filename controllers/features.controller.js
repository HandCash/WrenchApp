const { User } = require("../models/user.model");
const { PrivateKey, PublicKey } = require('bsv');
const ECIES = require('bsv/ecies');
const {HandCashConnect} = require('@handcash/handcash-connect');
require('dotenv').config()
const handCashConnect = new HandCashConnect(process.env.appId);

// sends a transaction on behalf of the user
module.exports.sendTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);

  // define parameters 
  const handle = "eyeone"
  const amount = 0.0025
  const appAction = "like"
  const note = 'Hold my beer!🍺'
  const currencyCode = 'USD'

  // construct the payment
  const paymentParameters = {
    description: note,
    appAction: appAction,
    payments:
      [
        {
          destination: handle,
          currencyCode: currencyCode,
          sendAmount: amount,
        },
      ],
  };

  // make the payment
  const payment = await account.wallet.pay(paymentParameters).catch(err => {console.log(err)})
  console.log(payment)

  // display public profile with the recent transaction
  res.render('transaction', {
    tx: payment,
    path: '/transaction'
  })
}

// sends a transaction on behalf of the user
module.exports.sendMultisendTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);

  // configure the payment
  const amount = 0.005;
  const paymentParameters = {
    description: 'Test Multi',
    appAction: "test-multi-send",
    payments:
      [
        {
          destination: "rjseibane",
          currencyCode: "USD",
          sendAmount: amount
        },
        {
          destination: "cryptokang@moneybutton.com",
          currencyCode: "CAD",
          sendAmount: amount
        },
        {
          destination: "1Ew7thSBdK1UQMPdkSPh3A8VR5tmSEPPma",
          currencyCode: "USD",
          sendAmount: amount
        },
      ],
  };

  // make the payment
  const payment = await account.wallet.pay(paymentParameters)
  console.log(payment)

  // display public profile with the recent transaction
  res.render('transaction', {
    tx: payment,
    path: '/transaction'
  })
}

// sends a transaction on behalf of the user
module.exports.sendDataTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);

  // define parameters 
  const handle = "rjseibane"
  const amount = 0.005
  const note = 'Comment'
  const currencyCode = 'USD'
  const appAction = "test-data"

  // construct the payment
  const paymentParameters = {
    description: note,
    appAction: appAction,
    payments:
      [
        {
          destination: handle,
          currencyCode: currencyCode,
          sendAmount: amount,
        },
      ],

    //attachment: { format: 'base64', value: 'ABEiM0RVZneImQCqu8zd7v8=' },
    //attachment: { format: 'hex', value: '0011223344556677889900AABBCCDDEEFF' },

    attachment: {
      format: 'json', 
      value:
      {
        "comment": "wow really cool!",
        "referencedPostId": "5da9c43030d9a700172c29e1"
      }
    },
  };

  // make the payment
  const payment = await account.wallet.pay(paymentParameters)
  console.log(payment)

  // display public profile with the recent transaction
  res.render('transaction', {
    tx: payment,
    path: '/transaction'
  })
}

// sends a transaction on behalf of the user
module.exports.getTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);
  const paymentResult = await account.wallet.getPayment(req.body.transactionId)

  // display public profile with the recent transaction
  res.render('transaction', {
    tx: paymentResult,
    path: '/transaction'
  })
}

// sends a transaction on behalf of the user
module.exports.postEncrypt = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);

  const { publicKey, privateKey } = await account.profile.getEncryptionKeypair();
  console.log(publicKey);

  const ecPrivateKey = PrivateKey.fromWIF(privateKey);
  const ecPublicKey = PublicKey.fromString(publicKey);
  const plainText = req.body.encryptText;

  const encryptedBuffer = ECIES().publicKey(ecPublicKey).encrypt(plainText);
  console.log(encryptedBuffer.toString('base64'));

  const decryptedBuffer = ECIES().privateKey(ecPrivateKey).decrypt(encryptedBuffer);
  console.log(decryptedBuffer.toString('utf8'));

  console.assert(decryptedBuffer.toString('utf8') == plainText);

  // display public profile with the recent transaction
  res.render('encryption', {
    encryptionDetails: {
      ecPrivateKey: ecPrivateKey,
      ecPublicKey: ecPublicKey,
      plainText: plainText,
      encryptedBuffer: encryptedBuffer.toString('hex'),
      decryptedBuffer: decryptedBuffer
    },
    path: '/encryption'
  })
}