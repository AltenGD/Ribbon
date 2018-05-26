/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Streamwatch TwitchMonitorsCommand - Configure which streamers to monitor  
 * **Aliases**: `monitors`, `monitor`, `twitchmonitor`
 * @module
 * @category streamwatch
 * @name twitchmonitors
 * @example twitchmonitors techagent favna
 * @param {StringResolvable} AnyMembers List of members to monitor space delimited
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TwitchMonitorsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'twitchmonitors',
      memberName: 'twitchmonitors',
      group: 'streamwatch',
      aliases: ['monitors', 'monitor', 'twitchmonitor'],
      description: 'Configures which streamers to spy on',
      format: 'Member [Member Member Member]',
      examples: ['twitchmonitors Favna Techagent'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'members',
          prompt: 'Which members to monitor?',
          type: 'member',
          infinite: true
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, {members}) {
    startTyping(msg);
    const memberIDs = members.map(m => m.id),
      memberNames = members.map(m => m.displayName);

    msg.guild.settings.set('twitchmonitors', memberIDs);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(stripIndents`🕵 Started spying on the stream status of ${memberNames.map(val => `\`${val}\``).join(', ')}
        Use \`${msg.guild.commandPrefix}twitchtoggle\` to toggle twitch notifiers on or off
        Use \`${msg.guild.commandPrefix}twitchoutput\` to set the channel the notifiers should be sent to`);
  }
};