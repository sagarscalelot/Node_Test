let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utils/connections');
const responseManager = require('../../../utils/response.manager');
const usersModel = require('../../../models/users.model');
const businessModel = require('../../../models/business.model');
const helper = require('../../../utils/helper');
const constants = require('../../../utils/constants');
const timecalculation = require('../../../utils/timecalculations');


router.post('/sendotp', async (req, res) => {
  const { contactNo, countryCode } = req.body;
  if(contactNo && contactNo != '' && contactNo != null && contactNo.length > 9 && countryCode && countryCode != '' && countryCode != null){
    let mobileno = countryCode+contactNo;
    let otp = '1234';
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ contact_no: mobileno }).lean();
    if(userdata != null){
      let obj = {
          last_sent_otp : otp.toString(),
          otp_timestamp : Date.now()
      };
      await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, obj);
    }else {
            let obj = {
               contact_no : mobileno,
               last_sent_otp : otp.toString(),
               otp_timestamp : Date.now()
           };
           await primary.model(constants.MODELS.users, usersModel).create(obj);
          }
          let accessToken = await helper.generateAccessToken({ contact_no : mobileno });
          return responseManager.onSuccess('Otp sent successfully!', {token : accessToken}, res);
    }
    else {
    return responseManager.badrequest({message : 'Invalid contact number please try again'}, res);
    }
 });

 router.post('/verifyotp', helper.authenticateToken, async (req, res) => {
  if(req.token.contact_no && req.body.otp && req.body.otp != '' && req.body.otp != null && req.body.otp.length == 4){
      let primary = mongoConnection.useDb(constants.DEFAULT_DB);
      let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ contact_no: req.token.contact_no }).lean();
      if(userdata) {
          if(timecalculation.timedifferenceinminutes(Date.now(), userdata.otp_timestamp) <= 2){
              if(req.body.otp.toString() == userdata.last_sent_otp){
                  let accessToken = await helper.generateAccessToken({ userid : userdata._id.toString() });
                  delete userdata.last_sent_otp;
                  delete userdata.otp_timestamp;
                  await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, { channelID : userdata._id.toString().toUpperCase() }).lean();
                  return responseManager.onSuccess('Otp verified successfully!', {token : accessToken}, res);
              }else{
                  return responseManager.badrequest({message : 'Invalid token to verify user OTP, please try again'}, res);
              }
          }else{
              return responseManager.badrequest({message : 'Verification token expires, please try again'}, res);
          }
      }else{
          return responseManager.badrequest({message : 'Invalid token to verify user OTP, please try again'}, res);
      }
  }else{
      return responseManager.badrequest({message : 'Invalid otp, please try again'}, res);
  }
});
 module.exports = router;