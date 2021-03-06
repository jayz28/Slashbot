"use strict";

const { sprintf } = require("sprintf-js");

const PROPERTIES = require('@constants').PROPERTIES;

/**
 * Drain 1.5x attack damage from player, healing 1/2 that amount.
 *
 * @param {integer} actionWeight - The chance to perform this attack out of 100.
 * @param {string} dodgeText - The text to display when dodging this attack.
 * @param {string} missText - The text to display when this attack misses.
 * @param {string} attackText - The text to display when performing this attack.
 *
 * @return {Mixin}
 */
const DrainLifeAction = (actionWeight, {
  damageMultiplier = 1.5,
  healMultiplier = 0.5,
  dodgeText = ":dash: %s attempts to drain your life, but you dodge!",
  missText = "%s attempts to drain your life, but misses!",
  attackText = ":fog: %s draws forth dripping dark red tendrils from you and drains your life, dealing %s damage and gaining %s health from you.%s"
} = {}) => {
  return (Enemy) => class extends Enemy {
    constructor(info) {
      super(info);

      this.fightActionProperties.drainLife = [
        PROPERTIES.IS_ATTACK,
      ];
    }

    /**
     * Get the fight actions for this enemy.
     *
     * @param {Character} character - The character this enemy is fighting.
     * @param {object} actions - Actions passed in from mixed-in actions.
     *
     * @return {object}
     */
    getFightActions(character, actions = {}) {
      actions.drainLife = actionWeight;

      return super.getFightActions(character, actions);
    }

    /**
     * Drain 1.5x attack damage from player, healing 1/2 that amount.
     *
     * @param {Character} character - The character to drain life from.
     *
     * @return {array} Messages generated by these actions.
     */
    drainLife(character) {
      return this.attackHelper(character, (attackInfo) => {
        const damage = Math.ceil(attackInfo.damage * damageMultiplier);
        const healing = Math.ceil(damage * healMultiplier);

        // If has burn flag here, will take bonus damge later
        const critText   = attackInfo.didCrit && damage > 0 ? ' _Critical hit!_' : '';
        const damageText = damage > 0 ? `*${damage}*` : 'no';
        const healingText = healing > 0 ? `*${healing}*` : 'no';

        character.decreaseHp(damage);
        this.increaseHp(healing);

        return [sprintf(attackText, this.getDisplayName(character), damageText, healingText, critText)];
      }, dodgeText, missText);
    }
  };
};

module.exports = {
  DrainLifeAction
};