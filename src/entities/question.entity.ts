import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { QuestionTypeCode } from "@utils/enums";
import { Document } from "mongoose";

@Schema()
export class Question {
    
    @Prop({type: String})
    _id: string;

    @Prop({type: [String], required: true, default: []})
    choices: string[];

    @Prop({type: String, required: true})
    focus: string;

    @Prop({type: Number, required: true, default: -1})
    hiddenIndex: number;

    @Prop({type: Number, required: true})
    rank: number;

    @Prop({type: String, enum: QuestionTypeCode, required: true})
    code: QuestionTypeCode;

    @Prop({type: String, required: false})
    wordId?: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
export type QuestionDocument = Document & Question;