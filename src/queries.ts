import * as dotaconstants from "dotaconstants";
export function MATCH_INFO(matchId) {
    return `
    {
      match(id: ${matchId}) {
        id
        didRadiantWin
        lobbyType
        gameMode
        regionId
        parsedDateTime
        startDateTime
        endDateTime
        actualRank
        rank
        averageRank
        durationSeconds
        topLaneOutcome
        midLaneOutcome
        bottomLaneOutcome
        radiantKills
        direKills
        players {
          steamAccountId
          steamAccount {
            name
          }
          level
          hero {
            id
            name
            shortName
          }
          dotaPlus{
            level
          }
          leaverStatus
          partyId
          position
          lane
          imp
          kills
          deaths
          assists
          isRadiant
          networth
          steamAccount {
            seasonRank
            seasonLeaderboardRank
          }
          item0Id
          item1Id
          item2Id
          item3Id
          item4Id
          item5Id
          backpack0Id
          backpack1Id
          backpack2Id
          neutral0Id
          stats {
            matchPlayerBuffEvent {
              abilityId
              itemId
              stackCount
            }
          }
          playbackData {
            purchaseEvents {
              itemId
              time
            }
          }
          heroDamage
          towerDamage
          stats {
            heroDamageReport {
              receivedTotal {
                physicalDamage
                magicalDamage
                pureDamage
              }
            }
          }
          numLastHits
          numDenies
          goldPerMinute
          experiencePerMinute
          heroHealing
          
          stats {
            campStack
            heroDamageReport {
              dealtTotal {
                stunDuration
                stunCount
                slowDuration
                slowCount
                disableDuration
                disableCount
              }
            }
          }
          additionalUnit{
            item0Id
            item1Id
            item2Id
            item3Id
            item4Id
            item5Id
            backpack0Id
            backpack1Id
            backpack2Id
            neutral0Id
          }

          isRandom
        }
        pickBans {
          isPick
          bannedHeroId
          heroId
          order
        }
      }
    }
    
`;
}

export function VERIFYING_PLAYER(steamAccountId) {
    return `
    {
        player(steamAccountId: ${steamAccountId}) {
          matchCount
        }
      }
      
    `;
}

export function PLAYERS_LASTMATCH(steamAccountIds) {
    return `
    {
        players(steamAccountIds:${JSON.stringify(steamAccountIds)}) {
          steamAccount{id}
          matches(request:{take:1}){
            id
            parsedDateTime
            startDateTime
            players{
              steamAccount{
                id
              }
            }
          }
        }
      }
      
    `;
}

export function PLAYER_INFO_WITH_25_MATCHES(steamAccountId) {
    return `
    {
		player(steamAccountId: ${steamAccountId}) {
		  steamAccount {
			avatar
			name
			seasonRank
			seasonLeaderboardRank
			id
		  }
		  guildMember {
			guild {
			  tag
			}
		  }
		  matchCount
		  winCount
		  performance {
			imp
		  }
		  heroesPerformance(take: 25, request: {matchGroupOrderBy: WIN_COUNT, take: 25}) {
			hero {
			  id
			  shortName
			}
			imp
			winCount
			matchCount
		  }
		  matches(request: {take: 25}) {
			id
			rank
      lobbyType
      gameMode
			startDateTime
			durationSeconds
			didRadiantWin
			topLaneOutcome
			midLaneOutcome
			bottomLaneOutcome
			radiantKills
			direKills
			players(steamAccountId: ${steamAccountId}) {
			  isRadiant
			  lane
			  kills
			  deaths
			  assists
        position
			  award
			  imp
			  hero {
				id
				shortName
			  }
			}
		  }
		}
		
	  }
	  
      `;
}

export function PLAYER_EXTRA_INFO(steamAccountId, matchCount, totalHeroCount) {
    return `{
        player(steamAccountId: ${steamAccountId}) {
          heroesPerformance(take: ${totalHeroCount}, request: {matchGroupOrderBy: MATCH_COUNT, take: ${matchCount}}) {
            hero {
              id
              shortName
            }
            winCount
            matchCount
            imp
          }
          dotaPlus {
            heroId
            level
          }
        }
      }
      `;
}

export function PLAYERS_INFO_WITH_10_MATCHES_FOR_GUILD(steamAccountIds){
  return `{
    players(steamAccountIds: [${steamAccountIds.join()}]) {
      steamAccount {
        id
        avatar
        name
        seasonRank
      }
      matches(request: {take: 10}) {
        didRadiantWin
        startDateTime
        players {
          isRadiant
          kills
          deaths
          assists
          steamAccount {
            id
          }
          hero {
            shortName
          }
          imp
        }
      }
    }
  }
  `
}

export function CURRENT_GAMEVERSION() {
    return `
    {
        constants {
          gameVersions{name id}
        }
      }
      
    `;
}

export function ALL_ABILITIES_CHINESE_NAME() {
    return `
    {
        constants {
             abilities(language:S_CHINESE){
            id
            language{displayName}
          }
          gameVersions{name id}
        }
      }
      
    `;
}

export function HERO_INFO(heroId) {
    return `
    {
        constants {
          hero(id: ${heroId}, language: S_CHINESE) {
            id
            name
            shortName
            aliases
            roles {
              roleId
              level
            }
            language {
              displayName
              lore
              hype
            }
            abilities {
              ability(language: S_CHINESE) {
                name
                language {
                  displayName
                  description
                  attributes
                  lore
                  aghanimDescription
                  shardDescription
                  notes
                }
                stat {
                  type
                  behavior
                  unitTargetType
                  unitTargetTeam
                  unitTargetFlags
                  unitDamageType
                  cooldown
                  manaCost
                  spellImmunity
                  isOnCastbar
                  isGrantedByShard
                  isGrantedByScepter
                  hasShardUpgrade
                  hasScepterUpgrade
                }
              }
            }
            talents {
              abilityId
              slot
            }
          }
        }
      }
      
    `;
}

export function HERO_MATCHUP_WINRATE(heroId) {
    return `
    {
        heroStats {
          matchUp(heroId: ${heroId}, take: ${Object.keys(dotaconstants.heroes).length - 1},bracketBasicIds:LEGEND_ANCIENT) {
            heroId
            matchCountWith
            matchCountVs
            with {
              heroId1
              winRateHeroId1
              heroId2
              winRateHeroId2
              winCount
              matchCount
            }
            vs {
              heroId1
              winRateHeroId1
              heroId2
              winRateHeroId2
              winCount
              matchCount
            }
          }
        }
      }
      
    `;
}
