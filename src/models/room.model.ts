import mongoose, { Document, Schema, Model } from "mongoose";

export interface CreateRoomAttrs {
  name: string;
  users: [string];
}

export interface IRoom extends Document {
  name: string;
  users: [Schema.Types.ObjectId];
  containsUser: (userId: Schema.Types.ObjectId) => any
}

export interface RoomModel extends Model<IRoom> {
  build: (attrs: CreateRoomAttrs) => IRoom;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
    },
    users: [{ ref: "User", type: Schema.Types.ObjectId, maxlength: 2 }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// roomSchema.virtual("eomjis", {
//   ref: "Emoji",
//   localField: "_id",
//   foreignField: "room",
// });
roomSchema.virtual("emojisCount", {
  ref: "Emoji",
  localField: "_id",
  foreignField: "room",
  count: true,
});

roomSchema.methods.containsUser = function (userId: Schema.Types.ObjectId) {
  const room: IRoom = this;

  return room.users.includes(userId);
};

roomSchema.statics.build = (attrs: CreateRoomAttrs) => {
  return new Room(attrs);
};

const Room = mongoose.model<IRoom, RoomModel>("Room", roomSchema);

export { Room };
