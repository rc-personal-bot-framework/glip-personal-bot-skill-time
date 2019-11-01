import moment from 'moment'

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
  let sign = shouldUseSignature
    ? `\n(send by [${exports.name}](${exports.homepage}))`
    : ''
  let info = await user.rc.get('/restapi/v1.0/account/~/extension/~')
  if (!info || !info.data) {
    console.error('fetch user info fails')
    return false
  }
  let { timezone } = info.data.regionalSettings
  let now = moment().utc().utcOffset(Number(timezone.bias)).format('YYYY MMMM DD HH:mm A')
  let zone = `, timezone: **${timezone.name}**`
  let tip = `\nTip: timezone can be set in [service web](https://service.ringcentral.com)`
  await user.sendMessage(group.id, {
    text: `My current time is **${now}**${zone}${tip}${sign}`
  })
  return true
}
