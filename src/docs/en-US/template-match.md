# Template Display

### match_1
> Match information from a high MMR game in Southeast Asia server
<ImageViewer src="/en-US/generated/match_1.png" />

##### Player Information Details
- Player's Steam account name
- K/D/A, Fight Participation Rate, Death Share (individual deaths as percentage of team deaths)
  > Higher fight participation deepens the red color value, pure red at 100%, pure white at 0%  
  > Higher death share deepens the black color value, pure white at 0%, pure black at 50% or above
- Economy, Damage/Net Worth ratio
- Title system, see [Title System](./template#title-system-match-1-match-2)
- Control duration: Stun time/Slow time/Other disable effect time

***
### match_2

<ImageViewer src="/en-US/generated/match_2.png" />

A MAX+ style template, sourced from [Steam_watcher](https://github.com/SonodaHanami/Steam_watcher).  
Compared to `match_1`, it lacks some details like: laning outcome, permanent buffs at game end, support item purchase counts, etc. However, it offers better readability and aligns more with DOTA2 players' data browsing habits.

***
### match_2+

<ImageViewer src="/en-US/generated/match_2+.png" />

An extension of `match_2` that includes additional information such as advantage and net worth line charts, a mini-map, and laning phase details.
Within the mini-map, the high-ground section displays timestamps for the destruction of melee barracks in each lane, the fall of the final Tier 4 tower, and the destruction of the Ancient (game end).
The extended information above is only displayed when the corresponding data is available.
