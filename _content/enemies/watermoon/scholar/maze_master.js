"use strict";

const mix                         = require('mixwith').mix;
const { WatermoonBonusBossEnemy } = require('@app/content/enemies/watermoon/bonus_boss');
const { WatermoonReputation }     = require('@mixins/enemy/reputation/watermoon');
const { FuriousAction }           = require('@mixins/enemy/actions/furious');
const { DazeAction }              = require('@mixins/enemy/actions/daze');
const { HealAction }              = require('@mixins/enemy/actions/heal');
const { DropsMoondrop }           = require('@mixins/enemy/loot/moondrop');

const { FLAGS, PROPERTIES } = require('@constants');

const FLAG_ENERGETIC_FURIOUS_TURNS = 'energetic_furious_turns';
const FLAG_RESET_FIGHT = 'reset_fight';

const ANTIPODE_MULTIPLIER = 2;

class MazeMasterEnemy extends mix(WatermoonBonusBossEnemy).with(
  FuriousAction(0),
  DazeAction(0),
  HealAction(0),
  DropsMoondrop(100, 20),
  WatermoonReputation(150)
) {
  constructor() {
    super({
      type: 'watermoon-scholar-maze_master',
      displayName: "Maze Master",
      description: "The Maze Master comes out from behind an elaborate screen when you first encounter him.  He wears a long, dark-blue robe, a pointed hat, and holds a long staff with a die carved into the top of it.  \"It is unwise of you to challenge me,\" he says.  \"As you'll see, the rules don't apply to the Maze Master!\"",
      stats: {
        perLevel: {
          maxHp: 100,  // Reduced HP because refreshes & improves his HP halfway through
        }
      },
    });

    this.districtBosses = [
      'watermoon-scholar-gorvil',
      'watermoon-scholar-maze_master',
      'watermoon-scholar-minotaur_king',
    ];

    this.bossFlag = FLAGS.SCHOLAR_BOSS;
  }

  /**
   * Override max HP based on if Maze Master has reset.
   *
   * @param {integer} level - The level to set them to.
   * @param {integer} levelBonus - A location-based level bonus to add/subtract.
   */
  setLevel(level, levelBonus = 0) {
    super.setLevel(level, levelBonus);

    this.setNewMaxHp();
  }

  /**
   * Perform any actions that happen after the round (decrement/clear all timers, etc)
   *
   * @param {Combatant} opponent - The current combatant's opponent.
   *
   * @return {array} Messages generated by these actions.
   */
  doPostRoundActions(opponent) {
    let messages = super.doPostRoundActions(opponent);

    // Ensure energetic furious doesn't happen forever
    this.decrementFlag(FLAG_ENERGETIC_FURIOUS_TURNS);

    // First time < 50%?  Reset with more HP
    if ( ! this.hasFlag(FLAG_RESET_FIGHT) && this.hp < (this.maxHp / 2)) {
      this.setFlag(FLAG_RESET_FIGHT);
      this.setNewMaxHp();

      messages.push(`:high_brightness: ${this.getDisplayName(opponent)} growls in frustration.  "Okay, fine!  I'm done with fighting fair," he says.  Suddenly, your vision is blinded by a bright flash, and when the light fades, the ${this.getDisplayName(opponent)} stands before you, unbloodied and glowing slightly.`);
    }

    return messages;
  }

  /**
   * Set the max HP that this new form of the Maze Master should have.
   */
  setNewMaxHp() {
    const modifier = this.hasFlag(FLAG_RESET_FIGHT) ? 1.5 : 1;

    // First level only gets base stats
    let increaseBy = this.level + this.getLevelBonus() - 1;

    this.maxHp = this.stats.base.maxHp + Math.floor(increaseBy * this.stats.perLevel.maxHp * modifier);
    this._hp   = this.maxHp;
  }

  /**
   * Return the fight actions of this enemy as a weighted array for Random.
   *
   * @param {Character} character - The character this enemy is fighting.
   *
   * @return {array}
   */
  getWeightedFightActions(character) {
    if (this.hasFlag(FLAG_RESET_FIGHT)) {
      return [
        { value: 'fastFurious', weight: 10 },
        { value: 'getFurious', weight: 10 },
        { value: 'energeticFurious', weight: 10 },
        { value: 'daze', weight: 10 },
        { value: 'heal', weight: 10 },
        { value: 'antipode', weight: 50 },
      ];
    }
    else {
      return [
        { value: 'getFurious', weight: 15 },
        { value: 'energeticFurious', weight: 15 },
        { value: 'daze', weight: 10 },
        { value: 'doAttack', weight: 60 },
      ];
    }
  }

  /**
   * Perform a furious attack without winding up.
   *
   * (Yes, this is a Fast & Furious reference that nobody but me will ever see.)
   *
   * @param {Character} character - The character this enemy is fighting.
   *
   * @return {array}
   */
  fastFurious(character) {
    let messages = [
      `:rage: ${this.getDisplayName(character)} lashes out with a Furious attack outta nowhere!`,
    ];

    messages = messages.concat(this.furiousAttack(character));

    return messages;
  }

  /**
   * Get ready to do a furious attack that won't tire you.
   *
   * @param {Character} character - The character this enemy is fighting.
   *
   * @return {array}
   */
  energeticFurious(character) {
    this.setFlag(FLAGS.IS_FURIOUS);
    this.setFlag(FLAG_ENERGETIC_FURIOUS_TURNS, 2);

    return [`:face_with_symbols_on_mouth: ${this.getDisplayName(character)} prepares to launch a furious attack!  He seems very energetic...`];
  }


  /**
   * If this combatant should get tired after a Furious attack.
   *
   * @return boolean
   */
  shouldGetTired() {
    return ! this.getFlag(FLAG_ENERGETIC_FURIOUS_TURNS, false);
  }

  /**
   * Both burn and freeze.
   *
   * @param {Character} character - The character this enemy is fighting.
   *
   * @return {array}
   */
  antipode(character) {
    const attackProperties = [
      PROPERTIES.IS_ATTACK,
      PROPERTIES.BURN_ATTACK,
      PROPERTIES.CHILL_ATTACK,
    ];

    const dodgeText = ":dash: %s fires a blast of ice and fire at you but you dodge!";
    const missText = "%s fires a blast of ice and fire at you, but misses!";

    return this.attackHelper(character, (attackInfo) => {
      let messages = [];

      attackInfo.damage = Math.ceil(attackInfo.damage * ANTIPODE_MULTIPLIER);

      character.decreaseHp(attackInfo.damage);

      const critText   = attackInfo.didCrit && attackInfo.damage > 0 ? __(' _Critical hit!_') : '';
      const damageText = attackInfo.damage > 0 ? `*${attackInfo.damage}*` : __('no');
      messages.push(`:fire::snowflake: ${this.getDisplayName(character)} fires a blast of ice and fire at you, dealing ${damageText} damage and burning AND chilling you.${critText}`);

      messages = messages.concat(character.addStatusBurned());

      return messages;
    }, dodgeText, missText, attackProperties);
  }

  /**
   * Clear all Scholar flags.
   *
   * @param {Character} character - The character who won the fight.
   * @param {array} messages - Any messages that have happened so far in combat.
   *
   * @return {array}
   */
  doFightSuccess(character, messages) {
    character.clearFlag(FLAGS.BOSS_DEFEATED_ + 'watermoon-scholar-minotaur');
    character.clearFlag(FLAGS.BOSS_DEFEATED_ + 'watermoon-scholar-gorgon');
    character.clearFlag(FLAGS.BOSS_DEFEATED_ + 'watermoon-scholar-empusa');
    character.clearFlag(FLAGS.HALLWAY_CHOICES);
    character.clearFlag(FLAGS.HALLWAY_REMAINING);
    character.clearFlag(FLAGS.HALLWAYS_COMPLETED);

    return super.doFightSuccess(character, messages);
  }

  /**
   * Do any extra actions required when running.
   *
   * @param {Character} character - The character doing the running.
   * @param {array} message - The previously-generated messages.
   *
   * @return {array}
   */
  doFightRun(character, messages) {
    messages = super.doFightRun(character, messages);

    this.leaveLabyrinth(character);
    messages.push(`The ${this.getDisplayName(character)} chases you right out of the Labyrinth!`);

    return messages;
  }

  /**
   * Special actions to take when this enemy has won.
   *
   * NOTE: Any additionally enqueued messages NEED a delay in order to ensure they show up after
   * the action fight message.
   *
   * @param {Character} character - The character who lost the fight.
   *
   * @return array
   */
  doFightFailure(character, messages) {
    messages = super.doFightFailure(character, messages);

    this.leaveLabyrinth(character);
    messages.push("As you pass into unconsciousness, you can feel your body being dragged out of the Labyrinth.");

    return messages;
  }
}

module.exports = MazeMasterEnemy;