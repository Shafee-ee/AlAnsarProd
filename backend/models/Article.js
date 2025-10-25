import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    date: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: false },
    content: { type: String, required: true, maxlength: 20000 },
    question: { type: String, maxlength: 1000, required: false },
    language: {
        type: String,
        required: true,
        enum: ['English', 'Kannada'],
        default: 'English'
    }
});

export default mongoose.model("Article", articleSchema);