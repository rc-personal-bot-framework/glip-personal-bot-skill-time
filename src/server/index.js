import dayjs from 'dayjs'
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const { RINGCENTRAL_CHATBOT_SERVER, SERVER_HOME = '/' } = process.env
const appHome = RINGCENTRAL_CHATBOT_SERVER + SERVER_HOME
export const homepage = RINGCENTRAL_CHATBOT_SERVER
  ? appHome
  : 'https://github.com/rc-personal-bot-framework/ringcentral-personal-chatbot-skill-faq#readme'

export const name = 'Glip Personal Bot skill: Time'
export const description = 'Respond to "time" command with user\'s time and timezone which can be set in service web'

export const onPostAdd = async ({
  // text, // original text
  textFiltered, // text without metion user
  group,
  user,
  handled, // hanlded by prev skills
  shouldUseSignature // should use signature like "send by bot skill xxx" in message.
}) => {
  if (handled) {
    return false
  }
  if (textFiltered !== 'time') {
    return false
  }
  const sign = shouldUseSignature
    ? `\n(send by [${exports.name}](${exports.homepage}))`
    : ''
  const rc = await user.rc()
  const info = await rc.get('/restapi/v1.0/account/~/extension/~')
    .then(d => d.data)
    .catch(err => {
      console.error('fetch user info fails')
      console.log(err)
    })
  if (!info) {
    return false
  }
  const { timezone } = info.regionalSettings
  const now = dayjs().utc().utcOffset(Number(timezone.bias)).format('YYYY MMMM DD HH:mm A')
  const zone = `, timezone: **${timezone.name}**`
  const tip = '\nTip: timezone can be set in [service web](https://service.ringcentral.com)'
  await user.sendMessage(group.id, {
    text: `My current time is **${now}**${zone}${tip}${sign}`
  })
  return true
}
