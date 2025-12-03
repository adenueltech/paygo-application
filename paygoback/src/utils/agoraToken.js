const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = '16508d8f8518406287ee4e7f839fb0c3';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE; // Add to .env

class AgoraTokenService {
  static generateRtcToken(channelName, uid, role = RtcRole.PUBLISHER) {
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    return token;
  }

  static generateChannelName(sessionId) {
    return `paygo-session-${sessionId}`;
  }

  static generateUid() {
    return Math.floor(Math.random() * 100000) + 1;
  }
}

module.exports = AgoraTokenService;