const { User } = require("../models/user.model");
const { PrivateKey, PublicKey } = require('bsv');
const ECIES = require('bsv/ecies');
const {HandCashConnect} = require('@handcash/handcash-connect');
require('dotenv').config()
const handCashConnect = new HandCashConnect(process.env.appId);

const parseHandleArray = (handlesString) => handlesString.replace(/ /g, "").replace(/\$/g, "").split(",")

const parseHandle = (handleString) => handleString.replace(/ /g, "").replace(/\$/g, "")

function ConvertStringToHex(str) {
  var arr = [];
  for (var i = 0; i < str.length; i++) {
         arr[i] = (str.charCodeAt(i).toString(16)).slice(-4);
  }
  return arr.join("");
}

function ConvertHexToString(str1) {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}


// sends a transaction on behalf of the user
module.exports.sendTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);

  // define parameters 
  const handle = parseHandle(req.body.handle)
  const amount = parseInt(req.body.amount)
  const note = req.body.note
  const currencyCode = 'USD'

  // construct the payment
  const paymentParameters = {
    description: note,
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
  res.redirect("/auth/get-transaction?txid=" + payment.transactionId)
}

// sends a transaction on behalf of the user
module.exports.sendMultisendTransaction = async (req, res, next) => {
  console.log("here")
  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);

  // define parameters 
  const handles = parseHandleArray(req.body.handles)
  const amount = parseInt(req.body.amount)
  const note = req.body.note
  const currencyCode = 'USD'

  const payments = handles.map(handle => {return {
    destination: handle,
    currencyCode: currencyCode,
    sendAmount: amount
  }})

  console.log(payments)
  // configure the payment
  const paymentParameters = {
    description: note,
    appAction: "test-multi-send",
    payments: payments
  };

  // make the payment
  const payment = await account.wallet.pay(paymentParameters)
  console.log(payment)

  // display public profile with the recent transaction
  res.redirect("/auth/get-transaction?txid=" + payment.transactionId)
}

// sends a transaction on behalf of the user
module.exports.sendDataTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);
  const { publicProfile } = await account.profile.getCurrentProfile()
  
  // define parameters 
  const handle = publicProfile.handle
  const amount = 500
  const note = 'Posting data to the chain'
  const data = ConvertStringToHex(req.body.text)
  console.log(data)
  const currencyCode = 'SAT'

  // construct the payment
  const paymentParameters = {
    description: note,
    payments:
      [
        {
          destination: handle,
          currencyCode: currencyCode,
          sendAmount: amount,
        },
      ],

    //attachment: { format: 'base64', value: 'ABEiM0RVZneImQCqu8zd7v8=' },
    attachment: { format: 'hex', value: data },
  };

  // make the payment
  const payment = await account.wallet.pay(paymentParameters).catch(err => console.log(err))

  // display public profile with the recent transaction
  res.redirect("/auth/get-transaction?txid=" + payment.transactionId)
}

// sends a transaction on behalf of the user
module.exports.getTransaction = async (req, res, next) => {

  // fetch the authenticated user and their profile
  const user = await User.findById(req.user._id);
  const account = await handCashConnect.getAccountFromAuthToken(user.connectAuthToken);
  const paymentResult = await account.wallet.getPayment(req.query.txid)
 
  paymentResult.attachments = paymentResult.attachments.map(attachment => {
    if(attachment.format == 'hex') 
      attachment.hexValue = ConvertHexToString(attachment.value)
    return attachment
  })
  
  console.log(paymentResult)
  
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