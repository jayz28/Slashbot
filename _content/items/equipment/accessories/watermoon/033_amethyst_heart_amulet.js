"use strict";

const Accessory = require('@app/content/items/equipment/accessories');

const HP_HEALED = 10;
const MP_COST = 4;

class AmethystHeartAmuletAccessory extends Accessory {
  constructor() {
    super({
      type: 'equipment-accessories-watermoon-033_amethyst_heart_amulet',
      displayName: __('Amethyst Heart Amulet'),
      description: __('A heart-shaped amulet made from an amethyst stone.'),
      level: 33,
      gold: 1500,
    });
  }

  /**
   * Get a description of how this item will change the provided character's stats.
   *
   * @param {Character} character - The character to evaluate against.
   *
   * @return {string}
   */
  getShopDescription(character) {
    return __("Regenerate %d HP per round at the cost of %d MP.", HP_HEALED, MP_COST);
  }

  /**
   * Do any actions that might happen after each round of combat (regen, etc.)
   *
   * @param {Character} character - The character in combat.
   *
   * @return {array} The messages generated by these actions.
   */
  doPostRoundActions(character) {
    // Can't do anything for max HP characters, dead characters, or those without MP.
    if (character.hp === character.maxHp || character.hp <= 0 || character.mp < MP_COST) {
      return [];
    }

    const hp = character.increaseHp(HP_HEALED);
    character.mp -= MP_COST;

    return [__(":purple_heart: Your %s regenerates %d HP at the cost of %d MP.", this.getDisplayName(character), hp, MP_COST)];
  }
}

module.exports = AmethystHeartAmuletAccessory;