# Configuration Instructions
### Basic Settings
#### STRATZ_API_TOKEN `string`
- The plugin relies on Stratz's API for data retrieval, so this must be configured to use it.
- A Stratz API token can be easily obtained by logging in with a Steam account. It allows 10,000 calls per day, which is generally sufficient.
> [!TIP] Daily API Call Calculation: 1440×(P/5)+(1+W)+R
> = minutes in a day × (number of bound and subscribed users ÷ 5) rounded up  
>  \+ (one parse request + requests sent for parsing when waiting for reports)  
>  \+ command query call count


#### dataParsingTimeoutMinutes `number`
- Data parsing timeout (in minutes)
- While player logins during games will automatically trigger parsing, and the plugin sends a parse request when tracking match data, issues like Stratz outages, game version updates not followed by Stratz, and non-standard modes could delay or prevent parsing. 
- After the match ends, if the wait time exceeds this configured value, incomplete match reports will be published.

#### urlInMessageType `checkbox`
- Include links in messages
- Include corresponding Stratz match page links in `dota2tracker.query-match/query-recent-match` commands and `push match messages`.
- Include corresponding Stratz player page links in `dota2tracker.query-player` commands.
- Include links to the corresponding hero pages on `刀塔百科` in `dota2tracker.query-hero` commands.

#### Rank Tracking
##### rankBroadSwitch `boolean`
- Enables tracking of bound players’ rank information; changes will result in sending rank change reports to the subscribed groups.

##### rankBroadStar `boolean`
- This will disable tracking of star level changes when turned off.

##### rankBroadLeader `boolean`
- Enables tracking of the ranking changes of top players.

##### rankBroadFun `boolean`
- Whether to enable fun reporting templates, see [Template Display](./template-rank.md) for effect.

### Summary Settings
#### Daily/Weekly Reports
##### dailyReportSwitch / weeklyReportSwitch `boolean`
- Switches for enabling daily and weekly reports. Currently, both use the same template.

##### dailyReportHours / weeklyReportHours
- Specify the time for daily/weekly report publication.

##### dailyReportShowCombi / weeklyReportShowCombi
- Switch for displaying player combinations in daily/weekly reports. <del>(Friendship ending switch)</del>

### Template Settings
#### template_match
Match template selection `["match_1", "match_2"]`
#### template_player
Player template selection `Currently, only one template available`
#### template_hero
Hero template selection `Currently, only one template available`
#### playerRankEstimate `boolean`
When enabled, querying players without ranks will infer their ranks based on recent matches, displayed as a greyed-out icon.
