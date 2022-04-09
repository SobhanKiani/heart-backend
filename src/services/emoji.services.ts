import { BadRequestError } from "../errors/bad-request-error";
import { Emoji, EmojiCreateAttrs } from "../models/emoji.model";

export class EmojiServices {
  static async createEmoji(emojiData: EmojiCreateAttrs) {
    try {
      const emoji = await Emoji.build(emojiData);
      await emoji.save();
      return emoji;
    } catch (err) {
      throw new BadRequestError("Could Not Create Emoji");
    }
  }

}
