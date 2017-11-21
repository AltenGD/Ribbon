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
	coin = require('flipacoin'),
	commando = require('discord.js-commando');


module.exports = class coinCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'coin',
			'group': 'fun',
			'aliases': ['flip'],
			'memberName': 'coin',
			'description': 'Flips a coin',
			'examples': ['flip'],
			'guildOnly': false,
			'throttling': {
				'usages': 1,
				'duration': 60
			}
		});
	}

	run (msg) {
		const coinEmbed = new Discord.MessageEmbed(),
			res = coin();

		coinEmbed
			.setColor('#FF0000')
			.setImage(res === 'head' ? 'https://favna.s-ul.eu/8ZKmpiKO.png' : 'https://favna.s-ul.eu/NTsDbSUo.png')
			.setTitle(`Flipped ${res}s`);

		msg.embed(coinEmbed);
	}
};