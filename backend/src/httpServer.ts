import 'dotenv/config';
import https from "https";
import fs from "fs";
import express from "express";
import { connectDatabase } from "./database/database";
import authRoute from "./endpoints/authentication/AuthenticationRoute";
import publicUsersRoute from "./endpoints/user/PublicUsersRoute";
import userRoute from "./endpoints/user/UserRoute";
import degreeRoute from "./endpoints/degreeCourseApplication/DegreeCourseRoute";
import degreeAppRoute from "./endpoints/degreeCourseApplication/DegreeCourseAppRoute";
import profileBilderRoute from "./endpoints/user/ProfilebilderRoute";
import registrationRoute from "./endpoints/user/RegistrationRoute";
import newsletterRoute from "./utils/NewsletterRoute";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Expose-Headers", "Authorization");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});


// 先公开，再需要登录的
app.use(authRoute);           // 登录/认证相关接口（不需要登录）
app.use(registrationRoute);   // 注册接口（不需要登录）
app.use("/api/publicUsers", publicUsersRoute);    // 公开用户信息（不需要登录）
app.use(profileBilderRoute);     // 头像相关接口（需要登录）
app.use(userRoute);              // 用户管理接口（需要登录）
app.use(degreeRoute);            // 学位课程接口（需要登录）
app.use(degreeAppRoute);          // 学位申请接口（需要登录）
app.use(newsletterRoute);        // Newsletter 接口（仅管理员）
app.use((_req, res) => {         // _req 里的下划线 _ 是一种约定写法，表示"这个参数我用不到"，只是为了占位拿到 res
  res.status(404).json({ Error: "Not Found" });
});

const options = {
  key: fs.readFileSync("cert/key.pem"),
  cert: fs.readFileSync("cert/cert.pem")
};

connectDatabase()
  .then(() => {
    https.createServer(options, app).listen(443, () => console.log("Server Port 443"));
  })
  .catch((error) => {
    console.error("DB connection failed", error);
  });
