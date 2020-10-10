"use strict";

let collection = {};
let names      = {};

const Files   = require('@util/files');
const Content = require('@app/content')(collection, names);

const STD_DELAY = require('@constants').STD_DELAY;

class Encounter {
  constructor(info) {
    this.type         = _.get(info, 'type', '');
    this._description = _.get(info, 'description', '');
    this._actions     = _.get(info, 'actions', []);
    this._title       = _.get(info, 'title', 'What do you want to do?');
  }

  /**
   * Load any extra information required to display this encounter.
   *
   * @param {Character} character - The character to load extra information for.
   */
  async loadExtra(character) { }

  /**
   * Set message information to use to make updating message easier.
   *
   * @param {Character} character - The character involved in this encounter.
   * @param {object} info - The encounter information.
   * @param {object} message - The message information.
   * @param {object} triggerId - The trigger ID of this message.
   */
  setMessageInfo(character, info, message, triggerId) {
    this.character = character;
    this.info      = info;
    this.message   = message;
    this.triggerId = triggerId;
  }

  /**
   * Perform one of this encounter's actions.
   *
   * @param {string} action - The action to perform.
   * @param {Character} character - The character performing the action.
   * @param {object} message - The message that preceeded this, for updating.
   */
  async doAction(action, character, message) { }

  /**
   * Default to the location image for this encounter, but allow override per-encounter.
   *
   * @param {Character} character - The character currently in this encounter.
   *
   * @return {string}
   */
  getImage(character) {
    return character.location.image;
  }

  /**
   * Gets an addendum to the location in the bot name, for clarificatino.
   *
   * @param {Character} character - The character currently in this encounter.
   * @param {string} name - The existing bot name (usually location).
   *
   * @return {string}
   */
  getBotName(character, name) {
    return name + this.getBotSuffix(character);
  }

  /**
   * Get the suffix to append to the bot name.
   *
   * @param {Character} character - The character currently in this encounter.
   */
  getBotSuffix(character) {
    return '';
  }

  /**
   * Get the title to display for the character's current state.
   *
   * @param {Character} character - The character currently in this encounter.
   *
   * @return {string}
   */
  getTitle(character) {
    return this._title;
  }

  /**
   * Get the description for this encounter.
   *
   * @param {Character} character - The character encountering.
   *
   * @return {string}
   */
  getDescription(character) {
    return this._description;
  }

  /**
   * Get the actions for this encounter.
   *
   * @param {Character} character - The character encountering.
   *
   * @return {Actions}
   */
  getActions(character) {
    return this._actions;
  }

  /**
   * Cast a spell that may affect this encounter.
   *
   * @param {Spell} spell - The spell being cast.
   * @param {Character} character - The character casting the spell.
   *
   * @return {string} Message generated by casting spell.
   */
  castSpell(spell, character) {
    return `Casting ${spell.getDisplayName(character)} won't help right now.`;
  }

  /**
   * Update the last message sent.
   *
   * @param {string} description - The description to update the message with.
   * @param {Character} character - The character to update the message with.
   * @param {attachments} Attachments - A collection of attachments to update the message with.
   * @param {boolean} doLook - If we should append a look command after updating this message.
   */
  async updateLast({
    description = this.message.text,
    character = this.character,
    attachments = this.message.attachments,
    doLook = false,
  } = {}) {

    character.slashbot.update(this.message, description, character, attachments);

    if (doLook) {
      await this.doLook();
    }
  }

  /**
   * Perform a look action after delaying.
   *
   * @param {Character} character - The character looking.
   * @param {float} delay - The # of seconds to delay.
   */
  async doLook({
    character = this.character,
    delay = STD_DELAY
  } = {}) {
    await character.slashbot.doCommand('look', character, { info: { delay } });
  }
}

/**
 * Utility class for searching and creating new command objects.
 */
class Encounters extends Content {}

module.exports = {
  Encounter,
  Encounters
};

/**
 * @type array The collection of encounters.
 */
Files.loadContent(`${CONTENT_FILES_PATH}/encounters/`, `${CONTENT_FILES_PATH}/encounters/`, collection);