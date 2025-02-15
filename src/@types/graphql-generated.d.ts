export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Byte: { input: any; output: any; }
  /** The `DateTime` scalar type represents a date and time. `DateTime` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  Guid: { input: any; output: any; }
  Long: { input: any; output: any; }
  Short: { input: any; output: any; }
  UShort: { input: any; output: any; }
};

export enum AbilityDispellEnum {
  No = 'NO',
  None = 'NONE',
  Yes = 'YES',
  YesStrong = 'YES_STRONG'
}

export enum AghanimLabDepthListAscensionAbilitiesEnum {
  AghsfortAscensionInvis = 'AGHSFORT_ASCENSION_INVIS',
  AscensionArmor = 'ASCENSION_ARMOR',
  AscensionArmorSapping = 'ASCENSION_ARMOR_SAPPING',
  AscensionAttackSpeed = 'ASCENSION_ATTACK_SPEED',
  AscensionBomb = 'ASCENSION_BOMB',
  AscensionBulwark = 'ASCENSION_BULWARK',
  AscensionChillingTouch = 'ASCENSION_CHILLING_TOUCH',
  AscensionCrit = 'ASCENSION_CRIT',
  AscensionDamage = 'ASCENSION_DAMAGE',
  AscensionDrunken = 'ASCENSION_DRUNKEN',
  AscensionEmbiggen = 'ASCENSION_EMBIGGEN',
  AscensionExtraFast = 'ASCENSION_EXTRA_FAST',
  AscensionFirefly = 'ASCENSION_FIREFLY',
  AscensionFlicker = 'ASCENSION_FLICKER',
  AscensionHealSuppression = 'ASCENSION_HEAL_SUPPRESSION',
  AscensionMagicImmunity = 'ASCENSION_MAGIC_IMMUNITY',
  AscensionMagicResist = 'ASCENSION_MAGIC_RESIST',
  AscensionMagneticField = 'ASCENSION_MAGNETIC_FIELD',
  AscensionMeteoric = 'ASCENSION_METEORIC',
  AscensionPlasmaField = 'ASCENSION_PLASMA_FIELD',
  AscensionSilence = 'ASCENSION_SILENCE',
  AscensionVampiric = 'ASCENSION_VAMPIRIC',
  AscensionVengeance = 'ASCENSION_VENGEANCE'
}

export enum AghanimLabDepthListEncounterEnum {
  EncounterAghanim = 'ENCOUNTER_AGHANIM',
  EncounterAlchemist = 'ENCOUNTER_ALCHEMIST',
  EncounterAquaManor = 'ENCOUNTER_AQUA_MANOR',
  EncounterAziyogCaverns = 'ENCOUNTER_AZIYOG_CAVERNS',
  EncounterBabyOgres = 'ENCOUNTER_BABY_OGRES',
  EncounterBambooGarden = 'ENCOUNTER_BAMBOO_GARDEN',
  EncounterBandits = 'ENCOUNTER_BANDITS',
  EncounterBeachTraps = 'ENCOUNTER_BEACH_TRAPS',
  EncounterBearsLair = 'ENCOUNTER_BEARS_LAIR',
  EncounterBigOgres = 'ENCOUNTER_BIG_OGRES',
  EncounterBlobDungeon = 'ENCOUNTER_BLOB_DUNGEON',
  EncounterBogTraps = 'ENCOUNTER_BOG_TRAPS',
  EncounterBombers = 'ENCOUNTER_BOMBERS',
  EncounterBombSquad = 'ENCOUNTER_BOMB_SQUAD',
  EncounterBonusChicken = 'ENCOUNTER_BONUS_CHICKEN',
  EncounterBonusGallery = 'ENCOUNTER_BONUS_GALLERY',
  EncounterBonusHooking = 'ENCOUNTER_BONUS_HOOKING',
  EncounterBonusLivestock = 'ENCOUNTER_BONUS_LIVESTOCK',
  EncounterBonusMangoOrchard = 'ENCOUNTER_BONUS_MANGO_ORCHARD',
  EncounterBonusSmashChickens = 'ENCOUNTER_BONUS_SMASH_CHICKENS',
  EncounterBossAmoeba = 'ENCOUNTER_BOSS_AMOEBA',
  EncounterBossArcWarden = 'ENCOUNTER_BOSS_ARC_WARDEN',
  EncounterBossClockwerkTinker = 'ENCOUNTER_BOSS_CLOCKWERK_TINKER',
  EncounterBossDarkWillow = 'ENCOUNTER_BOSS_DARK_WILLOW',
  EncounterBossEarthshaker = 'ENCOUNTER_BOSS_EARTHSHAKER',
  EncounterBossRizzrick = 'ENCOUNTER_BOSS_RIZZRICK',
  EncounterBossStoregga = 'ENCOUNTER_BOSS_STOREGGA',
  EncounterBossTimbersaw = 'ENCOUNTER_BOSS_TIMBERSAW',
  EncounterBossVisage = 'ENCOUNTER_BOSS_VISAGE',
  EncounterBossVoidSpirit = 'ENCOUNTER_BOSS_VOID_SPIRIT',
  EncounterBossWinterWyvern = 'ENCOUNTER_BOSS_WINTER_WYVERN',
  EncounterBrewmaster = 'ENCOUNTER_BREWMASTER',
  EncounterBridgeTraps = 'ENCOUNTER_BRIDGE_TRAPS',
  EncounterBroodmothers = 'ENCOUNTER_BROODMOTHERS',
  EncounterBurningMesa = 'ENCOUNTER_BURNING_MESA',
  EncounterCanopyTraps = 'ENCOUNTER_CANOPY_TRAPS',
  EncounterCastleTraps = 'ENCOUNTER_CASTLE_TRAPS',
  EncounterCatacombs = 'ENCOUNTER_CATACOMBS',
  EncounterCavernTraps = 'ENCOUNTER_CAVERN_TRAPS',
  EncounterCliffPass = 'ENCOUNTER_CLIFF_PASS',
  EncounterCollapsedMines = 'ENCOUNTER_COLLAPSED_MINES',
  EncounterCryptGate = 'ENCOUNTER_CRYPT_GATE',
  EncounterCryptTraps = 'ENCOUNTER_CRYPT_TRAPS',
  EncounterDarkForest = 'ENCOUNTER_DARK_FOREST',
  EncounterDarkSeer = 'ENCOUNTER_DARK_SEER',
  EncounterDeepTraps = 'ENCOUNTER_DEEP_TRAPS',
  EncounterDemonicWoods = 'ENCOUNTER_DEMONIC_WOODS',
  EncounterDesertOasis = 'ENCOUNTER_DESERT_OASIS',
  EncounterDireSiege = 'ENCOUNTER_DIRE_SIEGE',
  EncounterDragonKnight = 'ENCOUNTER_DRAGON_KNIGHT',
  EncounterDrowRangerMiniboss = 'ENCOUNTER_DROW_RANGER_MINIBOSS',
  EncounterDungeonTraps = 'ENCOUNTER_DUNGEON_TRAPS',
  EncounterEggsHoldout = 'ENCOUNTER_EGGS_HOLDOUT',
  EncounterElementalTiny = 'ENCOUNTER_ELEMENTAL_TINY',
  EncounterEmptyBeach = 'ENCOUNTER_EMPTY_BEACH',
  EncounterEmptyCavern = 'ENCOUNTER_EMPTY_CAVERN',
  EncounterEnragedWildwings = 'ENCOUNTER_ENRAGED_WILDWINGS',
  EncounterEventAlchemistNeutralItems = 'ENCOUNTER_EVENT_ALCHEMIST_NEUTRAL_ITEMS',
  EncounterEventBigTinyGrow = 'ENCOUNTER_EVENT_BIG_TINY_GROW',
  EncounterEventBrewmasterBar = 'ENCOUNTER_EVENT_BREWMASTER_BAR',
  EncounterEventDoomLifeSwap = 'ENCOUNTER_EVENT_DOOM_LIFE_SWAP',
  EncounterEventLeshrac = 'ENCOUNTER_EVENT_LESHRAC',
  EncounterEventLifeShop = 'ENCOUNTER_EVENT_LIFE_SHOP',
  EncounterEventMinorShardShop = 'ENCOUNTER_EVENT_MINOR_SHARD_SHOP',
  EncounterEventMorphlingAttributeShift = 'ENCOUNTER_EVENT_MORPHLING_ATTRIBUTE_SHIFT',
  EncounterEventNagaBottleRune = 'ENCOUNTER_EVENT_NAGA_BOTTLE_RUNE',
  EncounterEventNecrophos = 'ENCOUNTER_EVENT_NECROPHOS',
  EncounterEventOgreMagiCasino = 'ENCOUNTER_EVENT_OGRE_MAGI_CASINO',
  EncounterEventSlark = 'ENCOUNTER_EVENT_SLARK',
  EncounterEventSmallTinyShrink = 'ENCOUNTER_EVENT_SMALL_TINY_SHRINK',
  EncounterEventTinkerRangeRetrofit = 'ENCOUNTER_EVENT_TINKER_RANGE_RETROFIT',
  EncounterEventWarlockLibrary = 'ENCOUNTER_EVENT_WARLOCK_LIBRARY',
  EncounterEventZeus = 'ENCOUNTER_EVENT_ZEUS',
  EncounterFireRoshan = 'ENCOUNTER_FIRE_ROSHAN',
  EncounterForbiddenPalace = 'ENCOUNTER_FORBIDDEN_PALACE',
  EncounterForsakenPit = 'ENCOUNTER_FORSAKEN_PIT',
  EncounterFrigidPinnacle = 'ENCOUNTER_FRIGID_PINNACLE',
  EncounterFrozenRavine = 'ENCOUNTER_FROZEN_RAVINE',
  EncounterGaolers = 'ENCOUNTER_GAOLERS',
  EncounterGauntlet = 'ENCOUNTER_GAUNTLET',
  EncounterGolemGorge = 'ENCOUNTER_GOLEM_GORGE',
  EncounterHedgeTraps = 'ENCOUNTER_HEDGE_TRAPS',
  EncounterHellbearsPortalV_3 = 'ENCOUNTER_HELLBEARS_PORTAL_V_3',
  EncounterHellfireCanyon = 'ENCOUNTER_HELLFIRE_CANYON',
  EncounterHiddenColosseum = 'ENCOUNTER_HIDDEN_COLOSSEUM',
  EncounterIcyPools = 'ENCOUNTER_ICY_POOLS',
  EncounterInnerRing = 'ENCOUNTER_INNER_RING',
  EncounterJungleFireMaze = 'ENCOUNTER_JUNGLE_FIRE_MAZE',
  EncounterJungleHijinx = 'ENCOUNTER_JUNGLE_HIJINX',
  EncounterJungleTraps = 'ENCOUNTER_JUNGLE_TRAPS',
  EncounterJungleTrek = 'ENCOUNTER_JUNGLE_TREK',
  EncounterKunkkaTide = 'ENCOUNTER_KUNKKA_TIDE',
  EncounterLegionCommander = 'ENCOUNTER_LEGION_COMMANDER',
  EncounterLeshrac = 'ENCOUNTER_LESHRAC',
  EncounterMiningTraps = 'ENCOUNTER_MINING_TRAPS',
  EncounterMirana = 'ENCOUNTER_MIRANA',
  EncounterMoleCave = 'ENCOUNTER_MOLE_CAVE',
  EncounterMorphlingsB = 'ENCOUNTER_MORPHLINGS_B',
  EncounterMortyTransition = 'ENCOUNTER_MORTY_TRANSITION',
  EncounterMultiplicity = 'ENCOUNTER_MULTIPLICITY',
  EncounterMushroomMines = 'ENCOUNTER_MUSHROOM_MINES',
  EncounterMushroomMines_2021 = 'ENCOUNTER_MUSHROOM_MINES_2021',
  EncounterMysticalTraps = 'ENCOUNTER_MYSTICAL_TRAPS',
  EncounterNagaSiren = 'ENCOUNTER_NAGA_SIREN',
  EncounterOgreSeals = 'ENCOUNTER_OGRE_SEALS',
  EncounterOutworld = 'ENCOUNTER_OUTWORLD',
  EncounterPalaceTraps = 'ENCOUNTER_PALACE_TRAPS',
  EncounterPangolier = 'ENCOUNTER_PANGOLIER',
  EncounterPenguinsTransition = 'ENCOUNTER_PENGUINS_TRANSITION',
  EncounterPenguinSledding = 'ENCOUNTER_PENGUIN_SLEDDING',
  EncounterPhoenix = 'ENCOUNTER_PHOENIX',
  EncounterPinecones = 'ENCOUNTER_PINECONES',
  EncounterPineGrove = 'ENCOUNTER_PINE_GROVE',
  EncounterPolaritySwap = 'ENCOUNTER_POLARITY_SWAP',
  EncounterPrimalBeast = 'ENCOUNTER_PRIMAL_BEAST',
  EncounterPrisonTraps = 'ENCOUNTER_PRISON_TRAPS',
  EncounterPucks = 'ENCOUNTER_PUCKS',
  EncounterPudgeMiniboss = 'ENCOUNTER_PUDGE_MINIBOSS',
  EncounterPugnaNetherReaches = 'ENCOUNTER_PUGNA_NETHER_REACHES',
  EncounterPushPull = 'ENCOUNTER_PUSH_PULL',
  EncounterQuillBeasts = 'ENCOUNTER_QUILL_BEASTS',
  EncounterRegalTraps = 'ENCOUNTER_REGAL_TRAPS',
  EncounterRockGolems = 'ENCOUNTER_ROCK_GOLEMS',
  EncounterRuinousTraps = 'ENCOUNTER_RUINOUS_TRAPS',
  EncounterSacredGrounds = 'ENCOUNTER_SACRED_GROUNDS',
  EncounterSaltyShore = 'ENCOUNTER_SALTY_SHORE',
  EncounterShadowDemons = 'ENCOUNTER_SHADOW_DEMONS',
  EncounterSmashyAndBashy = 'ENCOUNTER_SMASHY_AND_BASHY',
  EncounterSnapfire = 'ENCOUNTER_SNAPFIRE',
  EncounterSpectres = 'ENCOUNTER_SPECTRES',
  EncounterSplitsville = 'ENCOUNTER_SPLITSVILLE',
  EncounterSpookTown = 'ENCOUNTER_SPOOK_TOWN',
  EncounterStonehallCitadel = 'ENCOUNTER_STONEHALL_CITADEL',
  EncounterStoregga = 'ENCOUNTER_STOREGGA',
  EncounterSwampOfSadness = 'ENCOUNTER_SWAMP_OF_SADNESS',
  EncounterTempleGarden = 'ENCOUNTER_TEMPLE_GARDEN',
  EncounterTempleGuardians = 'ENCOUNTER_TEMPLE_GUARDIANS',
  EncounterTempleSiege = 'ENCOUNTER_TEMPLE_SIEGE',
  EncounterTempleTraps = 'ENCOUNTER_TEMPLE_TRAPS',
  EncounterThunderMountain = 'ENCOUNTER_THUNDER_MOUNTAIN',
  EncounterToxicTerrace = 'ENCOUNTER_TOXIC_TERRACE',
  EncounterTransitionGateway = 'ENCOUNTER_TRANSITION_GATEWAY',
  EncounterTrollWarlord = 'ENCOUNTER_TROLL_WARLORD',
  EncounterTropicalKeep = 'ENCOUNTER_TROPICAL_KEEP',
  EncounterTuskSkeletons = 'ENCOUNTER_TUSK_SKELETONS',
  EncounterTwilightMaze = 'ENCOUNTER_TWILIGHT_MAZE',
  EncounterUndeadWoods = 'ENCOUNTER_UNDEAD_WOODS',
  EncounterVillageTraps = 'ENCOUNTER_VILLAGE_TRAPS',
  EncounterWarlocks = 'ENCOUNTER_WARLOCKS',
  EncounterWaveBlasters = 'ENCOUNTER_WAVE_BLASTERS',
  EncounterWendigoes = 'ENCOUNTER_WENDIGOES',
  EncounterZealotScarabs = 'ENCOUNTER_ZEALOT_SCARABS'
}

export enum AghanimLabDepthListRewardEnum {
  RewardTypeExtraLives = 'REWARD_TYPE_EXTRA_LIVES',
  RewardTypeGold = 'REWARD_TYPE_GOLD',
  RewardTypeNone = 'REWARD_TYPE_NONE',
  RewardTypeTreasure = 'REWARD_TYPE_TREASURE'
}

export enum AghanimLabMatchDifficultyEnum {
  Apexmage = 'APEXMAGE',
  Apprentice = 'APPRENTICE',
  Grandmagus = 'GRANDMAGUS',
  Magician = 'MAGICIAN',
  Sorcerer = 'SORCERER'
}

export enum AghanimLabPlayerBlessingEnum {
  AttackRange = 'ATTACK_RANGE',
  BossTome = 'BOSS_TOME',
  BottleCharges = 'BOTTLE_CHARGES',
  BottleRegenDuration = 'BOTTLE_REGEN_DURATION',
  BottleRegenMovementSpeed = 'BOTTLE_REGEN_MOVEMENT_SPEED',
  CastRange = 'CAST_RANGE',
  DamageOnStunned = 'DAMAGE_ON_STUNNED',
  DeathDetonation = 'DEATH_DETONATION',
  DebuffDurationIncrease = 'DEBUFF_DURATION_INCREASE',
  EliteUpgrade = 'ELITE_UPGRADE',
  ExtraLife = 'EXTRA_LIFE',
  LowHpOutgoingDamage = 'LOW_HP_OUTGOING_DAMAGE',
  MeleeCleave = 'MELEE_CLEAVE',
  ModifierBlessingAgility = 'MODIFIER_BLESSING_AGILITY',
  ModifierBlessingArmor = 'MODIFIER_BLESSING_ARMOR',
  ModifierBlessingAttackSpeed = 'MODIFIER_BLESSING_ATTACK_SPEED',
  ModifierBlessingBase = 'MODIFIER_BLESSING_BASE',
  ModifierBlessingBookAgility = 'MODIFIER_BLESSING_BOOK_AGILITY',
  ModifierBlessingBookIntelligence = 'MODIFIER_BLESSING_BOOK_INTELLIGENCE',
  ModifierBlessingBookStrength = 'MODIFIER_BLESSING_BOOK_STRENGTH',
  ModifierBlessingBottleUpgrade = 'MODIFIER_BLESSING_BOTTLE_UPGRADE',
  ModifierBlessingDamageBonus = 'MODIFIER_BLESSING_DAMAGE_BONUS',
  ModifierBlessingDamageReflect = 'MODIFIER_BLESSING_DAMAGE_REFLECT',
  ModifierBlessingDetonation = 'MODIFIER_BLESSING_DETONATION',
  ModifierBlessingEvasion = 'MODIFIER_BLESSING_EVASION',
  ModifierBlessingHealthBoost = 'MODIFIER_BLESSING_HEALTH_BOOST',
  ModifierBlessingIntelligence = 'MODIFIER_BLESSING_INTELLIGENCE',
  ModifierBlessingLifeSteal = 'MODIFIER_BLESSING_LIFE_STEAL',
  ModifierBlessingMagicDamageBonus = 'MODIFIER_BLESSING_MAGIC_DAMAGE_BONUS',
  ModifierBlessingMagicResist = 'MODIFIER_BLESSING_MAGIC_RESIST',
  ModifierBlessingManaBoost = 'MODIFIER_BLESSING_MANA_BOOST',
  ModifierBlessingMovementSpeed = 'MODIFIER_BLESSING_MOVEMENT_SPEED',
  ModifierBlessingPotionArcanist = 'MODIFIER_BLESSING_POTION_ARCANIST',
  ModifierBlessingPotionDragon = 'MODIFIER_BLESSING_POTION_DRAGON',
  ModifierBlessingPotionEchoSlam = 'MODIFIER_BLESSING_POTION_ECHO_SLAM',
  ModifierBlessingPotionHealth = 'MODIFIER_BLESSING_POTION_HEALTH',
  ModifierBlessingPotionMana = 'MODIFIER_BLESSING_POTION_MANA',
  ModifierBlessingPotionPurification = 'MODIFIER_BLESSING_POTION_PURIFICATION',
  ModifierBlessingPotionRavage = 'MODIFIER_BLESSING_POTION_RAVAGE',
  ModifierBlessingPotionShadowWave = 'MODIFIER_BLESSING_POTION_SHADOW_WAVE',
  ModifierBlessingPotionTorrent = 'MODIFIER_BLESSING_POTION_TORRENT',
  ModifierBlessingRefresherShard = 'MODIFIER_BLESSING_REFRESHER_SHARD',
  ModifierBlessingRespawnInvulnerability = 'MODIFIER_BLESSING_RESPAWN_INVULNERABILITY',
  ModifierBlessingRespawnTimeReduction = 'MODIFIER_BLESSING_RESPAWN_TIME_REDUCTION',
  ModifierBlessingRestoreMana = 'MODIFIER_BLESSING_RESTORE_MANA',
  ModifierBlessingSpellLifeSteal = 'MODIFIER_BLESSING_SPELL_LIFE_STEAL',
  ModifierBlessingStrength = 'MODIFIER_BLESSING_STRENGTH',
  OracleShopDiscount = 'ORACLE_SHOP_DISCOUNT',
  PotionHealth = 'POTION_HEALTH',
  PotionMana = 'POTION_MANA',
  ProjectileSpeed = 'PROJECTILE_SPEED',
  PurificationPotion = 'PURIFICATION_POTION',
  RegenAroundAllies = 'REGEN_AROUND_ALLIES',
  RespawnAttackSpeed = 'RESPAWN_ATTACK_SPEED',
  RespawnHaste = 'RESPAWN_HASTE',
  RespawnInvulnerability = 'RESPAWN_INVULNERABILITY',
  RespawnTimeReduction = 'RESPAWN_TIME_REDUCTION',
  RoshanShopDiscount = 'ROSHAN_SHOP_DISCOUNT',
  StartingGold = 'STARTING_GOLD',
  StartTome = 'START_TOME',
  StatAgi = 'STAT_AGI',
  StatDamage = 'STAT_DAMAGE',
  StatEvasion = 'STAT_EVASION',
  StatHealth = 'STAT_HEALTH',
  StatInt = 'STAT_INT',
  StatMagicResist = 'STAT_MAGIC_RESIST',
  StatMana = 'STAT_MANA',
  StatSpellAmp = 'STAT_SPELL_AMP',
  StatStr = 'STAT_STR',
  UpgradeReroll = 'UPGRADE_REROLL'
}

export enum BasicRegionType {
  China = 'CHINA',
  Europe = 'EUROPE',
  NorthAmerica = 'NORTH_AMERICA',
  Sea = 'SEA',
  SouthAmerica = 'SOUTH_AMERICA'
}

export enum BuildingType {
  Barracks = 'BARRACKS',
  Fort = 'FORT',
  Healer = 'HEALER',
  Outpost = 'OUTPOST',
  Tower = 'TOWER'
}

export type CaptainJackIdentityProfileUpdateRequestType = {
  /** Whether daily emails are enabled for the user. */
  dailyEmail?: InputMaybe<Scalars['Boolean']['input']>;
  /** The user's email. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The user's preferred email hour. */
  emailHour?: InputMaybe<Scalars['Byte']['input']>;
  /** The user's email level. */
  emailLevel?: InputMaybe<Scalars['Byte']['input']>;
  /** The user's feed level. */
  feedLevel?: InputMaybe<Scalars['Byte']['input']>;
  /** Whether the user's Stratz profile is public. */
  isStratzPublic?: InputMaybe<Scalars['Boolean']['input']>;
  /** The user's preferred language. */
  language?: InputMaybe<LanguageEnum>;
  /** Whether monthly emails are enabled for the user. */
  monthlyEmail?: InputMaybe<Scalars['Boolean']['input']>;
  /** The user's pro circuit email level. */
  proCircuitEmailLevel?: InputMaybe<Scalars['Byte']['input']>;
  /** The user's pro circuit feed level. */
  proCircuitFeedLevel?: InputMaybe<Scalars['Byte']['input']>;
  /** The user's theme type. */
  themeType?: InputMaybe<Scalars['Byte']['input']>;
  /** Whether weekly emails are enabled for the user. */
  weeklyEmail?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum Damage {
  Magical = 'MAGICAL',
  Physical = 'PHYSICAL',
  Pure = 'PURE',
  Unknown = 'UNKNOWN'
}

export type DeleteProSteamAccountRequestType = {
  name?: InputMaybe<Scalars['String']['input']>;
  realName?: InputMaybe<Scalars['String']['input']>;
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
};

export enum FeatEnum {
  DotaAccountLevel = 'DOTA_ACCOUNT_LEVEL',
  HighImp = 'HIGH_IMP',
  Rampage = 'RAMPAGE',
  WinStreak = 'WIN_STREAK'
}

export type FilterAghanimLabHeroCompositionRequestType = {
  /** The base level of difficulty */
  difficulty: AghanimLabMatchDifficultyEnum;
  /** If the return should be ordered by Ascending or Desending order. */
  orderDirection?: InputMaybe<FilterOrder>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum FilterAghanimLabMatchOrderBy {
  Duration = 'DURATION',
  EndDateTime = 'END_DATE_TIME'
}

export type FilterAghanimLabMatchRequestType = {
  /** The game must of been played after this set time. In Unix Time Stamp Format. */
  createdAfterDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The game must of been played before this set time. In Unix Time Stamp Format. */
  createdBeforeDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** How far into the game (levels) they completed. */
  depth?: InputMaybe<Scalars['Byte']['input']>;
  /** Required that the team playing the game won. */
  didWin?: InputMaybe<Scalars['Boolean']['input']>;
  /** The base level of difficulty */
  difficulty?: InputMaybe<AghanimLabMatchDifficultyEnum>;
  /** Return Matches that only include the set of Match Ids provided. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** The team had to make it at least this far (level). */
  minDepth?: InputMaybe<Scalars['Byte']['input']>;
  /** The order in which the data returned will be sorted by. */
  orderBy?: InputMaybe<FilterAghanimLabMatchOrderBy>;
  /** If the return should be ordered by Ascending or Desending order. */
  orderDirection?: InputMaybe<FilterOrder>;
  /** The max must be played in this list of regions */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** To date there are two seasons of Aghanim Labyrinth. Season 1 is the Year 2020 and Season 2 is 2021. */
  seasonId?: InputMaybe<Scalars['Byte']['input']>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** Return matches that only include this single player. */
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit : 100 */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum FilterDireTide2020CustomGameMatchOrderBy {
  CandyScored = 'CANDY_SCORED',
  EndDateTime = 'END_DATE_TIME'
}

export type FilterDireTideCustomMatchRequestType = {
  /** The order in which the data returned will be sorted by. */
  orderBy?: InputMaybe<FilterDireTide2020CustomGameMatchOrderBy>;
  /** If the return should be ordered by Ascending or Desending order. */
  orderDirection?: InputMaybe<FilterOrder>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The steam account id to include in this query, excluding all results that do not have this steam account id. */
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit : 20 */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type FilterHeroRampageType = {
  /** Only return matches after this match id. Can be used instead of Skip. */
  after?: InputMaybe<Scalars['Long']['input']>;
  /** Only return matches before this match id. Can be used instead of Skip. */
  before?: InputMaybe<Scalars['Long']['input']>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketBasicIds?: InputMaybe<Array<InputMaybe<RankBracketBasicEnum>>>;
  /** The hero id to include in this query, excluding all results that do not include this hero. */
  heroId: Scalars['Short']['input'];
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take: Scalars['Int']['input'];
};

export enum FilterHeroWinRequestGroupBy {
  All = 'ALL',
  HeroId = 'HERO_ID',
  HeroIdDurationMinutes = 'HERO_ID_DURATION_MINUTES',
  HeroIdPositionBracket = 'HERO_ID_POSITION_BRACKET',
  Time = 'TIME'
}

export enum FilterLeaderboardGuildOrderBy {
  BattlePassLevels = 'BATTLE_PASS_LEVELS',
  Id = 'ID',
  MemberCount = 'MEMBER_COUNT',
  Points = 'POINTS',
  PreviousWeekRank = 'PREVIOUS_WEEK_RANK',
  Rank = 'RANK'
}

export type FilterLeaderboardGuildRequestType = {
  /** The guild was created after this date time (in Unix TimeStamp). */
  createdAfterDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The guild was created before this date time (in Unix TimeStamp). */
  createdBeforeDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** If the guild is current set to 50 members. */
  isFull?: InputMaybe<Scalars['Boolean']['input']>;
  /** If anyone is able to join the guild. */
  isUnlocked?: InputMaybe<Scalars['Boolean']['input']>;
  /** The language required to join the guild. */
  language?: InputMaybe<Scalars['Byte']['input']>;
  /** The max amount of members a guild can have. */
  maxMemberCount?: InputMaybe<Scalars['Byte']['input']>;
  /** The rank required to join the guild. */
  maxRequiredRank?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of members a guild must have. */
  memberCount?: InputMaybe<Scalars['Byte']['input']>;
  /** The minimum amount of members a guild must have. */
  minMemberCount?: InputMaybe<Scalars['Byte']['input']>;
  /** The rank required to join the guild. */
  minRequiredRank?: InputMaybe<Scalars['Long']['input']>;
  /** If the return should be ordered by Ascending or Desending order. */
  order?: InputMaybe<FilterOrder>;
  /** What field to order the data by. Enum values. */
  orderBy?: InputMaybe<FilterLeaderboardGuildOrderBy>;
  /** What field to order the data by. Enum values. */
  region?: InputMaybe<Scalars['Byte']['input']>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type FilterLeaderboardHeroRequestType = {
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketIds?: InputMaybe<Array<InputMaybe<RankBracket>>>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take: Scalars['Int']['input'];
};

export enum FilterLeaderboardOrder {
  First = 'FIRST',
  Level = 'LEVEL',
  Recent = 'RECENT'
}

export enum FilterMatchGroupOrderByEnum {
  MatchCount = 'MATCH_COUNT',
  WinCount = 'WIN_COUNT'
}

export type FilterMatchReplayUploadRequestType = {
  byGameMode?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  byGameVersion?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  byHeroId?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  byLeagueId?: InputMaybe<Scalars['Int']['input']>;
  byLobbyType?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  byMatchId?: InputMaybe<Scalars['String']['input']>;
  byMatchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  byMatchUploadFileName?: InputMaybe<Scalars['String']['input']>;
  byMatchUploadUploaderCaptainJackId?: InputMaybe<Scalars['Guid']['input']>;
  bySeriesId?: InputMaybe<Scalars['String']['input']>;
  bySeriesIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  bySteamAccountId?: InputMaybe<Scalars['Long']['input']>;
  bySteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  byTeamId?: InputMaybe<Scalars['Int']['input']>;
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  filterPosition?: InputMaybe<MatchPlayerPositionType>;
  filterPositionIsUs?: InputMaybe<Scalars['Boolean']['input']>;
  filterPositionOrder?: InputMaybe<Array<InputMaybe<MatchPlayerTeamPickOrderType>>>;
  firstPick?: InputMaybe<Scalars['Boolean']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  isRadiantFirstPick?: InputMaybe<Scalars['Boolean']['input']>;
  isValidated?: InputMaybe<Scalars['Boolean']['input']>;
  isVictory?: InputMaybe<Scalars['Boolean']['input']>;
  maxDuration?: InputMaybe<Scalars['String']['input']>;
  maxGameVersionId?: InputMaybe<Scalars['String']['input']>;
  minDuration?: InputMaybe<Scalars['String']['input']>;
  minGameVersionId?: InputMaybe<Scalars['String']['input']>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  withEnemyBannedHeroId?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  withEnemyHeroId?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  withEnemySteamAccount?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  withFriendBannedHeroId?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  withFriendHeroId?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
};

export enum FilterOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum FilterOrderBy {
  Id = 'ID',
  LastMatchTime = 'LAST_MATCH_TIME',
  LastMatchTimeThenTier = 'LAST_MATCH_TIME_THEN_TIER',
  None = 'NONE',
  StartDateThenTier = 'START_DATE_THEN_TIER'
}

export enum FilterPlayerTeammateEnum {
  Against = 'AGAINST',
  With = 'WITH'
}

export type FilterSearchRequestType = {
  /** The minimum amount of time in which a user must have played a game to be allowed inside the search query. A unix timestamp. */
  lastMatchPlayedAgo?: InputMaybe<Scalars['Long']['input']>;
  /** The leaderboard is split into 4 regions. The user must appear in this region(s) for them to be allowed inside the search query. */
  leaderboardRegionIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** When searching for a league, the tier the league must be in. Tiers: Amateur = 1, Professional = 2, Premium = 3, Pro Circuit = 4, Main Event = 5 */
  leagueTierIds?: InputMaybe<Array<InputMaybe<LeagueTier>>>;
  /** The maximum rank a player must have to be allowed inside the search query. */
  maximumRank?: InputMaybe<Scalars['Int']['input']>;
  /** The minimum rank a player must have to be allowed inside the search query. */
  minimumRank?: InputMaybe<Scalars['Int']['input']>;
  /** The term used to define the search parameters. Minimum input is 2 characters. */
  query: Scalars['String']['input'];
  /** Searching our entire database can take time. If you already know what your searching for you, you can limit the query down to a set of specific types. (0 - Playuers, 1 - Matches, 2 - Leagues, 3 - Teams, 4 - ProPlayers, 5 - Casters). Default is all types. */
  searchType?: InputMaybe<Array<InputMaybe<SearchEnum>>>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** When searching for a team, only return results of those teams of which are considered Professionals. */
  teamIsPro?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FilterSeasonLeaderboardRequestType = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  heroId?: InputMaybe<Scalars['Short']['input']>;
  leaderBoardDivision?: InputMaybe<LeaderboardDivision>;
  position?: InputMaybe<MatchPlayerPositionType>;
  query?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['Int']['input']>;
};

export type FilterSeriesRequestType = {
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit : 20 */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum FindMatchPlayerGroupBy {
  Assists = 'ASSISTS',
  Award = 'AWARD',
  Cluster = 'CLUSTER',
  DateDay = 'DATE_DAY',
  DateDayHero = 'DATE_DAY_HERO',
  Deaths = 'DEATHS',
  DurationMinutes = 'DURATION_MINUTES',
  Faction = 'FACTION',
  GameMode = 'GAME_MODE',
  GameVersion = 'GAME_VERSION',
  GoldPerMinute = 'GOLD_PER_MINUTE',
  Hero = 'HERO',
  HeroPerformance = 'HERO_PERFORMANCE',
  Hour = 'HOUR',
  IsIntentionalFeeding = 'IS_INTENTIONAL_FEEDING',
  IsLeague = 'IS_LEAGUE',
  IsLeaver = 'IS_LEAVER',
  IsParty = 'IS_PARTY',
  IsRandom = 'IS_RANDOM',
  IsSeries = 'IS_SERIES',
  IsStats = 'IS_STATS',
  IsVictory = 'IS_VICTORY',
  Kills = 'KILLS',
  Lane = 'LANE',
  LeagueId = 'LEAGUE_ID',
  Level = 'LEVEL',
  LobbyType = 'LOBBY_TYPE',
  Position = 'POSITION',
  Region = 'REGION',
  RoamLane = 'ROAM_LANE',
  Role = 'ROLE',
  SteamAccountId = 'STEAM_ACCOUNT_ID',
  SteamAccountIdAgainstTeam = 'STEAM_ACCOUNT_ID_AGAINST_TEAM',
  SteamAccountIdHeroId = 'STEAM_ACCOUNT_ID_HERO_ID',
  SteamAccountIdHeroIdAgainstTeam = 'STEAM_ACCOUNT_ID_HERO_ID_AGAINST_TEAM',
  SteamAccountIdHeroIdWithTeam = 'STEAM_ACCOUNT_ID_HERO_ID_WITH_TEAM',
  SteamAccountIdWithTeam = 'STEAM_ACCOUNT_ID_WITH_TEAM',
  Team = 'TEAM',
  TotalKills = 'TOTAL_KILLS'
}

export enum FindMatchPlayerList {
  Against = 'AGAINST',
  All = 'ALL',
  Single = 'SINGLE',
  With = 'WITH'
}

export enum FindMatchPlayerOrderBy {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum GameModeEnumType {
  AbilityDraft = 'ABILITY_DRAFT',
  AllPick = 'ALL_PICK',
  AllPickRanked = 'ALL_PICK_RANKED',
  AllRandom = 'ALL_RANDOM',
  AllRandomDeathMatch = 'ALL_RANDOM_DEATH_MATCH',
  BalancedDraft = 'BALANCED_DRAFT',
  CaptainsDraft = 'CAPTAINS_DRAFT',
  CaptainsMode = 'CAPTAINS_MODE',
  CompendiumMatchmaking = 'COMPENDIUM_MATCHMAKING',
  Custom = 'CUSTOM',
  Event = 'EVENT',
  Intro = 'INTRO',
  LeastPlayed = 'LEAST_PLAYED',
  MidOnly = 'MID_ONLY',
  Mutation = 'MUTATION',
  NewPlayerPool = 'NEW_PLAYER_POOL',
  None = 'NONE',
  RandomDraft = 'RANDOM_DRAFT',
  ReverseCaptainsMode = 'REVERSE_CAPTAINS_MODE',
  SingleDraft = 'SINGLE_DRAFT',
  SoloMid = 'SOLO_MID',
  TheDiretide = 'THE_DIRETIDE',
  TheGreeviling = 'THE_GREEVILING',
  Turbo = 'TURBO',
  Tutorial = 'TUTORIAL',
  Unknown = 'UNKNOWN'
}

export enum GoldReason {
  Abadons = 'ABADONS',
  Bounty = 'BOUNTY',
  BuyBack = 'BUY_BACK',
  Couriers = 'COURIERS',
  Couriers_2 = 'COURIERS_2',
  Creeps = 'CREEPS',
  Death = 'DEATH',
  DoomDevourer = 'DOOM_DEVOURER',
  Heroes = 'HEROES',
  Neutral = 'NEUTRAL',
  Other = 'OTHER',
  Roshan = 'ROSHAN',
  Sells = 'SELLS',
  Structures = 'STRUCTURES',
  WardDestruction = 'WARD_DESTRUCTION'
}

export type HeroPickBanRequestType = {
  /** Only return matches after this match id. Can be used instead of Skip. */
  after?: InputMaybe<Scalars['Long']['input']>;
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Only return matches before this match id. Can be used instead of Skip. */
  before?: InputMaybe<Scalars['Long']['input']>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
};

export enum HeroPrimaryAttributeType {
  Agi = 'AGI',
  All = 'ALL',
  Int = 'INT',
  Str = 'STR'
}

export enum HeroRoleEnum {
  Carry = 'CARRY',
  Disabler = 'DISABLER',
  Durable = 'DURABLE',
  Escape = 'ESCAPE',
  Initiator = 'INITIATOR',
  Jungler = 'JUNGLER',
  Nuker = 'NUKER',
  Pusher = 'PUSHER',
  Support = 'SUPPORT'
}

export type ImpGeneratorPlayerEventRequestType = {
  assists: Scalars['UShort']['input'];
  cs: Scalars['UShort']['input'];
  damageReceived: Scalars['Int']['input'];
  deaths: Scalars['UShort']['input'];
  dn: Scalars['UShort']['input'];
  healingAllies: Scalars['Int']['input'];
  kills: Scalars['UShort']['input'];
  level: Scalars['Byte']['input'];
  magicalDamage: Scalars['Int']['input'];
  neutrals: Scalars['Int']['input'];
  physicalDamage: Scalars['Int']['input'];
  pureDamage: Scalars['Int']['input'];
  runePower: Scalars['Int']['input'];
  time: Scalars['Byte']['input'];
};

export type ImpGeneratorPlayerRequestType = {
  bracket: RankBracket;
  events: Array<InputMaybe<ImpGeneratorPlayerEventRequestType>>;
  heroId: Scalars['Short']['input'];
  position: MatchPlayerPositionType;
};

export type ImpGeneratorRequestType = {
  bans: Array<InputMaybe<Scalars['Short']['input']>>;
  isTurbo: Scalars['Boolean']['input'];
  players: Array<InputMaybe<ImpGeneratorPlayerRequestType>>;
};

export type ImportPickBanType = {
  heroId?: InputMaybe<Scalars['Short']['input']>;
  isPick?: InputMaybe<Scalars['Boolean']['input']>;
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['Byte']['input']>;
  playerSlot?: InputMaybe<Scalars['Byte']['input']>;
  time?: InputMaybe<Scalars['Byte']['input']>;
  wasBannedSuccessfully?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum LaneOutcomeEnums {
  DireStomp = 'DIRE_STOMP',
  DireVictory = 'DIRE_VICTORY',
  RadiantStomp = 'RADIANT_STOMP',
  RadiantVictory = 'RADIANT_VICTORY',
  Tie = 'TIE'
}

export enum LanguageEnum {
  Brazilian = 'BRAZILIAN',
  Bulgarian = 'BULGARIAN',
  Czech = 'CZECH',
  Danish = 'DANISH',
  Dutch = 'DUTCH',
  English = 'ENGLISH',
  Finnish = 'FINNISH',
  French = 'FRENCH',
  German = 'GERMAN',
  Greek = 'GREEK',
  Hungarian = 'HUNGARIAN',
  Italian = 'ITALIAN',
  Japanese = 'JAPANESE',
  Korean = 'KOREAN',
  Koreana = 'KOREANA',
  Norwegian = 'NORWEGIAN',
  Polish = 'POLISH',
  Portuguese = 'PORTUGUESE',
  Romanian = 'ROMANIAN',
  Russian = 'RUSSIAN',
  Spanish = 'SPANISH',
  Swedish = 'SWEDISH',
  SChinese = 'S_CHINESE',
  Thai = 'THAI',
  Turkish = 'TURKISH',
  TChinese = 'T_CHINESE',
  Ukrainian = 'UKRAINIAN'
}

export enum LeaderboardDivision {
  Americas = 'AMERICAS',
  China = 'CHINA',
  Europe = 'EUROPE',
  SeAsia = 'SE_ASIA'
}

export type LeagueMatchesRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of stage type ids to include in this query, excluding all results that do not include one of these stage types. */
  leagueStageTypeIds?: InputMaybe<Array<InputMaybe<LeagueStage>>>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip: Scalars['Int']['input'];
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The steam account id to include in this query, excluding all results that do not have this steam account id. */
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take: Scalars['Int']['input'];
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export enum LeagueNodeDefaultGroupEnum {
  BestOfFive = 'BEST_OF_FIVE',
  BestOfOne = 'BEST_OF_ONE',
  BestOfThree = 'BEST_OF_THREE',
  BestOfTwo = 'BEST_OF_TWO',
  Invalid = 'INVALID'
}

export enum LeagueNodeGroupTypeEnum {
  BracketDoubleAllWinner = 'BRACKET_DOUBLE_ALL_WINNER',
  BracketDoubleSeedLoser = 'BRACKET_DOUBLE_SEED_LOSER',
  BracketSingle = 'BRACKET_SINGLE',
  Gsl = 'GSL',
  Invalid = 'INVALID',
  Organizational = 'ORGANIZATIONAL',
  Placement = 'PLACEMENT',
  RoundRobin = 'ROUND_ROBIN',
  Showmatch = 'SHOWMATCH',
  Swiss = 'SWISS'
}

export enum LeagueRegion {
  China = 'CHINA',
  Cis = 'CIS',
  Europe = 'EUROPE',
  Na = 'NA',
  Sa = 'SA',
  Sea = 'SEA',
  Unset = 'UNSET'
}

export type LeagueRequestType = {
  /** Determine to End value of finding a League Between two specific datetimes. */
  betweenEndDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** Determine to Start value of finding a League Between two specific datetimes. */
  betweenStartDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** If a league is set to end before this time. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** Whether a league has live matches or not, represented in a boolean. */
  hasLiveMatches?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a league has started or not, represented in a boolean. */
  isFutureLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a league has ended or not, represented in a boolean. */
  leagueEnded?: InputMaybe<Scalars['Boolean']['input']>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of league ids to include in this query, excluding all results that do not include one of these leagues. */
  leagueIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The id to order the results by in this query. */
  orderBy?: InputMaybe<FilterOrderBy>;
  /** Whether an image is required or not, represented in a boolean. */
  requireImage?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a prize pool is required or not, represented in a boolean. */
  requirePrizePool?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a start and end date is required or not, represented in a boolean. */
  requireStartAndEndDates?: InputMaybe<Scalars['Boolean']['input']>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** If a league is set to start after this time. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** An array of tier ids to include in this query, excluding all results that do not include one of these tiers. */
  tiers?: InputMaybe<Array<InputMaybe<LeagueTier>>>;
};

export enum LeagueStage {
  ChampionsQualifers = 'CHAMPIONS_QUALIFERS',
  ClosedQualifers = 'CLOSED_QUALIFERS',
  GroupStage = 'GROUP_STAGE',
  MainEvent = 'MAIN_EVENT',
  OpenQualifers = 'OPEN_QUALIFERS'
}

export enum LeagueTier {
  Amateur = 'AMATEUR',
  DpcLeague = 'DPC_LEAGUE',
  DpcLeagueFinals = 'DPC_LEAGUE_FINALS',
  DpcLeagueQualifier = 'DPC_LEAGUE_QUALIFIER',
  DpcQualifier = 'DPC_QUALIFIER',
  International = 'INTERNATIONAL',
  Major = 'MAJOR',
  Minor = 'MINOR',
  Professional = 'PROFESSIONAL',
  Unset = 'UNSET'
}

export enum LeaverStatusEnum {
  Abandoned = 'ABANDONED',
  Afk = 'AFK',
  DeclinedReadyUp = 'DECLINED_READY_UP',
  Disconnected = 'DISCONNECTED',
  DisconnectedTooLong = 'DISCONNECTED_TOO_LONG',
  FailedToReadyUp = 'FAILED_TO_READY_UP',
  NeverConnected = 'NEVER_CONNECTED',
  NeverConnectedTooLong = 'NEVER_CONNECTED_TOO_LONG',
  None = 'NONE'
}

export enum LobbyTypeEnum {
  BattleCup = 'BATTLE_CUP',
  CoopVsBots = 'COOP_VS_BOTS',
  DireTide = 'DIRE_TIDE',
  Event = 'EVENT',
  Practice = 'PRACTICE',
  Ranked = 'RANKED',
  SoloMid = 'SOLO_MID',
  SoloQueue = 'SOLO_QUEUE',
  TeamMatch = 'TEAM_MATCH',
  Tournament = 'TOURNAMENT',
  Tutorial = 'TUTORIAL',
  Unranked = 'UNRANKED'
}

export enum MapLocationEnums {
  DireBase = 'DIRE_BASE',
  DireFountain = 'DIRE_FOUNTAIN',
  DireMidLane = 'DIRE_MID_LANE',
  DireOffLane = 'DIRE_OFF_LANE',
  DireSafeLane = 'DIRE_SAFE_LANE',
  RadiantBase = 'RADIANT_BASE',
  RadiantFountain = 'RADIANT_FOUNTAIN',
  RadiantMidLane = 'RADIANT_MID_LANE',
  RadiantOffLane = 'RADIANT_OFF_LANE',
  RadiantSafeLane = 'RADIANT_SAFE_LANE',
  River = 'RIVER',
  Roaming = 'ROAMING',
  Roshan = 'ROSHAN'
}

export enum MatchAnalysisOutcomeType {
  CloseGame = 'CLOSE_GAME',
  Comeback = 'COMEBACK',
  None = 'NONE',
  Stomped = 'STOMPED'
}

export enum MatchLaneType {
  Jungle = 'JUNGLE',
  MidLane = 'MID_LANE',
  OffLane = 'OFF_LANE',
  Roaming = 'ROAMING',
  SafeLane = 'SAFE_LANE',
  Unknown = 'UNKNOWN'
}

export enum MatchLiveGameState {
  CustomGameSetup = 'CUSTOM_GAME_SETUP',
  Disconnect = 'DISCONNECT',
  GameInProgress = 'GAME_IN_PROGRESS',
  HeroSelection = 'HERO_SELECTION',
  Init = 'INIT',
  Last = 'LAST',
  PlayerDraft = 'PLAYER_DRAFT',
  PostGame = 'POST_GAME',
  PreGame = 'PRE_GAME',
  ScenarioSetup = 'SCENARIO_SETUP',
  StrategyTime = 'STRATEGY_TIME',
  TeamShowcase = 'TEAM_SHOWCASE',
  WaitForMapToLoad = 'WAIT_FOR_MAP_TO_LOAD',
  WaitForPlayersToLoad = 'WAIT_FOR_PLAYERS_TO_LOAD'
}

export enum MatchLiveRequestOrderBy {
  AverageRank = 'AVERAGE_RANK',
  GameTime = 'GAME_TIME',
  MatchId = 'MATCH_ID',
  SpectatorCount = 'SPECTATOR_COUNT'
}

export type MatchLiveRequestType = {
  /** Only return Live Matches In Progress that are currently in these states. */
  gameStates?: InputMaybe<Array<InputMaybe<MatchLiveGameState>>>;
  /** The hero id to include in this query, excluding all results that do not include this hero. */
  heroId?: InputMaybe<Scalars['Short']['input']>;
  /** Returns only matches that are no longer active and completed but not yet deleted. */
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match is a league match or not. */
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Returns only matches that are currently still being updated by the backend. */
  isParsing?: InputMaybe<Scalars['Boolean']['input']>;
  /** Playback Data can contain a lot of information. This will only display the most recent event for each of the fields. */
  lastPlaybackEventOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of league ids to include in this query, excluding all results that do not include one of these leagues. */
  leagueIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The order in which the data returned will be sorted by. */
  orderBy?: InputMaybe<MatchLiveRequestOrderBy>;
  /** The amount of data to skip before collecting your query. This is useful for Paging. */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The amount to have returned in your query. The maximum of this is always dynamic. Limit :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** An array of tier ids to include in this query, excluding all results that do not include one of these tiers. */
  tiers?: InputMaybe<Array<InputMaybe<LeagueTier>>>;
};

export enum MatchPlayerAward {
  Mvp = 'MVP',
  None = 'NONE',
  TopCore = 'TOP_CORE',
  TopSupport = 'TOP_SUPPORT'
}

export enum MatchPlayerPositionType {
  All = 'ALL',
  Filtered = 'FILTERED',
  Position_1 = 'POSITION_1',
  Position_2 = 'POSITION_2',
  Position_3 = 'POSITION_3',
  Position_4 = 'POSITION_4',
  Position_5 = 'POSITION_5',
  Unknown = 'UNKNOWN'
}

export enum MatchPlayerRoleType {
  Core = 'CORE',
  HardSupport = 'HARD_SUPPORT',
  LightSupport = 'LIGHT_SUPPORT',
  Unknown = 'UNKNOWN'
}

export enum MatchPlayerTeamPickOrderType {
  FifthPick = 'FIFTH_PICK',
  FirstPick = 'FIRST_PICK',
  FourthPick = 'FOURTH_PICK',
  SecondPick = 'SECOND_PICK',
  ThirdPick = 'THIRD_PICK'
}

export type MergeProSteamAccountRequestType = {
  name?: InputMaybe<Scalars['String']['input']>;
  realName?: InputMaybe<Scalars['String']['input']>;
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
};

export enum NeutralItemTierEnum {
  Tier_1 = 'TIER_1',
  Tier_2 = 'TIER_2',
  Tier_3 = 'TIER_3',
  Tier_4 = 'TIER_4',
  Tier_5 = 'TIER_5'
}

export enum PatchNoteType {
  General = 'GENERAL',
  Generic = 'GENERIC',
  Hero = 'HERO',
  Item = 'ITEM',
  Npc = 'NPC'
}

export enum PlayerBattlePassGroupByEnum {
  Bracket = 'BRACKET',
  CountryCode = 'COUNTRY_CODE'
}

export enum PlayerBehaviorActivity {
  High = 'HIGH',
  Intense = 'INTENSE',
  Low = 'LOW',
  Medium = 'MEDIUM',
  None = 'NONE',
  VeryHigh = 'VERY_HIGH',
  VeryLow = 'VERY_LOW'
}

export type PlayerBreakdownRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether the match is a league match or not. */
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the specified player was on Radiant or not. */
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match has a team assigned or not. */
  isTeam?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Requests matches where the match is no longer than this many minutes.  Default is null and there is no maximum. */
  maxDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least this many minutes. Default is null and there is no minimum. */
  minDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Matches where the user is in a party with this many friends. Automatically applys IsParty = true. This is an array input. */
  partyCounts?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlayerHeroPerformanceMatchesRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether the match is a league match or not. */
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the specified player was on Radiant or not. */
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match has a team assigned or not. */
  isTeam?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of league ids to include in this query, excluding all results that do not include one of these leagues. */
  leagueIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  matchGroupOrderBy?: InputMaybe<FilterMatchGroupOrderByEnum>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Requests matches where the match is no longer than this many minutes.  Default is null and there is no maximum. */
  maxDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least this many minutes. Default is null and there is no minimum. */
  minDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** If the return should be ordered by Ascending or Desending order. */
  orderBy?: InputMaybe<FindMatchPlayerOrderBy>;
  /** Matches where the user is in a party with this many friends. Automatically applys IsParty = true. This is an array input. */
  partyCounts?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found against your team to include in this query, excluding all results that do not include one of these heroes found against team. */
  withEnemyHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on the enemy team to include in this query, excluding all results that do not include one of these steam accounts found on the enemy team. */
  withEnemySteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlayerHeroesPerformanceMatchesRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether the match is a league match or not. */
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the specified player was on Radiant or not. */
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match has a team assigned or not. */
  isTeam?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Requests matches where the match is no longer than this many minutes.  Default is null and there is no maximum. */
  maxDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least this many minutes. Default is null and there is no minimum. */
  minDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Matches where the user is in a party with this many friends. Automatically applys IsParty = true. This is an array input. */
  partyCounts?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found against your team to include in this query, excluding all results that do not include one of these heroes found against team. */
  withEnemyHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on the enemy team to include in this query, excluding all results that do not include one of these steam accounts found on the enemy team. */
  withEnemySteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlayerMatchesGroupByRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Only used when doing matchesGroupBy endpoint.  This is how the data will be grouped and makes your return Id field. */
  groupBy: FindMatchPlayerGroupBy;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether the match is a league match or not. */
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the specified player was on Radiant or not. */
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match was a victory or not for the specified player. */
  isVictory?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Determines if you want a single player returned, only the player by SteamAccountId, or if you want all 10 players in the match. */
  playerList: FindMatchPlayerList;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found against your team to include in this query, excluding all results that do not include one of these heroes found against team. */
  withEnemyHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on the enemy team to include in this query, excluding all results that do not include one of these steam accounts found on the enemy team. */
  withEnemySteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlayerMatchesRequestType = {
  /** Only return matches after this match id. Can be used instead of Skip. */
  after?: InputMaybe<Scalars['Long']['input']>;
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Only return matches before this match id. Can be used instead of Skip. */
  before?: InputMaybe<Scalars['Long']['input']>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the specified player was on Radiant or not. */
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match was a victory or not for the specified player. */
  isVictory?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Player must have less than this IMP for the Match to show. */
  maxImp?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Player must have at least this IMP for the Match to show. */
  minImp?: InputMaybe<Scalars['Int']['input']>;
  /** In what order the returned data will come in. */
  orderBy?: InputMaybe<FindMatchPlayerOrderBy>;
  /** Determines if you want a single player returned, only the player by SteamAccountId, or if you want all 10 players in the match. */
  playerList?: InputMaybe<FindMatchPlayerList>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** When requesting matches with a primary SteamAccountId, this will ensure that player is on specific team Id being sent in. */
  teamIdSteamAccount?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found against your team to include in this query, excluding all results that do not include one of these heroes found against team. */
  withEnemyHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A steam account id found on the enemy team to include in this query, excluding all results that do not include this steam account id found on the enemy team. */
  withEnemySteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlayerPerformanceMatchesRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match is a league match or not. */
  isLeague?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the specified player was on Radiant or not. */
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match has a team assigned or not. */
  isTeam?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the match was a victory or not for the specified player. */
  isVictory?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** When searching for a league, the tier the league must be in. Tiers: Amateur = 1, Professional = 2, Premium = 3, Pro Circuit = 4, Main Event = 5 */
  tier?: InputMaybe<LeagueTier>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlayerTeammatesGroupByRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of league ids to include in this query, excluding all results that do not include one of these leagues. */
  leagueIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  matchGroupOrderBy: FilterMatchGroupOrderByEnum;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Minimum amount of MatchCount required for a Duo to qualify */
  matchLimitMax?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum amount of MatchCount required for a Duo to qualify */
  matchLimitMin?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is lower than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no maximum. */
  maxGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Requests matches where the match is at least than this input.  See GameVersion API call for a list of patch ids. Default is null and there is no minimum. */
  minGameVersionId?: InputMaybe<Scalars['Int']['input']>;
  /** Include only results where the main player played with popular broadcasters. */
  onlyCasters?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include only results where main player played with popular professionals. */
  onlyPros?: InputMaybe<Scalars['Boolean']['input']>;
  /** If the return should be ordered by Ascending or Desending order. */
  orderBy?: InputMaybe<FindMatchPlayerOrderBy>;
  /** Only used when doing matchesGroupBy endpoint.  This is how the data will be grouped and makes your return Id field. */
  playerTeammateSort: FilterPlayerTeammateEnum;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take?: InputMaybe<Scalars['Int']['input']>;
  /** A team id to include in this query, excluding all results that do not have this team id. */
  teamId?: InputMaybe<Scalars['Int']['input']>;
  /** When requesting matches with a primary SteamAccountId, this will ensure that player is on specific team Id being sent in. */
  teamIdSteamAccount?: InputMaybe<Scalars['Int']['input']>;
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type PlusDraftMissingLetterRequestType = {
  /** A list of all of the banned hero ids in the draft. */
  bans: Scalars['Short']['input'];
  /** The game mode for this type. We only support All Pick and Ranked All Pick. In the future Captain's Mode will be supported. */
  gameMode: Scalars['Int']['input'];
  /** Due to Valve changing the way Picking has happened in the past, we require the GameVersionId so we know what version of the network to call. */
  gameVersionId: Scalars['Short']['input'];
  /** A list of player request objects. */
  players?: InputMaybe<Array<InputMaybe<PlusDraftPlayerRequestType>>>;
};

export type PlusDraftPlayerRequestType = {
  /** When a player has selected a hero, this is the id. If a null is sent, we will send back a hero list of possible heroes. */
  heroId?: InputMaybe<Scalars['Short']['input']>;
  /** The role this player will play. If a null is sent, we will assign the best possible role. */
  position?: InputMaybe<MatchPlayerPositionType>;
  /** The rank this played is.  In the event he is anonymous, use the lowest rank player in the game. */
  rank?: InputMaybe<Scalars['Byte']['input']>;
  /** The slot of player. It is required to be in order from 0-9. */
  slot: Scalars['Int']['input'];
  /** The steam id of the player. This will allow us to find player history on the player if he is not anonymous. */
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
};

export type PlusDraftRequestType = {
  /** A list of all of the banned hero ids in the draft. */
  bans?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** The game mode for this type. We only support All Pick and Ranked All Pick. In the future Captain's Mode will be supported. */
  gameMode: Scalars['Int']['input'];
  /** Due to Valve changing the way Picking has happened in the past, we require the GameVersionId so we know what version of the network to call. */
  gameVersionId: Scalars['Short']['input'];
  /** The match Id or the lobby id of the match your sending.  This will cache data for the next calls to be quicker. */
  matchId: Scalars['Long']['input'];
  /** A list of player request objects. */
  players: Array<InputMaybe<PlusDraftPlayerRequestType>>;
};

export enum PlusLetterType {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
  S = 'S'
}

export type PlusPlayerHoverRequestType = {
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** Should our Networks attempt to try to make Radiant Win the draft or Dire. */
  shouldRadiantWin?: InputMaybe<MatchPlayerPositionType>;
  /** An array of steam account ids to limit the query to only return matches with these steam account ids. */
  steamAccountIds: Array<InputMaybe<Scalars['Long']['input']>>;
  /** The amount of matches to have returned in your query. Max :  */
  take: Scalars['Int']['input'];
};

export enum RoshDifficultyEnum {
  Alpha = 'ALPHA',
  Easy = 'EASY',
  Expert = 'EXPERT',
  Hard = 'HARD',
  Medium = 'MEDIUM'
}

export type RoshMatchesRequestType = {
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-8 with 0 being unknown MMR and 1-8 is low to high MMR brackets. Example 7 is Divine. */
  bracketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  isRadiant?: InputMaybe<Scalars['Boolean']['input']>;
  isUserActionFirst?: InputMaybe<Scalars['Boolean']['input']>;
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
};

export enum RankBracket {
  Ancient = 'ANCIENT',
  Archon = 'ARCHON',
  Crusader = 'CRUSADER',
  Divine = 'DIVINE',
  Guardian = 'GUARDIAN',
  Herald = 'HERALD',
  Immortal = 'IMMORTAL',
  Legend = 'LEGEND',
  Uncalibrated = 'UNCALIBRATED'
}

export enum RankBracketBasicEnum {
  All = 'ALL',
  CrusaderArchon = 'CRUSADER_ARCHON',
  DivineImmortal = 'DIVINE_IMMORTAL',
  Filtered = 'FILTERED',
  HeraldGuardian = 'HERALD_GUARDIAN',
  LegendAncient = 'LEGEND_ANCIENT',
  Uncalibrated = 'UNCALIBRATED'
}

export enum RuneAction {
  Bottle = 'BOTTLE',
  Pickup = 'PICKUP'
}

export enum RuneEnums {
  Arcane = 'ARCANE',
  Bounty = 'BOUNTY',
  DoubleDamage = 'DOUBLE_DAMAGE',
  Haste = 'HASTE',
  Illusion = 'ILLUSION',
  Invisibility = 'INVISIBILITY',
  Regen = 'REGEN',
  Shield = 'SHIELD',
  Water = 'WATER',
  Wisdom = 'WISDOM'
}

export enum SearchEnum {
  Casters = 'CASTERS',
  Guilds = 'GUILDS',
  Leagues = 'LEAGUES',
  Matches = 'MATCHES',
  Players = 'PLAYERS',
  ProPlayers = 'PRO_PLAYERS',
  Teams = 'TEAMS'
}

export enum SeriesEnum {
  BestOfFive = 'BEST_OF_FIVE',
  BestOfOne = 'BEST_OF_ONE',
  BestOfThree = 'BEST_OF_THREE',
  BestOfTwo = 'BEST_OF_TWO'
}

export enum SpawnActionType {
  Despawn = 'DESPAWN',
  Spawn = 'SPAWN'
}

export enum StratzApiType {
  DataCollector = 'DATA_COLLECTOR',
  MultiKey = 'MULTI_KEY'
}

export enum Streak {
  KillStreak = 'KILL_STREAK',
  MultiKill = 'MULTI_KILL'
}

export enum TableCalculateEnum {
  Average = 'AVERAGE',
  Highest = 'HIGHEST',
  Lowest = 'LOWEST',
  Median = 'MEDIAN'
}

export type TeamMatchesRequestType = {
  /** An array of award ids to include in this query, excluding all results that do not include one of these awards. The player award types include MVP (1), Top Core (2), and Top Support (3). */
  awardIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** The end DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  endDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** An array of game mode ids to include in this query, excluding all results that do not include one of these game modes. */
  gameModeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of game version ids to include in this query, excluding all results that do not include one of these game versions. */
  gameVersionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** STRATZ gives 3 players in each game an award for playing well. MVP, Top Core, Top Support (enum MatchPlayerAwardType). If you include a query of 'steamAccountId' then it will require that player to have gotten at least 1 of these awards for each match result. */
  hasAward?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of hero ids to include in this query, excluding all results that do not include one of these heroes. */
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>>>;
  /** Whether STRATZ has yet parsed the data of the match or not, represented in a boolean. */
  isParsed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Include all matches that are party games, excluding all others. */
  isParty?: InputMaybe<Scalars['Boolean']['input']>;
  /** STRATZ applys an formula to determine if a game is considered 'real'. We attempt to detect AFKers, leavers, feeders, etc. 'IsStats' will return matches that do not include any of these poor quality matches. */
  isStats?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of lane ids (enum MatchLaneType) to include in this query, excluding all results that do not include one of these lanes. Roaming = 0, SafeLane = 1, Midlane = 2, Offlane = 3, Jungle = 4 */
  laneIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A league id to include in this query, excluding all results that do not have this league id. */
  leagueId?: InputMaybe<Scalars['Int']['input']>;
  /** An array of lobby type ids to include in this query, excluding all results that do not include one of these lobby types. */
  lobbyTypeIds?: InputMaybe<Array<InputMaybe<Scalars['Byte']['input']>>>;
  /** An array of Dota match ids to include in this query. */
  matchIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  /** Determines if you want a single player returned, only the player by SteamAccountId, or if you want all 10 players in the match. */
  playerList?: InputMaybe<FindMatchPlayerList>;
  /** An array of positions ids (enum MatchPlayerPositionType) to include in this query, excluding all results that do not include one of these lanes. */
  positionIds?: InputMaybe<Array<InputMaybe<MatchPlayerPositionType>>>;
  /** An array of rank ids to include in this query, excluding all results that do not include one of these ranks. The value ranges from 0-80 with 0 being unknown MMR and 1-80 is low to high MMR brackets. Example: 74 is Divine with 4 Stars. */
  rankIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of region ids to include in this query, excluding all results that do not include one of these regions. */
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of role ids (enum MatchPlayerRoleType) to include in this query, excluding all results that do not include one of these roles. Core = 0, Light Support = 1, Hard Support = 2 */
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** A series id to include in this query, excluding all results that do not have this series id. */
  seriesId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to skip before collecting your query. Hint: Paging */
  skip: Scalars['Int']['input'];
  /** The start DateTime of the Dota match(es) to include in this query, represented in unix seconds. */
  startDateTime?: InputMaybe<Scalars['Long']['input']>;
  /** The steam account id to include in this query, excluding all results that do not have this steam account id. */
  steamAccountId?: InputMaybe<Scalars['Long']['input']>;
  /** The amount of matches to have returned in your query. Max :  */
  take: Scalars['Int']['input'];
  /** An array of hero ids found on your team to include in this query, excluding all results that do not include one of these heroes found on your team. */
  withFriendHeroIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** An array of steam account ids found on your team to include in this query, excluding all results that do not include one of these steam accounts found on your team. */
  withFriendSteamAccountIds?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
};

export type UpdateFollowerRequestType = {
  /** FieldDescription */
  dailyEmail?: InputMaybe<Scalars['Boolean']['input']>;
  /** FieldDescription */
  emailLevel?: InputMaybe<Scalars['Byte']['input']>;
  /** FieldDescription */
  feedLevel?: InputMaybe<Scalars['Byte']['input']>;
  /** FieldDescription */
  monthlyEmail?: InputMaybe<Scalars['Boolean']['input']>;
  /** FieldDescription */
  overrideAllUsers?: InputMaybe<Scalars['Boolean']['input']>;
  /** FieldDescription */
  weeklyEmail?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateMatchReplayMatchUploadPlayerObjectType = {
  /** FieldDescription */
  position?: InputMaybe<MatchPlayerPositionType>;
  /** FieldDescription */
  steamAccountId: Scalars['Long']['input'];
};

export type UpdateMatchReplayUploadObjectType = {
  /** FieldDescription */
  direTeamId?: InputMaybe<Scalars['Long']['input']>;
  /** FieldDescription */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** FieldDescription */
  leagueId?: InputMaybe<Scalars['Long']['input']>;
  /** FieldDescription */
  matchId: Scalars['Long']['input'];
  /** FieldDescription */
  matchReplayUploadTeamId: Scalars['Long']['input'];
  /** FieldDescription */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** FieldDescription */
  players?: InputMaybe<Array<InputMaybe<UpdateMatchReplayMatchUploadPlayerObjectType>>>;
  /** FieldDescription */
  radiantTeamId?: InputMaybe<Scalars['Long']['input']>;
};

export enum WardType {
  Observer = 'OBSERVER',
  Sentry = 'SENTRY'
}

export enum XpReason {
  Creeps = 'CREEPS',
  Heroes = 'HEROES',
  Other = 'OTHER',
  Outposts = 'OUTPOSTS',
  Roshan = 'ROSHAN',
  TomeOfKnowledge = 'TOME_OF_KNOWLEDGE'
}

export type ConstantsQueryVariables = Exact<{
  language?: InputMaybe<LanguageEnum>;
}>;


export type ConstantsQuery = { __typename?: 'DotaQuery', constants?: { __typename?: 'ConstantQuery', gameVersions?: Array<{ __typename?: 'GameVersionType', id?: any | null } | null> | null, facets?: Array<{ __typename?: 'FacetType', name?: string | null, id?: any | null, color?: string | null, icon?: string | null, language?: { __typename?: 'FacetLanguageType', displayName?: string | null } | null } | null> | null } | null };

export type HeroMatchupWinrateQueryVariables = Exact<{
  heroId: Scalars['Short']['input'];
  take: Scalars['Int']['input'];
}>;


export type HeroMatchupWinrateQuery = { __typename?: 'DotaQuery', heroStats?: { __typename?: 'HeroStatsQuery', matchUp?: Array<{ __typename?: 'HeroDryadType', heroId?: any | null, matchCountWith?: any | null, matchCountVs?: any | null, with?: Array<{ __typename?: 'HeroStatsHeroDryadType', heroId1?: any | null, winRateHeroId1?: any | null, heroId2?: any | null, winRateHeroId2?: any | null, winCount?: any | null, matchCount?: any | null } | null> | null, vs?: Array<{ __typename?: 'HeroStatsHeroDryadType', heroId1?: any | null, winRateHeroId1?: any | null, heroId2?: any | null, winRateHeroId2?: any | null, winCount?: any | null, matchCount?: any | null } | null> | null } | null> | null } | null };

export type MatchInfoQueryVariables = Exact<{
  matchId: Scalars['Long']['input'];
}>;


export type MatchInfoQuery = { __typename?: 'DotaQuery', match?: { __typename?: 'MatchType', id?: any | null, didRadiantWin?: boolean | null, lobbyType?: LobbyTypeEnum | null, gameMode?: GameModeEnumType | null, regionId?: any | null, parsedDateTime?: any | null, startDateTime?: any | null, endDateTime?: any | null, actualRank?: any | null, rank?: number | null, averageRank?: any | null, durationSeconds?: number | null, topLaneOutcome?: LaneOutcomeEnums | null, midLaneOutcome?: LaneOutcomeEnums | null, bottomLaneOutcome?: LaneOutcomeEnums | null, radiantKills?: Array<number | null> | null, direKills?: Array<number | null> | null, radiantNetworthLeads?: Array<number | null> | null, radiantExperienceLeads?: Array<number | null> | null, winRates?: Array<any | null> | null, players?: Array<{ __typename?: 'MatchPlayerType', steamAccountId?: any | null, level?: any | null, variant?: any | null, leaverStatus?: LeaverStatusEnum | null, partyId?: any | null, position?: MatchPlayerPositionType | null, playerSlot?: any | null, lane?: MatchLaneType | null, imp?: any | null, kills?: any | null, deaths?: any | null, assists?: any | null, isRadiant?: boolean | null, networth?: number | null, item0Id?: any | null, item1Id?: any | null, item2Id?: any | null, item3Id?: any | null, item4Id?: any | null, item5Id?: any | null, backpack0Id?: any | null, backpack1Id?: any | null, backpack2Id?: any | null, neutral0Id?: any | null, heroDamage?: number | null, towerDamage?: number | null, numLastHits?: any | null, numDenies?: any | null, goldPerMinute?: any | null, experiencePerMinute?: any | null, heroHealing?: number | null, isRandom?: boolean | null, steamAccount?: { __typename?: 'SteamAccountType', name?: string | null, seasonRank?: any | null, seasonLeaderboardRank?: any | null } | null, hero?: { __typename?: 'HeroType', id?: any | null, name?: string | null, shortName?: string | null, facets?: Array<{ __typename?: 'HeroFacetType', facetId?: any | null } | null> | null } | null, dotaPlus?: { __typename?: 'HeroDotaPlusLeaderboardRankType', level?: any | null } | null, stats?: { __typename?: 'MatchPlayerStatsType', networthPerMinute?: Array<number | null> | null, campStack?: Array<number | null> | null, matchPlayerBuffEvent?: Array<{ __typename?: 'MatchPlayerStatsBuffEventType', abilityId?: number | null, itemId?: number | null, stackCount?: number | null } | null> | null, heroDamageReport?: { __typename?: 'MatchPlayerStatsHeroDamageReportType', receivedTotal?: { __typename?: 'MatchPlayerHeroDamageTotalRecievedReportObjectType', physicalDamage: number, magicalDamage: number, pureDamage: number } | null, dealtTotal?: { __typename?: 'MatchPlayerHeroDamageTotalReportObjectType', stunDuration: number, stunCount: number, slowDuration: number, slowCount: number, disableDuration: number, disableCount: number } | null } | null, itemPurchases?: Array<{ __typename?: 'MatchPlayerItemPurchaseEventType', itemId: number, time: number } | null> | null } | null, additionalUnit?: { __typename?: 'MatchPlayerAdditionalUnitType', item0Id?: any | null, item1Id?: any | null, item2Id?: any | null, item3Id?: any | null, item4Id?: any | null, item5Id?: any | null, backpack0Id?: any | null, backpack1Id?: any | null, backpack2Id?: any | null, neutral0Id?: any | null } | null } | null> | null, pickBans?: Array<{ __typename?: 'MatchStatsPickBanType', isPick: boolean, bannedHeroId?: any | null, heroId?: any | null, order?: number | null } | null> | null } | null, constants?: { __typename?: 'ConstantQuery', gameVersions?: Array<{ __typename?: 'GameVersionType', id?: any | null } | null> | null } | null };

export type PlayerExtraInfoQueryVariables = Exact<{
  steamAccountId: Scalars['Long']['input'];
  totalHeroCount: Scalars['Int']['input'];
  matchCount: Scalars['Int']['input'];
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>> | InputMaybe<Scalars['Short']['input']>>;
}>;


export type PlayerExtraInfoQuery = { __typename?: 'DotaQuery', player?: { __typename?: 'PlayerType', heroesPerformance?: Array<{ __typename?: 'PlayerHeroesPerformanceType', winCount: number, matchCount: number, imp?: number | null, hero?: { __typename?: 'HeroType', id?: any | null, shortName?: string | null } | null } | null> | null, dotaPlus?: Array<{ __typename?: 'HeroDotaPlusLeaderboardRankType', heroId?: any | null, level?: any | null } | null> | null } | null };

export type PlayerInfoWith25MatchesQueryVariables = Exact<{
  steamAccountId: Scalars['Long']['input'];
  heroIds?: InputMaybe<Array<InputMaybe<Scalars['Short']['input']>> | InputMaybe<Scalars['Short']['input']>>;
}>;


export type PlayerInfoWith25MatchesQuery = { __typename?: 'DotaQuery', player?: { __typename?: 'PlayerType', matchCount?: number | null, winCount?: number | null, steamAccount?: { __typename?: 'SteamAccountType', avatar?: string | null, name?: string | null, seasonRank?: any | null, seasonLeaderboardRank?: any | null, id?: any | null, isAnonymous: boolean } | null, guildMember?: { __typename?: 'GuildMemberType', guild?: { __typename?: 'GuildType', tag?: string | null } | null } | null, performance?: { __typename?: 'PlayerPerformanceType', imp?: number | null } | null, heroesPerformance?: Array<{ __typename?: 'PlayerHeroesPerformanceType', imp?: number | null, winCount: number, matchCount: number, hero?: { __typename?: 'HeroType', id?: any | null, shortName?: string | null } | null } | null> | null, matches?: Array<{ __typename?: 'MatchType', id?: any | null, rank?: number | null, lobbyType?: LobbyTypeEnum | null, gameMode?: GameModeEnumType | null, startDateTime?: any | null, parsedDateTime?: any | null, durationSeconds?: number | null, didRadiantWin?: boolean | null, topLaneOutcome?: LaneOutcomeEnums | null, midLaneOutcome?: LaneOutcomeEnums | null, bottomLaneOutcome?: LaneOutcomeEnums | null, radiantKills?: Array<number | null> | null, direKills?: Array<number | null> | null, players?: Array<{ __typename?: 'MatchPlayerType', isRadiant?: boolean | null, lane?: MatchLaneType | null, kills?: any | null, deaths?: any | null, assists?: any | null, position?: MatchPlayerPositionType | null, award?: MatchPlayerAward | null, imp?: any | null, steamAccount?: { __typename?: 'SteamAccountType', id?: any | null } | null, hero?: { __typename?: 'HeroType', id?: any | null, shortName?: string | null } | null } | null> | null } | null> | null } | null };

export type PlayersInfoWith10MatchesForGuildQueryVariables = Exact<{
  steamAccountIds: Array<InputMaybe<Scalars['Long']['input']>> | InputMaybe<Scalars['Long']['input']>;
}>;


export type PlayersInfoWith10MatchesForGuildQuery = { __typename?: 'DotaQuery', players?: Array<{ __typename?: 'PlayerType', steamAccount?: { __typename?: 'SteamAccountType', id?: any | null, avatar?: string | null, name?: string | null, seasonRank?: any | null } | null, matches?: Array<{ __typename?: 'MatchType', didRadiantWin?: boolean | null, startDateTime?: any | null, players?: Array<{ __typename?: 'MatchPlayerType', isRadiant?: boolean | null, kills?: any | null, deaths?: any | null, assists?: any | null, imp?: any | null, steamAccount?: { __typename?: 'SteamAccountType', id?: any | null } | null, hero?: { __typename?: 'HeroType', shortName?: string | null } | null } | null> | null } | null> | null } | null> | null };

export type PlayersLastmatchRankinfoQueryVariables = Exact<{
  steamAccountIds: Array<InputMaybe<Scalars['Long']['input']>> | InputMaybe<Scalars['Long']['input']>;
}>;


export type PlayersLastmatchRankinfoQuery = { __typename?: 'DotaQuery', players?: Array<{ __typename?: 'PlayerType', steamAccount?: { __typename?: 'SteamAccountType', id?: any | null, name?: string | null, avatar?: string | null, seasonRank?: any | null, seasonLeaderboardRank?: any | null, isAnonymous: boolean } | null, matches?: Array<{ __typename?: 'MatchType', id?: any | null, parsedDateTime?: any | null, startDateTime?: any | null, players?: Array<{ __typename?: 'MatchPlayerType', steamAccount?: { __typename?: 'SteamAccountType', id?: any | null } | null } | null> | null } | null> | null } | null> | null };

export type PlayersMatchesForDailyQueryVariables = Exact<{
  steamAccountIds: Array<InputMaybe<Scalars['Long']['input']>> | InputMaybe<Scalars['Long']['input']>;
  seconds: Scalars['Long']['input'];
}>;


export type PlayersMatchesForDailyQuery = { __typename?: 'DotaQuery', players?: Array<{ __typename?: 'PlayerType', steamAccount?: { __typename?: 'SteamAccountType', id?: any | null, name?: string | null, avatar?: string | null } | null, matches?: Array<{ __typename?: 'MatchType', id?: any | null, didRadiantWin?: boolean | null, parsedDateTime?: any | null, startDateTime?: any | null, players?: Array<{ __typename?: 'MatchPlayerType', kills?: any | null, deaths?: any | null, assists?: any | null, imp?: any | null, isRadiant?: boolean | null, steamAccount?: { __typename?: 'SteamAccountType', id?: any | null } | null } | null> | null } | null> | null } | null> | null };

export type RequestMatchDataAnalysisQueryVariables = Exact<{
  matchId: Scalars['Long']['input'];
}>;


export type RequestMatchDataAnalysisQuery = { __typename?: 'DotaQuery', stratz?: { __typename?: 'StratzQuery', matchRetry?: boolean | null } | null };

export type VerifyingPlayerQueryVariables = Exact<{
  steamAccountId: Scalars['Long']['input'];
}>;


export type VerifyingPlayerQuery = { __typename?: 'DotaQuery', player?: { __typename?: 'PlayerType', matchCount?: number | null, steamAccount?: { __typename?: 'SteamAccountType', isAnonymous: boolean } | null } | null };
