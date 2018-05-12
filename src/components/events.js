/**
 * @file Ribbon Modules - Event modules for Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
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

/* eslint-disable one-var */

const Database = require('better-sqlite3'),
  Jimp = require('jimp'),
  imgur = require('imgur'),
  moment = require('moment'),
  path = require('path'),
  {MessageEmbed} = require('discord.js'),
  {promisify} = require('util'),
  {ordinal} = require(path.join(__dirname, 'util.js')),
  {stripIndents} = require('common-tags');
  
const checkReminders = async function (client) {
  const conn = new Database(path.join(__dirname, '../data/databases/reminders.sqlite3'));

  try {
    const query = conn.prepare('SELECT * FROM "reminders"').all();

    for (const row in query) {
      const remindTime = moment(query[row].remindTime),
        dura = moment.duration(remindTime.diff()); // eslint-disable-line sort-vars

      if (dura.asMinutes() <= 0) {
        const user = await client.users.fetch(query[row].userID);

        user.send({
          embed: {
            color: 10610610,
            description: query[row].remindText,
            author: {
              name: 'Ribbon Reminders',
              iconURL: client.user.displayAvatarURL({format: 'png'})
            },
            thumbnail: {url: 'https://favna.xyz/images/ribbonhost/reminders.png'}
          }
        });
        conn.prepare('DELETE FROM "reminders" WHERE userID = $userid AND remindTime = $remindTime').run({
          userid: query[row].userID,
          remindTime: query[row].remindTime
        });
      }
    }
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
      <@${client.owners[0].id}> Error occurred sending someone their reminder!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
  }
};

const forceStopTyping = function (client) {
  const allChannels = client.channels;

  for (const channel of allChannels.values()) {
    if (channel.type === 'text' || channel.type === 'dm' || channel.type === 'group') {
      if (client.user.typingDurationIn(channel) > 10000) {
        channel.stopTyping(true);
      }
    }
  }
};

const joinmessage = async function (member) {
  Jimp.prototype.getBase64Async = promisify(Jimp.prototype.getBase64);
  /* eslint-disable sort-vars*/
  const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
    border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
    canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
    newMemberEmbed = new MessageEmbed(),
    fontLarge = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-large.fnt')),
    fontMedium = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-medium.fnt')),
    mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png');
  /* eslint-enable sort-vars*/

  avatar.resize(136, Jimp.AUTO);
  mask.resize(136, Jimp.AUTO);
  border.resize(136, Jimp.AUTO);
  avatar.mask(mask, 0, 0);
  avatar.composite(border, 0, 0);
  canvas.blit(avatar, 5, 5);
  canvas.print(fontLarge, 155, 10, 'welcome'.toUpperCase());
  canvas.print(fontMedium, 160, 60, `you are the ${ordinal(member.guild.memberCount)} member`.toUpperCase());
  canvas.print(fontMedium, 160, 80, `of ${member.guild.name}`.toUpperCase());

  const base64 = await canvas.getBase64Async(Jimp.MIME_PNG), // eslint-disable-line one-var
    upload = await imgur.uploadBase64(base64.slice(base64.indexOf(',') + 1));

  newMemberEmbed
    .setColor('#80F31F')
    .setTitle('NEW MEMBER!')
    .setDescription(`Please give a warm welcome to <@${member.id}>`)
    .setImage(upload.data.link);

  member.guild.channels.get(member.guild.settings.get('joinmsgchannel')).send('', {embed: newMemberEmbed});
};

const leavemessage = async function (member) {
  Jimp.prototype.getBase64Async = promisify(Jimp.prototype.getBase64);
  /* eslint-disable sort-vars*/
  const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
    border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
    canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
    leaveMemberEmbed = new MessageEmbed(),
    fontLarge = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-large.fnt')),
    fontMedium = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-medium.fnt')),
    mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png');
    /* eslint-enable sort-vars*/

  avatar.resize(136, Jimp.AUTO);
  mask.resize(136, Jimp.AUTO);
  border.resize(136, Jimp.AUTO);
  avatar.mask(mask, 0, 0);
  avatar.composite(border, 0, 0);
  canvas.blit(avatar, 5, 5);
  canvas.print(fontLarge, 155, 10, 'goodbye'.toUpperCase());
  canvas.print(fontMedium, 160, 60, `there are now ${member.guild.memberCount} members`.toUpperCase());
  canvas.print(fontMedium, 160, 80, `on ${member.guild.name}`.toUpperCase());

  const base64 = await canvas.getBase64Async(Jimp.MIME_PNG), // eslint-disable-line one-var
    upload = await imgur.uploadBase64(base64.slice(base64.indexOf(',') + 1));

  leaveMemberEmbed
    .setColor('#F4BF42')
    .setTitle('Member Left 😢')
    .setDescription(`You will be missed <@${member.id}>`)
    .setImage(upload.data.link);

  member.guild.channels.get(member.guild.settings.get('leavemsgchannel')).send('', {embed: leaveMemberEmbed});
};

const lotto = function (client) {
  const conn = new Database(path.join(__dirname, '../data/databases/casino.sqlite3'));

  try {
    const tables = conn.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all();

    for (const table in tables) {
      const rows = conn.prepare(`SELECT * FROM "${tables[table].name}"`).all(),
        winner = Math.floor(Math.random() * rows.length),
        prevBal = rows[winner].balance; // eslint-disable-line sort-vars

      rows[winner].balance += 2000;

      conn.prepare(`UPDATE "${tables[table].name}" SET balance=$balance WHERE userID="${rows[winner].userID}"`).run({balance: rows[winner].balance});

      // eslint-disable-next-line one-var
      const defaultChannel = client.guilds.get(tables[table].name).systemChannel,
        winnerEmbed = new MessageEmbed(),
        winnerLastMessage = client.guilds.get(tables[table].name).members.get('112001393140723712').lastMessageChannelID,
        winnerLastMessageChannel = winnerLastMessage ? client.guilds.get(tables[table].name).channels.get(winnerLastMessage) : null,
        winnerLastMessageChannelPermitted = winnerLastMessageChannel ? winnerLastMessageChannel.permissionsFor(client.user).has('SEND_MESSAGES') : false;

      winnerEmbed
        .setColor('#7CFC00')
        .setDescription(`Congratulations <@${rows[winner].userID}>! You won today's random lotto and were granted 2000 chips 🎉!`)
        .setAuthor(client.guilds.get(tables[table].name).members.get(rows[winner].userID).displayName,
          client.guilds.get(tables[table].name).members.get(rows[winner].userID).user.displayAvatarURL({format: 'png'}))
        .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png')
        .addField('Balance', `${prevBal} ➡ ${rows[winner].balance}`);

      if (winnerLastMessageChannelPermitted) {
        winnerLastMessageChannel.send(`<@${rows[winner].userID}>`, {embed: winnerEmbed});
      } else if (defaultChannel) {
        defaultChannel.send(`<@${rows[winner].userID}>`, {embed: winnerEmbed});
      }
    }
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
    <@${client.owners[0].id}> Error occurred giving someone their lotto payout!
    **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Error Message:** ${err}
    `);
  }
};

const timermessages = function (client) {
  const conn = new Database(path.join(__dirname, '../data/databases/timers.sqlite3'));

  try {
    const tables = conn.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name != \'sqlite_sequence\';').all();

    for (const table in tables) {
      const rows = conn.prepare(`SELECT * FROM "${tables[table].name}"`).all();
      
      /* eslint-disable sort-vars*/
      for (const row in rows) {
        const timermoment = moment(rows[row].lastsend).add(rows[row].interval, 'ms'),
          dura = moment.duration(timermoment.diff());

        if (dura.asMinutes() <= 0) {
          conn.prepare(`UPDATE "${tables[table].name}" SET lastsend=$lastsend WHERE id=$id;`).run({
            id: rows[row].id,
            lastsend: moment().format('YYYY-MM-DD HH:mm')
          });
          const guild = client.guilds.get(tables[table].name),
            channel = guild.channels.get(rows[row].channel),
            timerEmbed = new MessageEmbed(),
            {me} = client.guilds.get(tables[table].name);
          /* eslint-enable sort-vars*/

          timerEmbed
            .setAuthor('Ribbon Timed Message', me.user.displayAvatarURL({format: 'png'}))
            .setColor(me.displayHexColor)
            .setDescription(rows[row].content);

          channel.send('', {embed: timerEmbed});
        }
      }
    }
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
    <@${client.owners[0].id}> Error occurred sending a timed message!
    **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Error Message:** ${err}
    `);
  }
};

module.exports = {
  checkReminders,
  forceStopTyping,
  joinmessage,
  leavemessage,
  lotto,
  timermessages
};