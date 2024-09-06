const exp = require("express");
require("dotenv").config();
const userApp = exp.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenVerify = require("../middlewares/tokenVerify.js");
const expressAsyncHandler = require("express-async-handler");

//middleware
userApp.use(exp.json());

userApp.get(
  "/users",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    let usersList = await usersCollection.find().toArray();
    res.send({ message: "users", payload: usersList });
  })
);

userApp.get(
  "/users/:username",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    const usernameOfUrl = req.params.username;
    let user = await usersCollection.findOne({
      username: { $eq: usernameOfUrl },
    });
    res.send({ message: "one user", payload: user });
  })
);

userApp.post(
  "/user",
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    const newUser = req.body;
    let existingUser = await usersCollection.findOne({
      username: newUser.username,
    });
    if (existingUser !== null) {
      res.send({ message: "User already existed" });
    }
    else {
      let hashedpassword = await bcryptjs.hash(newUser.password, 7);
      newUser.password = hashedpassword;
      newUser.products = [];
      await usersCollection.insertOne(newUser);
      res.send({ message: "user created" });
    }
  })
);

//user login(authentication) public
userApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    const userCred = req.body;
    let dbUser = await usersCollection.findOne({ username: userCred.username });
    if (dbUser === null) {
      res.send({ message: "Invalid username" });
    }
    else {
      let result = await bcryptjs.compare(userCred.password, dbUser.password);
      if (result === false) {
        res.send({ message: "Invalid password" });
      }
      else {
        //JWT token
        let signedToken = jwt.sign(
          { username: userCred.username },
          process.env.SECRET_KEY,
          {
            expiresIn: "15m",
          }
        );
        res.send({
          message: "login success",
          token: signedToken,
          user: dbUser,
        });
      }
    }
  })
);

//route to update user 
userApp.put(
  "/user",
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    let modifiedUser = req.body;
    console.log(modifiedUser);
    await usersCollection.updateOne(
      { username: modifiedUser.username },
      { $set: { ...modifiedUser } }
    );
    res.send({ message: "User modified" });
  })
);

//route to delete user 
userApp.delete(
  "/user/:id",
  tokenVerify,
  expressAsyncHandler((req, res) => {})
);

//add selected product to a specific user cart
userApp.put(
  "/add-to-cart/:username",
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    let usernameFromUrl = req.params.username;
    let productObj = req.body;
    console.log(productObj);
    let result = await usersCollection.updateOne(
      { username: usernameFromUrl },
      { $push: { products: productObj } }
    );
    res.send({ message: "product added", payload: result });
  })
);

userApp.get(
  "/cart/:username",
  expressAsyncHandler(async (req, res) => {
    const usersCollection = req.app.get("usersCollection");
    let usernameFromUrl = req.params.username;
    let user = await usersCollection.findOne({ username: usernameFromUrl });
    res.send({ message: "cart", payload: user });
  })
);

//export userApp
module.exports = userApp;
