"use strict";

const Item = require("@app/content/items").Item;

const STATS = require("@constants").STATS;

/**
 * Consumable parent class.
 */
class Consumable extends Item {
  /**
   * If this consumable item can actually be used right now.
   *
   * @param {Character} character - the character to check.
   *
   * @return {boolean}
   */
  canBeUsed(character) {
    return false;
  }

  /**
   * Certain achievements boost consumable effects.
   *
   * @param {Character} character - The character to check.
   *
   * @return {number}
   */
  getEffectMultiplier(character) {
    return 1;
  }

  /**
   * Consume the item.
   *
   * @param {Character} character - The character consuming this item.
   *
   * @return {string} The message generated by consuming this item.
   */
  consume(character) {
    character.inventory.remove(this.type);
    character.increaseStat(STATS.ITEMS_CONSUMED, 1, this.type);

    return [];
  }
}

module.exports = {
  Consumable
};
