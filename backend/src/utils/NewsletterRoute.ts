import express, { Request, Response } from 'express';
import { checkToken, checkAdmin } from './authMiddleware';
import UserModel from '../endpoints/user/UserModel';
import { EmailService } from './EmailService';

const router = express.Router();

router.post('/api/newsletter', checkToken, checkAdmin, async (req: Request, res: Response) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ Error: 'subject und message sind erforderlich.' });
    }

    try {
        // 查询所有 isActive=true 且有 email 的用户
        const users = await UserModel.find({ isActive: true, email: { $exists: true, $ne: '' } });

        if (users.length === 0) {
            return res.status(200).json({ message: 'Keine Empfänger gefunden.', results: [] });
        }

        // 逐个发送，收集结果
        const results = await Promise.all(
            users.map(user =>
                EmailService.sendNewsletterEmail(
                    user.email!,
                    `${user.firstName} ${user.lastName}`,
                    subject,
                    message
                )
            )
        );

        const sent = results.filter(r => r.status === 'sent').length;
        const failed = results.filter(r => r.status === 'failed').length;

        res.json({
            message: `Newsletter gesendet: ${sent} erfolgreich, ${failed} fehlgeschlagen.`,
            results
        });
    } catch (e) {
        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

export default router;
