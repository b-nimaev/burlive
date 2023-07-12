import mongoose, { Schema, model, ObjectId, Date, Document } from "mongoose";

interface IChat {
    user_id: ObjectId,
    name?: string,
    context?: string
}

const ChatModel = model<IChat>('Chat', new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: false },
    name: { type: String, required: false, unique: false },
    context: { type: String, required: false }
}));

export { ChatModel, IChat }
