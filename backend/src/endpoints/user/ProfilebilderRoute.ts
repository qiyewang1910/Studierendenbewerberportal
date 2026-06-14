import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { checkToken } from '../../utils/authMiddleware';
import UserModel from './UserModel';

type AuthenticatedRequest = Request & {
    user: { userID: string; isAdministrator: boolean };
};

// 图片存在项目根目录的 uploads/ 文件夹，不存在则自动创建
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// diskStorage：把文件存到硬盘，destination 定义存储目录，filename 定义文件命名规则
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    // 文件名格式：userID_时间戳.扩展名，例如 manfred_1234567890.jpg
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.params.userID}_${Date.now()}${ext}`);
    }
});

// 只允许图片格式，限制文件大小5MB
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('only photo (jpeg, png, gif)'));
        }
    }
});

const router = express.Router();

// GET：获取用户头像, 无需登录，像 Web 服务器一样直接返回图片
router.get('/api/users/:userID/profilebilder', async (req: Request, res: Response) => {
    try {
        // 从数据库查找该用户存的图片路径
        const user = await UserModel.findOne({ userID: req.params.userID });
        if (!user || !user.profileBilderPath) {
            return res.status(404).json({ Error: 'Kein Profilbild gefunden' });
        }
        // 用 sendFile 直接把图片文件返回给客户端
        res.sendFile(user.profileBilderPath);
    } catch (e) {
        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

// POST：上传头像, 需要登录，只有本人或 admin 才能上传
router.post('/api/users/:userID/profilebilder', checkToken, upload.single('profilebilder'), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    // 权限检查：非管理员只能给自己上传
    if (!authReq.user.isAdministrator && authReq.user.userID !== req.params.userID) {
        if (req.file) fs.unlinkSync(req.file.path); // 删除已保存的文件
        return res.status(403).json({ Error: 'Forbidden' });
    }

    // 检查是否有文件上传
    if (!req.file) {
        return res.status(400).json({ Error: 'Keine Bilddatei hochgeladen' });
    }

    try {
        const user = await UserModel.findOne({ userID: req.params.userID });
        if (!user) {
            fs.unlinkSync(req.file.path); // 用户不存在则删除已保存的文件
            return res.status(404).json({ Error: 'User not found' });
        }

        // 如果用户已有旧头像，先删除旧文件再保存新的
        if (user.profileBilderPath && fs.existsSync(user.profileBilderPath)) {
            fs.unlinkSync(user.profileBilderPath);
        }

        // 把新图片路径存入数据库
        user.profileBilderPath = req.file.path;
        await user.save();

        res.status(201).json({ message: 'Profilbild erfolgreich hochgeladen', userID: req.params.userID });
    } catch (e) {
        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

export default router;
