import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class ScoreStatistic {

    @Prop({ type: Types.ObjectId, required: true, default: '', ref: 'User' })
    user: Types.ObjectId;

    @Prop({ type: Number, require: true, default: 0 })
    score: number;

    @Prop({ type: Date })
    createdAt: Date;
}

export const ScoreStatisticShema = SchemaFactory.createForClass(ScoreStatistic);
export type ScoreStatisticDocument = Document & ScoreStatistic;