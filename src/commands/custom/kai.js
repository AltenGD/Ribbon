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

const commando = require('discord.js-commando'),
	{stripIndents} = require('common-tags');

module.exports = class kaiCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'kai',
			'memberName': 'kai',
			'group': 'custom',
			'description': 'Kai get lost',
			'details': 'Custom commands can be made for your server too! Just join the support server (use the `stats` command) and request the command.',
			'guildOnly': true,
			'patterns': [/^\.kai$/im]
		});
	}

	fetchImage () {
		const images = [
				'https://favna.s-ul.eu/Hmv6rsY6.png',
				'https://favna.s-ul.eu/DerXT5C5.png',
				'https://favna.s-ul.eu/8PvkavPo.png',
				'https://favna.s-ul.eu/JKgRZkuq.png',
				'https://favna.s-ul.eu/13UU9aOL.png',
				'https://favna.s-ul.eu/auWaubvu.gif'
			],
			curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

		return images[curImage];
	}

	hasPermission (msg) {
		if (this.client.isOwner(msg.author)) {
			return true;
		}
		if (msg.guild.id !== '210739734811508736') {
			return stripIndents `That command can only be used in the Chaos Gamez server, sorry 😦
			Want your own server specific custom commands? Join the support server (link in the \`${msg.guild.commandPrefix}stats\` command) and request the command.`;
		}

		return true;
	}

	run (msg) {
		msg.delete();
		msg.embed({
			'image': {'url': this.fetchImage()},
			'color': msg.guild ? msg.guild.members.get(this.client.user.id).displayColor : 16064544
		},
		'Please <@177179479712464896> get lost');
	}
};