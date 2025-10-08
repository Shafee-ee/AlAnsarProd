import bcrypt from "bcrypt.js";
import User from "../models/User.js";

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User Not Found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" })
    }
}