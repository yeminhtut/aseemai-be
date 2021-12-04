'use strict';

const User = require('../models/user');

exports.listAllUsers = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  limit = +limit <= 100 ? +limit : 20;
  skip = +skip || 0;
  let query = {},
    regexKeyword;
  role ? (query['role'] = role.toUpperCase()) : '';
  keyword && /\w/.test(keyword)
    ? (regexKeyword = new RegExp(keyword, 'i'))
    : '';
  regexKeyword ? (query['name'] = regexKeyword) : '';
  const users = await User.find(query)
    .limit(limit)
    .skip(skip);
  res.json(users);
};

exports.createNewUser = async (req, res) => {
  let { email, password } = req.body;
  const newUser = new User(req.body);
  newUser.createdBy = req.credentials.userId;
  try {
    const result = await newUser.save();
    res.json(result);
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(500).send('User already exist!');
    }
    return res.status(500).send(err.message);
  }
};

exports.getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.userId).populate({
    path: 'createdBy updatedBy departmentId',
    select: 'name email',
  });
  if (!user) return res.status(404).json('No record found.');
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json('No record found.');
  user.set(req.body);
  const updatedUser = await user.save();
  res.json(updatedUser);
};

exports.batchUpdateUserPassword = async (req, res) => {
  try {
    const { userIds, password, passwordExpireTime } = req.body;
    const user = await User.findOne();
    let updateQuery = {};

    if (
      !Array.isArray(userIds) ||
      !userIds.length ||
      !userIds.filter(x => x).length
    )
      return res
        .status(400)
        .json("'userIds' must be an Array and pass one value at least.");
    if (userIds.length > 50)
      return res
        .status(400)
        .json('Warning, batch update only allow 50 users at max.');

    if (password) {
      let generateHashedPassword = await user.generateHashedPassword(password);
      updateQuery['password'] = generateHashedPassword;
    }

    Object.keys(req.body).includes('passwordExpireTime')
      ? (updateQuery['passwordExpireTime'] = passwordExpireTime)
      : '';
    // Renew the Dates
    updateQuery['lastPasswordUpdatedAt'] = updateQuery[
      'updatedAt'
    ] = new Date();
    const updatedUsers = await User.update(
      { _id: { $in: userIds } },
      {
        $set: updateQuery,
      },
      { multi: true },
    );
    if (updatedUsers) return res.json('Successfully updated!');
  } catch (err) {
    return res.status(500).json(err.message || 'Failed.');
  }
};

exports.deleteUser = async (req, res) => {
  const user = User.remove({ _id: req.params.userId });
  res.json(await user);
};

exports.forgot = async (req, res) => {
  const { email } = req.body;
  const hostName = req.headers.host;
  const user = await User.findOne({ email: email });
  if (!user) return res.status(404).json('No record found.');
  user.resetPasswordToken = user.generateHash('');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  let resetToken = user.resetPasswordToken;
  await user.save();
  let msgObj = {
    to: email,
    subject: 'Reset password instructions',
    html: forgotPasswordEmailTmpl({ email, resetToken }),
  };
  mailer(msgObj, function (err, mailRes) {
    if (err)
      return res
        .status(500)
        .send('Sending reset email failed. Please, try again.');

    return res.status(200).json('A reset email has been sent to ' + email);
  });
};

exports.resetRequest = async (req, res) => {
  var resetPasswordToken = req.query.resetPasswordToken;
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    return res
      .status(400)
      .json('Password reset token is invalid or has expired.');
  res.json(user);
};

exports.resetConfirm = async (req, res) => {
  let resetPasswordToken = req.query.resetPasswordToken;
  let { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    return res
      .status(400)
      .json('Password reset token is invalid or has expired.');
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.lastLoginTime = new Date();
  const saveUser = await user.save();
  if (saveUser)
    res.json(
      saveUser
        ? 'Your password has been successfully updated.'
        : 'Error occurs while updating password.',
    );
};


const forgotPasswordEmailTmpl = ({ email, resetToken }) => {
  let emailBody = `We've received a request to reset your password. If you would like to reset your password for <strong><a href='mailto:${email}' target='_blank'>${email}</a></strong> , click the link below: <br><br>If you did not make this request it is safe to disregard this email. <br>Thank you.`;
  return emailBody;
};

const updatePasswordEmailTmpl = ({ name }) => {
  let emailBody = `Dear ${name}:<br>You are receiving this email because your password is going to expire in two weeks. To avoid having access to PSA Marine Facility Management frozen, you MUST change your password in the next two week.`;
  return emailBody;
};

const newUserEmailTmpl = ({ email, password }) => {
  let emailBody = `Dear Sir/Madam,<br><br>Your account has been created on ims server.<br> Here is your credentials,<br> Email - ${email}<br> Password - ${password}`;
  return emailBody;
};
