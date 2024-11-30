import mongoose, { Schema, Types, Document } from 'mongoose';

export interface ILesson extends Document {
    _id: Types.ObjectId;
    title: string;
    content: string;
    description?: string;
    moduleId: Types.ObjectId;
    order: number;
    questions: Types.ObjectId[];
    viewsCounter: number;
    views: Types.ObjectId[];
}

const LessonSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: false },
        content: { type: String, required: true },
        moduleId: { type: mongoose.Types.ObjectId, ref: 'Module', required: true },
        order: { type: Number, required: true },
        questions: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
            default: []
        },
        viewsCounter: { type: Number, default: 0 },
        views: {
            type: [{ type: Schema.Types.ObjectId, ref: 'View' }],
            default: []
        }
    },
    { timestamps: true }
);

export default mongoose.model<ILesson>('Lesson', LessonSchema);
