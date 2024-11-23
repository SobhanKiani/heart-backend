import mongoose, { Document, Schema, Model } from "mongoose";
import { USERNAME_REGEX } from "../utlls/regex";
import bcrypt from "bcryptjs";

export interface UserCreateAttrs {
  username: string;
  password: string;
}

export interface IUser extends Document {
  username: string;
  password: string;
  isPasswordValid(password: string): Promise<boolean>;
  lastSeen: Date;
}

export interface UserModel extends Model<IUser> {
  build: (attrs: UserCreateAttrs) => IUser;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => USERNAME_REGEX.test(value),
      },
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastSeen: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;
      },
      virtuals: true,
    },
  }
);

userSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "users",
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});

userSchema.methods.isPasswordValid = async function (password: string) {
  const user = this;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid;
};

userSchema.statics.build = (attrs: UserCreateAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export { User };
