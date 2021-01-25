module.exports = {
  point: {format: 'Points:          $m ($0m)$s  $o ($0o)\n', keys: ['totals.points']},
  assist: {format: 'Assists:         $m ($0m)$s  $o ($0o)\n', keys: ['totals.assists']},
  rebound: {format: 'Rebounds:        $m ($0m, $1m OFF $2m DEF)\n                 $o ($0o, $1o OFF $2o DEF)\n', keys: ['totals.totReb', 'totals.offReb', 'totals.defReb']},
  steal: {format: 'Steals:          $m ($0m)$s  $o ($0o)\n', keys: ['totals.steals']},
  block: {format: 'Blocks:          $m ($0m)$s  $o ($0o)\n', keys: ['totals.blocks']},
  turnover: {format: 'Turnovers:       $m ($0m)$s  $o ($0o)\n', keys: ['totals.turnovers']},
  foul: {format: 'Fouls:           $m ($0m)$s  $o ($0o)\n', keys: ['totals.team_fouls']},
  percentage: {format: 'Efficiency:      $m ($0m/$1m/$2m)\n                 $o ($0o/$1o/$2o)\n', keys: ['totals.fgp', 'totals.tpp', 'totals.ftp']},
  change: {format: 'Lead_Changes:    ', keys: ''},
  tie: {format: 'Times_Tied:      ', keys: ''},
  paint: {format: 'Paint_Points:    $m ($0m)$s  $o ($0o)\n', keys: ['pointsInPaint']},
  turnover_points: {format: 'Turnover_Points: $m ($0m)$s  $o ($0o)\n', keys: ['pointsOffTurnovers']},
  fast_break: {format: 'Fast_Break_Pnts: $m ($0m)$s  $o ($0o)\n', keys: ['fastBreakPoints']},
  second_chance: {format: 'Sec_Chance_Pnts: $m ($0m)$s  $o ($0o)\n', keys: ['secondChancePoints']},
  biggest_lead: {format: 'Biggest_Lead:    $m ($0m)$s  $o ($0o)\n', keys: ['biggestLead']},
  run: {format: 'Longest_Run:     $m ($0m)$s  $o ($0o)\n', keys: ['longestRun']},
  timeout: {format: 'Timeouts_Left:   $m ($0m short, $1m full)\n                 $o ($0o short, $1o full)\n', keys: ['totals.short_timeout_remaining', 'totals.full_timeout_remaining']},
  aliases: {
    'points': 'point',
    'assists': 'assist',
    'dimes': 'assist',
    'rebounds': 'rebound',
    'boards': 'rebound',
    'steals': 'steal',
    'blocks': 'block',
    'turnovers': 'turnover',
    'fouls': 'foul',
    'percentages': 'percentage',
    'efficiency': 'percentage',
    'shooting': 'percentage',
    'changes': 'change',
    'leadchanges': 'change',
    'paintpoints': 'paint',
    'turnoverpoints': 'turnover_points',
    'fastbreak': 'fast_break',
    'fastbreakpoints': 'fast_break',
    'secondchance': 'second_chance',
    'secondchancepoints': 'second_chance',
    'biggestleads': 'biggest_lead',
    'biggestlead': 'biggest_lead',
    'leads': 'biggest_lead',
    'lead': 'biggest_lead',
    'runs': 'run',
    'biggestruns': 'run',
    'biggestrun': 'run',
    'timeouts': 'timeout',
    'timeoutsleft': 'timeout',
    'timeoutsremaining': 'timeout'
  }
}