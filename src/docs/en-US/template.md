# Template General Information

> [!TIP] This section displays elements used in multiple templates.

### Lane Assessment `match_1` `player_1`

Lane results are analyzed by Stratz based on player data from the match, with a total of 5+1 types.
* ![stomp](/images/lane/stomp.png) Lane Dominance  
* ![victory](/images/lane/victory.png) Lane Advantage
* ![tie](/images/lane/tie.png) Lane Tie
* ![fail](/images/lane/fail.png) Lane Disadvantage
* ![stomped](/images/lane/stomped.png) Lane Overrun
> Special Type: Jungle
* ![jungle](/images/lane/jungle.png) Jungle Master

### Title System `match_1` `match_2`

Awards based on player performance data.
<table>
  <thead>
    <tr>
      <th style="text-align: center">Title</th>
      <th style="text-align: center">Display</th>
      <th style="text-align: left">Condition</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2" style="text-align: center"><span style="color: #FFA500;">MVP</span></td>
      <td>Victory and highest MVP score</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: center"><span style="color: #66CCFF;">Soul</span></td>
      <td>Loss and highest MVP score</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #FFD700;">Rich</span></td>
      <td style="text-align: center"><span style="color: #FFD700;">R</span></td>
      <td>Highest total net worth</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #8888FF;">Wise</span></td>
      <td style="text-align: center"><span style="color: #8888FF;">W</span></td>
      <td>Highest XPM</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #FF00FF;">Controller</span></td>
      <td style="text-align: center"><span style="color: #FF00FF;">C</span></td>
      <td>Longest control time (stun time × 1 + other control effects time × 0.5 + slow time × 0.25)</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #CC0088;">Nuker</span></td>
      <td style="text-align: center"><span style="color: #CC0088;">N</span></td>
      <td>Highest damage dealt</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #DD0000;">Breaker</span></td>
      <td style="text-align: center"><span style="color: #DD0000;">B</span></td>
      <td>Highest kills, and highest damage dealt if tied</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #CCCCCC;">Ghost</span></td>
      <td style="text-align: center"><span style="color: #CCCCCC;">G</span></td>
      <td>Highest deaths, and lowest total net worth if tied</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #20B2AA;">Utility</span></td>
      <td style="text-align: center"><span style="color: #20B2AA;">U</span></td>
      <td>Highest Utility Score (Calculated as: Gold Spent on Support Items + Camps Stacked × 100)</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #006400;">Assister</span></td>
      <td style="text-align: center"><span style="color: #006400;">A</span></td>
      <td>Highest assists, and highest damage dealt if tied</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #FEDCBA;">Demolisher</span></td>
      <td style="text-align: center"><span style="color: #FEDCBA;">D</span></td>
      <td>Highest building damage</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #00FF00;">Healer</span></td>
      <td style="text-align: center"><span style="color: #00FF00;">H</span></td>
      <td>Highest healing done</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #84A1C7;">Tank</span></td>
      <td style="text-align: center"><span style="color: #84A1C7;">T</span></td>
      <td>Highest damage taken</td>
    </tr>
    <tr>
      <td style="text-align: center"><span style="color: #DDDDDD;">Idle</span></td>
      <td style="text-align: center"><span style="color: #DDDDDD;">I</span></td>
      <td>Lowest participation rate, and lowest kills + assists if tied, then lowest damage dealt if still tied</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: center">MVP Score</td>
      <td>Kills × 5 + Assists × 3 + Stun Time × 0.1 + Other Control Effects Time × 0.05 + Slow Time × 0.025 + Damage Dealt × 0.001 + Building Damage × 0.01 + Healing Done × 0.002 + Stratz assessed performance score × 0.25 + Utility Score × 0.005</td>
    </tr>
  </tbody>
</table>

Starting from version `1.4.3`, title text and colors are customizable. Check [Custom Text](./i18n.md) for more information.
