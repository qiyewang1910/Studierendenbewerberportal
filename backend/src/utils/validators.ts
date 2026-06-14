import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

// 拦截器，检查验证结果，不合法就返回400
export const validate = (req: Request, res: Response, next: NextFunction ) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// 密码验证规则（复用）
const passwordRule = body("password")
    .isLength({ min: 6 })
    .withMessage("Passwort muss mindestens 6 Zeichen haben.");

// User 验证规则（admin 创建用户，email 可选）
export const userRules = [
    body("userID")
        .notEmpty().withMessage("userID ist erforderlich.")
        .isLength({ max: 30 }).withMessage("userID ist zu lang."),
    body("firstName")
        .trim()
        .notEmpty().withMessage("Bitte gib deinen Vornamen ein.")
        .isLength({ max: 80 }).withMessage("Der Vorname ist zu lang."),
    body("lastName")
        .trim()
        .notEmpty().withMessage("Bitte gib deinen Nachnamen ein.")
        .isLength({ max: 80 }).withMessage("Der Nachname ist zu lang."),
    body("email")
        .optional()
        .isEmail().withMessage("Das ist keine gültige E-Mail.")
        .normalizeEmail(),
    passwordRule
];

// Registrierung 验证规则（email 必填）
export const registrationRules = [
    body("userID")
        .notEmpty().withMessage("userID ist erforderlich.")
        .isLength({ max: 30 }).withMessage("userID ist zu lang."),
    body("firstName")
        .trim()
        .notEmpty().withMessage("Bitte gib deinen Vornamen ein.")
        .isLength({ max: 80 }).withMessage("Der Vorname ist zu lang."),
    body("lastName")
        .trim()
        .notEmpty().withMessage("Bitte gib deinen Nachnamen ein.")
        .isLength({ max: 80 }).withMessage("Der Nachname ist zu lang."),
    body("email")
        .notEmpty().withMessage("Bitte gib deine E-Mail-Adresse ein.")
        .isEmail().withMessage("Das ist keine gültige E-Mail. Bitte versuche es erneut.")
        .normalizeEmail(),
    passwordRule
];

// DegreeCourse 验证规则
export const degreeCourseRules = [
    body("universityName")
        .notEmpty()
        .withMessage("universityName ist erforderlich."),
    body("universityShortName")
        .notEmpty()
        .withMessage("universityShortName ist erforderlich."),
    body("departmentName")
        .notEmpty()
        .withMessage("departmentName ist erforderlich."),
    body("departmentShortName")
        .notEmpty()
        .withMessage("departmentShortName ist erforderlich."),
    body("name")
        .notEmpty()
        .withMessage("name ist erforderlich."),
    body("shortName")
        .notEmpty()
        .withMessage("shortName ist erforderlich.")
];

// DegreeCourseApplication 验证规则
export const applicationRules = [
    body("degreeCourseID")
        .notEmpty()
        .withMessage("degreeCourseID ist erforderlich."),
    body("targetPeriodYear")
        .isInt({ min: 2000, max: 2100 })
        .withMessage("Ungültiges Jahr. Bitte zwischen 2000 und 2100."),
    body("targetPeriodShortName")
        .isIn(["WiSe", "SoSe"])
        .withMessage("Nur WiSe oder SoSe erlaubt.")
];






