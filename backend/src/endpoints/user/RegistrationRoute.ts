import express, { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UserModel from './UserModel';
import { EmailService } from '../../utils/EmailService';
import { registrationRules, validate } from "../../utils/validators";

const router = express.Router();

// POST /api/register - 新用户注册
// 需要提供 userID, firstName, lastName, password, email
router.post('/api/register', registrationRules, validate, async (req: Request, res: Response) => {
    const { userID, firstName, lastName, password, email } = req.body;

    try {
        // 检查 userID 或 email 是否已存在
        const existing = await UserModel.findOne({ $or: [{ userID }, { email }] });
        if (existing) {
            return res.status(409).json({ Error: 'userID oder E-Mail bereits vergeben' });
        }

        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 生成唯一激活 token
        const activationToken = crypto.randomUUID();

        // 创建用户（isActive: false，等待激活）
        const newUser = new UserModel({
            userID,
            firstName,
            lastName,
            password: hashedPassword,
            email,
            isActive: false,
            activationToken
        });
        await newUser.save();

        // 发送激活邮件
        await EmailService.sendActivationEmail(email, `${firstName} ${lastName}`, activationToken);

        res.status(201).json({ message: 'Registrierung erfolgreich. Bitte aktivieren Sie Ihren Account per E-Mail.' });
    } catch (e: any) {
        if (e.code === 11000) return res.status(409).json({ Error: 'userID oder E-Mail bereits vergeben' });
        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

// GET /api/activate/:token - 点击激活链接时调用
router.get('/api/activate/:token', async (req: Request, res: Response) => {
    try {
        // 根据 token 找到对应用户
        const user = await UserModel.findOne({ activationToken: req.params.token });
        if (!user) {
            return res.status(404).json({ Error: 'Ungültiger oder abgelaufener Aktivierungslink' });
        }

        // 激活账号，删除 token
        user.isActive = true;
        user.activationToken = undefined;
        await user.save();

        res.json({ message: 'Account erfolgreich aktiviert. Sie können sich jetzt einloggen.' });
    } catch (e) {
        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

export default router;
