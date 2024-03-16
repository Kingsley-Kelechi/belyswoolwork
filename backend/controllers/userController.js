const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");

const signup = async (req, res) => {
  const secret = process.env.SECRET;
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: await bcrypt.hash(req.body.password, 10), // Asynchronous hashing
      phone: req.body.phone,
      isAdmin: req.body.isAdmin || false, // Default to false if not provided
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      {
        userId: savedUser.id,
        isAdmin: savedUser.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      user: { name: savedUser.name.split(" ")[0], email: savedUser.email },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.SECRET;

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        message: "User Authenticated!",
        user: { name: user.name.split(" ")[0], email: user.email },
        token: token,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Email or password is incorrect!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    console.log(userList);

    if (!userList || userList.length === 0) {
      return res.status(404).json({ message: "User list not found" });
    }

    res.status(200).json(userList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    console.log(user);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User list not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup, login, getUsers, getUser, getCount, deleteUser };
