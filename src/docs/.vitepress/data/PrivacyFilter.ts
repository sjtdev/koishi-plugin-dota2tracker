class PrivacyFilter {
  static mainPlayerId = 1;
  static otherPlayerId = 0;

  /**
   * 简化 Steam ID
   * @param {string} id Steam ID
   * @param {boolean} isMainPlayer 是否为主查询玩家
   * @returns {string} 简化后的ID
   */
  static simplifyId(id, isMainPlayer) {
    return isMainPlayer ? this.mainPlayerId : this.otherPlayerId;
  }

  /**
   * 混淆玩家名称
   * @param {string} name 玩家名称
   * @returns {string} 混淆后的名称
   */
  static maskPlayerName(name) {
    if (!name) return null;
    if (name.length <= 2) return '***';
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
  }

  /**
   * 模糊化时间，只保留日期
   * @param {string} dateTime ISO格式的日期时间
   * @returns {string} 只包含日期的字符串
   */
  static fuzzyDateTime(dateTime) {
    if (!dateTime) return null;
    return 0;
  }

  /**
   * 处理单个玩家数据
   * @param {Object} player 玩家数据
   * @param {boolean} isMainPlayer 是否为主查询玩家
   * @returns {Object} 处理后的玩家数据
   */
  static filterPlayerData(player, isMainPlayer = false) {
    if (!player) return null;

    const filtered = {
      ...player,
      steamAccount: player.steamAccount ? {
        ...player.steamAccount,
        id: this.simplifyId(player.steamAccount.id, isMainPlayer),
        name: this.maskPlayerName(player.steamAccount.name),
      } : null
    };

    // 如果不是主查询玩家，可以进一步移除一些信息
    if (!isMainPlayer) {
      if (filtered.guildMember) {
        filtered.guildMember.guild.tag = '***';
      }
    }

    return filtered;
  }

  /**
   * 处理比赛数据
   * @param {Object} match 比赛数据
   * @param {string} mainPlayerId 主查询玩家的原始 Steam ID
   * @returns {Object} 处理后的比赛数据
   */
  static filterMatchData(match, mainPlayerId) {
    if (!match) return null;

    return {
      ...match,
      id: this.otherPlayerId, // 简化比赛 ID
      startDateTime: this.fuzzyDateTime(match.startDateTime),
      parsedDateTime: this.fuzzyDateTime(match.parsedDateTime),
      players: match.players?.map(player => ({
        ...player,
        steamAccount: {
          ...player.steamAccount,
          id: this.simplifyId(player.steamAccount.id, player.steamAccount.id === mainPlayerId)
        }
      }))
    };
  }

  /**
   * 处理完整的查询响应数据
   * @param {Object} data GraphQL查询响应数据
   * @returns {Object} 处理后的数据
   */
  static filterQueryResponse(data) {
    if (!data?.player) return data;

    const mainPlayerId = data.player.steamAccount?.id;

    return {
      player: {
        ...data.player,
        // 处理主玩家数据
        ...this.filterPlayerData(data.player, true),
        // 处理比赛数据
        matches: data.player.matches?.map(match => this.filterMatchData(match, mainPlayerId))
      }
    };
  }
}

export default PrivacyFilter;
