var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var publicRouter = require("./routes/public");
var indexRouter = require("./routes/index");
var usersAuthRouter = require("./routes/usersAuth");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var adminAuthRouter = require("./routes/adminAuth");

const maintenanceMiddleware = require("./middlewares/maintenance");
const { authMiddleware } = require("./middlewares/auth");
const { isSuperAdmin } = require("./middlewares/isSuperAdmin");
const { isCustomer } = require("./middlewares/isCustomer");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/public", maintenanceMiddleware, publicRouter);
app.use("/api/user/auth", usersAuthRouter);
app.use("/api/user", authMiddleware,isCustomer, maintenanceMiddleware, userRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use(
  "/api/admin",
  authMiddleware,
  isSuperAdmin,
  maintenanceMiddleware,
  adminRouter
);

module.exports = app;
