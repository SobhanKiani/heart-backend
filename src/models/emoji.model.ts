import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface EmojiCreateAttrs {
  type: string;
  sender: string;
  reciever: string;
  room: string;
}

export interface IEmoji extends Document {
  type: string;
  sender: Schema.Types.ObjectId;
  reciever: Schema.Types.ObjectId;
  room: Schema.Types.ObjectId;
}

export interface EmojiModel extends Model<IEmoji> {
  build: (attrs: EmojiCreateAttrs) => IEmoji;
}

const emojiSchema = new Schema<IEmoji>(
  {
    type: {
      type: String,
    },
    sender: {
      ref: "User",
      type: Schema.Types.ObjectId,
      required: true,
    },
    reciever: {
      ref: "User",
      type: Schema.Types.ObjectId,
      required: true,
    },
    room: {
      ref: "Room",
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

emojiSchema.statics.build = (attrs: EmojiCreateAttrs) => {
  return new Emoji(attrs);
};

const Emoji = mongoose.model<IEmoji, EmojiModel>("Emoji", emojiSchema);

export { Emoji };
