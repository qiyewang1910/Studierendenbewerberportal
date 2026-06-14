import nodemailer from 'nodemailer';

export class EmailService {

    // Nodemailer Transporter（发件配置），只初始化一次
    private static transporter: nodemailer.Transporter | null = null;

    // 用 Ethereal 创建账号, 这是一个懒加载单例模式, 第一次调用时才初始化，之后复用同一个实例。
    private static async getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.bht-berlin.de',
                port: 587,
                secure: false,
                auth: {
                    user: 'qiwa1910@bht-berlin.de',
                    pass: process.env.EMAIL_PASS
                }
            });
        }
        return this.transporter;
    }

    // 注册新用户后发激活链接邮件，activationToken 是注册时生成的唯一随机字符串，拼进链接里，用户点击才能激活账号。
    public static async sendActivationEmail(toEmail: string, userName: string, activationToken: string) {
        try {
            const transporter = await this.getTransporter();
            const activationLink = `https://localhost/api/activate/${activationToken}`;
            const info = await transporter.sendMail({
                from: '"Bewerbungsportal" <qiwa1910@bht-berlin.de>',
                to: toEmail,
                subject: 'Bitte aktivieren Sie Ihren Account',
                text: `Sehr geehrte/r ${userName},\n\nBitte klicken Sie auf den folgenden Link, um Ihren Account zu aktivieren:\n\n${activationLink}\n\nMit freundlichen Grüßen\nBewerbungsportal`
            });
            console.log('Aktivierungs-E-Mail Vorschau:', nodemailer.getTestMessageUrl(info));
        } catch (e) {
            console.error('E-Mail konnte nicht gesendet werden:', e);
        }
    }

    // 发送 Newsletter 给单个用户
    public static async sendNewsletterEmail(toEmail: string, userName: string, subject: string, message: string) {
        try {
            const transporter = await this.getTransporter();
            await transporter.sendMail({
                from: '"Bewerbungsportal" <qiwa1910@bht-berlin.de>',
                to: toEmail,
                subject: subject,
                text: `Sehr geehrte/r ${userName},\n\n${message}\n\nMit freundlichen Grüßen\nBewerbungsportal`
            });
            return { email: toEmail, status: 'sent' };
        } catch (e: any) {
            console.error(`Newsletter an ${toEmail} fehlgeschlagen:`, e.message);
            return { email: toEmail, status: 'failed', error: e.message };
        }
    }

    // 当申请状态变更时，发通知邮件给申请人
    public static async sendStatusChangeEmail(toEmail: string, applicantName: string, newStatus: string) {
        try {
            const transporter = await this.getTransporter();
            const info = await transporter.sendMail({
                from: '"Bewerbungsportal" <qiwa1910@bht-berlin.de>',
                to: toEmail,
                subject: 'Ihr Bewerbungsstatus wurde geändert',
                text: `Sehr geehrte/r ${applicantName},\n\nIhr Bewerbungsstatus wurde auf "${newStatus}" geändert.\n\nMit freundlichen Grüßen\nBewerbungsportal`
            });
            // 终端打印预览链接，点击可在浏览器里查看邮件内容
            console.log('E-Mail Vorschau:', nodemailer.getTestMessageUrl(info));
        } catch (e) {
            console.error('E-Mail konnte nicht gesendet werden:', e);
        }
    }
}
