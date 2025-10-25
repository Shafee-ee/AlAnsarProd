import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },// is admin or not 
        savedArticles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Article",
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
