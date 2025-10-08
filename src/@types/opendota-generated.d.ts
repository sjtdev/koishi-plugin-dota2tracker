/**
 * 代表一个从 OpenDota API 获取的、经过完整解析的Dota 2比赛数据对象。
 */
export interface OpenDotaMatch {
    version?:                 number;
    match_id?:                number;
    draft_timings?:           any[];
    teamfights?:              Teamfight[];
    objectives?:              Objective[];
    chat?:                    Chat[];
    radiant_gold_adv?:        number[];
    radiant_xp_adv?:          number[];
    pauses?:                  any[];
    cosmetics?:               { [key: string]: number };
    players?:                 OpenDotaMatchPlayer[];
    leagueid?:                number;
    start_time?:              number;
    duration?:                number;
    series_id?:               number;
    series_type?:             number;
    cluster?:                 number;
    replay_salt?:             number;
    radiant_win?:             boolean;
    pre_game_duration?:       number;
    match_seq_num?:           number;
    tower_status_radiant?:    number;
    tower_status_dire?:       number;
    barracks_status_radiant?: number;
    barracks_status_dire?:    number;
    first_blood_time?:        number;
    lobby_type?:              number;
    human_players?:           number;
    game_mode?:               number;
    flags?:                   number;
    engine?:                  number;
    radiant_score?:           number;
    dire_score?:              number;
    picks_bans?:              PicksBan[];
    od_data?:                 OdData;
    metadata?:                null;
    replay_url?:              string;
    patch?:                   number;
    region?:                  number;
    all_word_counts?:         { [key: string]: number };
    my_word_counts?:          MyWordCounts;
    comeback?:                number;
    stomp?:                   number;
}

export interface Chat {
    time?:        number;
    type?:        ChatType;
    key?:         string;
    slot?:        number;
    player_slot?: number;
}

export type ChatType = "chatwheel" | "chat" | "buyback_log";

export interface MyWordCounts {
}

export interface Objective {
    time?:        number;
    type?:        ObjectiveType;
    slot?:        number;
    key?:         number | string;
    player_slot?: number;
    value?:       number;
    killer?:      number;
    team?:        number;
    unit?:        string;
}

export type ObjectiveType = "CHAT_MESSAGE_FIRSTBLOOD" | "CHAT_MESSAGE_COURIER_LOST" | "building_kill";

export interface OdData {
    has_api?:     boolean;
    has_gcdata?:  boolean;
    has_parsed?:  boolean;
    has_archive?: boolean;
}

export interface PicksBan {
    is_pick?: boolean;
    hero_id?: number;
    team?:    number;
    order?:   number;
}

export interface OpenDotaMatchPlayer {
    player_slot?:               number;
    obs_placed?:                number;
    sen_placed?:                number;
    creeps_stacked?:            number;
    camps_stacked?:             number;
    rune_pickups?:              number;
    firstblood_claimed?:        number;
    teamfight_participation?:   number;
    towers_killed?:             number;
    roshans_killed?:            number;
    observers_placed?:          number;
    stuns?:                     number;
    max_hero_hit?:              MaxHeroHit;
    times?:                     number[];
    gold_t?:                    number[];
    lh_t?:                      number[];
    dn_t?:                      number[];
    xp_t?:                      number[];
    obs_log?:                   ObsLeftLogElement[];
    sen_log?:                   ObsLeftLogElement[];
    obs_left_log?:              ObsLeftLogElement[];
    sen_left_log?:              ObsLeftLogElement[];
    purchase_log?:              KillsLogElement[];
    kills_log?:                 KillsLogElement[];
    buyback_log?:               Chat[];
    runes_log?:                 RunesLog[];
    connection_log?:            any[];
    lane_pos?:                  { [key: string]: { [key: string]: number } };
    obs?:                       { [key: string]: { [key: string]: number } };
    sen?:                       { [key: string]: { [key: string]: number } };
    actions?:                   { [key: string]: number };
    pings?:                     number;
    purchase?:                  { [key: string]: number };
    gold_reasons?:              { [key: string]: number };
    xp_reasons?:                { [key: string]: number };
    killed?:                    { [key: string]: number };
    item_uses?:                 { [key: string]: number };
    ability_uses?:              { [key: string]: number };
    ability_targets?:           Record<string, Record<string, number>>;
    damage_targets?:            Record<string, Record<string, number>>;
    hero_hits?:                 { [key: string]: number };
    damage?:                    { [key: string]: number };
    damage_taken?:              { [key: string]: number };
    damage_inflictor?:          { [key: string]: number };
    runes?:                     { [key: string]: number };
    killed_by?:                 { [key: string]: number };
    kill_streaks?:              { [key: string]: number };
    multi_kills?:               { [key: string]: number };
    life_state?:                { [key: string]: number };
    healing?:                   { [key: string]: number };
    damage_inflictor_received?: { [key: string]: number };
    randomed?:                  boolean;
    pred_vict?:                 boolean;
    neutral_tokens_log?:        any[];
    neutral_item_history?:      NeutralItemHistory[];
    account_id?:                number;
    party_id?:                  number;
    permanent_buffs?:           PermanentBuff[];
    party_size?:                number;
    team_number?:               number;
    team_slot?:                 number;
    hero_id?:                   number;
    hero_variant?:              number;
    item_0?:                    number;
    item_1?:                    number;
    item_2?:                    number;
    item_3?:                    number;
    item_4?:                    number;
    item_5?:                    number;
    backpack_0?:                number;
    backpack_1?:                number;
    backpack_2?:                number;
    item_neutral?:              number;
    item_neutral2?:             number;
    kills?:                     number;
    deaths?:                    number;
    assists?:                   number;
    leaver_status?:             number;
    last_hits?:                 number;
    denies?:                    number;
    gold_per_min?:              number;
    xp_per_min?:                number;
    level?:                     number;
    net_worth?:                 number;
    aghanims_scepter?:          number;
    aghanims_shard?:            number;
    moonshard?:                 number;
    hero_damage?:               number;
    tower_damage?:              number;
    hero_healing?:              number;
    gold?:                      number;
    gold_spent?:                number;
    ability_upgrades_arr?:      number[];
    personaname?:               string;
    name?:                      null;
    last_login?:                Date | null;
    rank_tier?:                 number | null;
    is_subscriber?:             boolean;
    radiant_win?:               boolean;
    start_time?:                number;
    duration?:                  number;
    cluster?:                   number;
    lobby_type?:                number;
    game_mode?:                 number;
    is_contributor?:            boolean;
    patch?:                     number;
    region?:                    number;
    isRadiant?:                 boolean;
    win?:                       number;
    lose?:                      number;
    total_gold?:                number;
    total_xp?:                  number;
    kills_per_min?:             number;
    kda?:                       number;
    abandons?:                  number;
    neutral_kills?:             number;
    tower_kills?:               number;
    courier_kills?:             number;
    lane_kills?:                number;
    hero_kills?:                number;
    observer_kills?:            number;
    sentry_kills?:              number;
    roshan_kills?:              number;
    necronomicon_kills?:        number;
    ancient_kills?:             number;
    buyback_count?:             number;
    observer_uses?:             number;
    sentry_uses?:               number;
    lane_efficiency?:           number;
    lane_efficiency_pct?:       number;
    lane?:                      number;
    lane_role?:                 number;
    is_roaming?:                boolean;
    purchase_time?:             { [key: string]: number };
    first_purchase_time?:       { [key: string]: number };
    item_win?:                  { [key: string]: number };
    item_usage?:                { [key: string]: number };
    purchase_ward_observer?:    number;
    purchase_tpscroll?:         number;
    actions_per_min?:           number;
    life_state_dead?:           number;
    cosmetics?:                 Cosmetic[];
    benchmarks?:                Benchmarks;
    purchase_ward_sentry?:      number;
    additional_units?:          {
      unitname?:           string;
      item_0?:             number;
      item_1?:             number;
      item_2?:             number;
      item_3?:             number;
      item_4?:             number;
      item_5?:             number;
      backpack_0?:         number;
      backpack_1?:         number;
      backpack_2?:         number;
      item_neutral?:       number;
      item_neutral2?:      number;
    }[];
}

export interface Benchmarks {
    gold_per_min?:         { [key: string]: number };
    xp_per_min?:           { [key: string]: number };
    kills_per_min?:        { [key: string]: number };
    last_hits_per_min?:    { [key: string]: number };
    hero_damage_per_min?:  { [key: string]: number };
    hero_healing_per_min?: { [key: string]: number };
    tower_damage?:         { [key: string]: number };
}

export interface Cosmetic {
    item_id?:          number;
    name?:             string;
    prefab?:           Prefab;
    creation_date?:    Date | null;
    image_inventory?:  string;
    image_path?:       null | string;
    item_description?: null | string;
    item_name?:        string;
    item_rarity?:      ItemRarity | null;
    item_type_name?:   null | string;
    used_by_heroes?:   null | string;
}

export type ItemRarity = "mythical" | "immortal" | "arcana" | "legendary" | "uncommon" | "rare";

export type Prefab = "wearable" | "ward" | "courier" | "taunt" | "tool" | "streak_effect";

export interface KillsLogElement {
    time?: number;
    key?:  string;
}

export interface MaxHeroHit {
    type?:        MaxHeroHitType;
    time?:        number;
    max?:         boolean;
    inflictor?:   string;
    unit?:        string;
    key?:         string;
    value?:       number;
    slot?:        number;
    player_slot?: number;
}

export type MaxHeroHitType = "max_hero_hit";

export interface NeutralItemHistory {
    time?:                     number;
    item_neutral?:             string;
    item_neutral_enhancement?: string;
}

export interface ObsLeftLogElement {
    time?:         number;
    type?:         ObsLeftLogType;
    slot?:         number;
    attackername?: string;
    x?:            number;
    y?:            number;
    z?:            number;
    entityleft?:   boolean;
    ehandle?:      number;
    key?:          string;
    player_slot?:  number;
}

export type ObsLeftLogType = "obs_left_log" | "obs_log" | "sen_left_log" | "sen_log";

export interface PermanentBuff {
    permanent_buff?: number;
    stack_count?:    number;
    grant_time?:     number;
}

export interface RunesLog {
    time?: number;
    key?:  number;
}

export interface Teamfight {
    start?:      number;
    end?:        number;
    last_death?: number;
    deaths?:     number;
    players?:    TeamfightPlayer[];
}

export interface TeamfightPlayer {
    deaths_pos?:      { [key: string]: { [key: string]: number } };
    ability_uses?:    { [key: string]: number };
    ability_targets?: MyWordCounts;
    item_uses?:       { [key: string]: number };
    killed?:          { [key: string]: number };
    deaths?:          number;
    buybacks?:        number;
    damage?:          number;
    healing?:         number;
    gold_delta?:      number;
    xp_delta?:        number;
    xp_start?:        number;
    xp_end?:          number;
}
