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

const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	moment = require('moment'),
	{oneLine} = require('common-tags');

module.exports = class banCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'ban',
			'group': 'moderation',
			'aliases': ['b', 'banana'],
			'memberName': 'ban',
			'description': 'Bans a member from the server',
			'examples': ['ban {member} {reason}'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'Which member to ban?',
					'type': 'member'
				},
				{
					'key': 'reason',
					'prompt': 'Reason for banning?',
					'type': 'string'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	hasPermission (msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('BAN_MEMBERS');
	}

	run (msg, args) {
		if (args.member.id === msg.author.id) {
			this.deleteCommandMessages(msg);
			
			return msg.reply('⚠️ I don\'t think you want to ban yourself.');
		}

		if (!args.member.bannable) {
			this.deleteCommandMessages(msg);
			
			return msg.reply('⚠️ I cannot ban that member, their role is probably higher than my own!');
		}

		args.member.ban({
			'days': 1,
			'reason': args.reason
		});

		const embed = new Discord.MessageEmbed(),
			modLogs = this.client.provider.get(msg.guild, 'modlogchannel',
				msg.guild.channels.exists('name', 'mod-logs')
					? msg.guild.channels.find('name', 'mod-logs').id
					: null);

		embed
			.setColor('#FF1900')
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setDescription(`**Member:** ${args.member.user.tag} (${args.member.id})\n` +
				'**Action:** Ban\n' +
				`**Reason:** ${args.reason}`)
			.setFooter(moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'));

		if (this.client.provider.get(msg.guild, 'modlogs', true)) {
			if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
				msg.reply(oneLine `📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
				this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
			}

			if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
				msg.delete();
			}
			this.deleteCommandMessages(msg);
			
			return modLogs !== null ? msg.guild.channels.get(modLogs).send({embed}) : null;
		}
		this.deleteCommandMessages(msg);
		
		return null;
	}
};