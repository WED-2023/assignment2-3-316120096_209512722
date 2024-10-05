var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");
const authUtils = require("./utils/authUtils");

router.post("/Register", async (req, res, next) => {
  try {
    console.log("request : " , req.body);
    let userDetails = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
    };
    console.log("user details" , userDetails);
    result = await authUtils.validateUsername(userDetails.username);
    if (result) {
      throw { status: 40001, message: "Username already exists" };
    }

    let hash_password = bcrypt.hashSync(
      userDetails.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    await DButils.execQuery(
      `INSERT INTO users (user_name,first_name, last_name, country, password, email) VALUES ('${userDetails.username}','${userDetails.firstname}','${userDetails.lastname}','${userDetails.country}','${hash_password}','${userDetails.email}')`
    );
    res.status(200).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});


router.post("/Login", async (req, res, next) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    // Check that username exists
    console.log("username : ", username, "password : ", password);
    query = `SELECT user_name, password FROM users WHERE user_name = '${username}'`;
    const users = await DButils.execQuery(query);
    console.log(users, "users hi shalom");

    if (!users || users.length == 0) {
      throw { status: 40002, message: "Username or Password incorrect" };
    }

    // Check that the password is correct (use bcrypt.compareSync)
    user = users[0];
    const passwordMatches = bcrypt.compareSync(password, user.password); 

    if (!passwordMatches) {
      console.log("Passwords do not match");
      throw { status: 40004, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.username = user.user_name;

    // Return cookie
    res.status(200).send({ message: "Login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});
router.post("/Logout", function (req, res) {
  req.session.reset();
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;