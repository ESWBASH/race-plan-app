import { useState, useEffect, useCallback } from 'react'
import './App.css'

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const RACES = [
  {
    id: 'tittesworth', name: 'Tittesworth 50k', shortName: 'Tittesworth',
    date: '2026-07-05', distanceMi: 31, elevationFt: 5043,
    type: 'Trail Ultra', location: 'Peak District, Staffordshire',
    color: '#FC4C02', difficulty: 3,
    description: 'Your season opener — a classic Peak District 50k with sustained moorland climbing through reservoirs and technical trail. The goal here is executing race-day systems: pacing, fuelling, poles, mental fortitude. No heroics.',
    phases: [
      {
        name: 'Sharpen', weeks: 'Now → Race Day (3 weeks)',
        focus: 'No new fitness can be built. Sharpen what you have.',
        sessions: [
          'One more long run 12–14 miles with 2,000ft+ vert — Forest of Bowland or Pendle Hill',
          '2× easy midweeks 7–9 miles at Z2 — protect freshness, don\'t push',
          'Strides session: 8×20 sec at 5k effort with 90 sec walk recovery — wake the legs up',
          'Final S&C session 10 days out — then mobility only until race',
          'Walk the major climbs in training now so walking in the race feels natural and deliberate',
        ],
      },
    ],
    raceStrategy: '<strong>Miles 0–8:</strong> Start 20% slower than you think you need to. The opening section is deceptively runnable — that\'s the trap. <strong>Climbs:</strong> Walk everything over 12% grade from mile 1, not mile 18. Poles from the start. <strong>Fuelling:</strong> Eat something every 30 minutes from mile 5 regardless of hunger. Aid stations every 6–8 miles — don\'t skip. <strong>Miles 20+:</strong> This is where races are lost or won on patience. Count to the next aid station, not the finish.',
    keyRisk: 'Going out too fast on the first long descent. The opening miles are a trap — everyone does it, almost everyone regrets it.',
    kitList: ['Trail shoes (4mm+ lug)', 'Poles (mandatory)', '1.5L hydration vest', 'Waterproof jacket', 'Foil blanket', 'Backup headtorch', 'Gels + real food for 6h', 'Salt caps'],
    intel: {
      targetFinish: { optimistic: '7:45', realistic: '8:20', conservative: '9:00' },
      aidStations: [
        { name: 'Meerbrook', mile: 7.5, notes: 'Fill both bottles. Grab a banana or potato. In/out in 90 seconds — don\'t sit down.' },
        { name: 'Upperhulme', mile: 14, notes: 'Halfway point. Eat a real food item. Check feet. Don\'t linger — the hard miles haven\'t started yet.' },
        { name: 'Gradbach', mile: 20, notes: 'Most important stop. 11 miles remain. Big refuel — this is where the race starts. Eat properly, load two gels.' },
        { name: 'Flash', mile: 25.5, notes: '5.5 miles left. Quick grab and go. You\'re in the pain cave by now — this is normal. Keep moving.' },
      ],
      pacingSections: [
        { section: 'Miles 0–7.5', label: 'Opening Moorland', effort: 'Zone 2', targetTime: '1:55–2:10', cue: 'Let the pack go. Every runner who passes you in mile 1 you\'ll pass in mile 25.' },
        { section: 'Miles 7.5–14', label: 'Mid Climbs', effort: 'Zone 2', targetTime: '1:40–1:55', cue: 'Walk all steep climbs. Hiking poles = free speed. This is a skill, not failure.' },
        { section: 'Miles 14–20', label: 'Reservoir Section', effort: 'Zone 2', targetTime: '1:40–1:55', cue: 'Technical underfoot. Shorten stride, raise cadence. Protect ankles on loose rock.' },
        { section: 'Miles 20–25.5', label: 'Late Climbs', effort: 'Managed effort', targetTime: '1:30–1:45', cue: 'This is where 80% of runners blow up. Shorter steps, poles working hard, keep eating.' },
        { section: 'Miles 25.5–31', label: 'Final Push', effort: 'Everything left', targetTime: '1:20–1:40', cue: 'Count gates not miles. One field at a time. The finish line exists — you will reach it.' },
      ],
      fuelPlan: [
        { milestone: 'Breakfast', timing: 'T−3h', what: 'Porridge, banana, coffee', cals: 500, note: 'Your normal breakfast. Nothing new race morning.' },
        { milestone: 'Pre-start', timing: 'T−30min', what: 'Half a bar or small gel', cals: 100, note: 'Optional top-up. Sip water only.' },
        { milestone: 'Mile 5', timing: '~1:10 in', what: 'Gel #1', cals: 100, note: 'Before you feel you need it. Start the clock.' },
        { milestone: 'AS1 (7.5)', timing: '~2:00 in', what: 'Real food + gel pocket', cals: 200, note: 'Banana/potato from aid station. Load a gel for the road.' },
        { milestone: 'Mile 12', timing: '~3:00 in', what: 'Gel #3', cals: 100, note: 'Between aid stations. Non-negotiable.' },
        { milestone: 'AS2 (14)', timing: '~3:45 in', what: 'Real food + reload', cals: 250, note: 'Eat properly here. Wrap, rice cake, potato — whatever\'s there.' },
        { milestone: 'Mile 18', timing: '~4:40 in', what: 'Gel #5', cals: 100, note: 'Approaching the race\'s hardest section. Fuel ahead of need.' },
        { milestone: 'AS3 (20)', timing: '~5:20 in', what: 'Biggest feed of the day', cals: 350, note: 'Most important stop. Real food, 2 gels loaded, both bottles full. Don\'t skip anything.' },
        { milestone: 'Mile 23', timing: '~6:10 in', what: 'Gel #7', cals: 100, note: 'You\'re in the hurt locker. Eating feels hard — do it anyway.' },
        { milestone: 'AS4 (25.5)', timing: '~6:45 in', what: 'Quick grab + final gel', cals: 150, note: '5.5 miles left. Grab and go. One more gel for the finish.' },
        { milestone: 'Mile 28.5', timing: '~7:30 in', what: 'Final gel #9', cals: 100, note: 'Last fuel. Empty the tank from here.' },
      ],
      raceDayTimeline: [
        { time: '05:30', label: 'Wake up', detail: 'Alarm. Don\'t snooze. Gut needs time. Straight to kitchen.' },
        { time: '05:45', label: 'Breakfast', detail: 'Porridge + banana + coffee. Eat slowly. Everything was laid out last night.' },
        { time: '06:30', label: 'Kit on', detail: 'Vest, poles, number. Check mandatory kit is inside vest before you zip it. Don\'t check it at registration.' },
        { time: '07:00', label: 'Leave', detail: 'Tittesworth Reservoir car park. Trail race parking fills early — don\'t rush the drive but leave on time.' },
        { time: '07:50', label: 'Arrive & register', detail: 'Number check, GPS tracker if required. Assemble poles. Eat the rest of your bar. Walk around — don\'t sit.' },
        { time: '08:15', label: 'Final prep', detail: '5 min easy walking and dynamic leg swings. Apply any last-minute Vaseline. No running warm-up needed at this distance.' },
        { time: '08:25', label: 'Start pen', detail: 'Seed yourself mid-pack. Breathe. You\'ve trained for this for months. The work is done.' },
        { time: '08:30', label: '🏁 Race start', detail: 'Go. 20% slower than feels right. Let everyone go. Your race starts at mile 20.' },
      ],
      kitList: [
        { item: 'Trail shoes (4mm+ lug)', mandatory: true, note: 'Waterproof or standard — July Peak District could go either way' },
        { item: 'Poles', mandatory: true, note: 'Mandatory. Assembled before start, not in pack.' },
        { item: '1.5L hydration vest', mandatory: true, note: 'Full at start. Refill every aid station.' },
        { item: 'Waterproof jacket (taped seams)', mandatory: true, note: 'Lightweight. Pack it properly — you don\'t want to wrestle it on at mile 18.' },
        { item: 'Emergency foil blanket', mandatory: true, note: 'Weighs nothing. Mandatory check at registration.' },
        { item: 'Backup headtorch + batteries', mandatory: true, note: 'Unlikely to need but mandatory. Charged the night before.' },
        { item: 'First aid kit (plasters, tape)', mandatory: true, note: 'Include blister kit — moleskin + needle + thread.' },
        { item: 'Phone (charged)', mandatory: true, note: 'Emergency contact. Download offline maps of the route.' },
        { item: 'Gels ×9 + real food backup', mandatory: false, note: 'Carry 4 gels minimum between aid stations. Reload at each stop.' },
        { item: 'Salt caps', mandatory: false, note: '2 per hour from mile 10 in summer conditions.' },
        { item: 'Spare warm layer', mandatory: false, note: 'Thin merino or fleece. July on the moors can turn cold fast.' },
        { item: 'Blister prevention (Vaseline/tape)', mandatory: false, note: 'Apply before the race. Don\'t wait for hot spots.' },
      ],
    },
  },
  {
    id: '5valleys', name: '5 Valleys Ultra', shortName: '5 Valleys',
    date: '2026-09-26', distanceMi: 36, elevationFt: 8202,
    type: 'Lake District Ultra', location: 'Lake District, Cumbria',
    color: '#e67e22', difficulty: 5,
    description: 'Part of the 13 Valleys series — a spectacular point-to-point from Waterhead, Ambleside to Keswick threading five iconic Lake District valleys: Windermere, Haweswater, Ullswater, Thirlmere, and Borrowdale. 36 miles of serious Lakeland terrain with 8,200ft of climbing. Big mountains, technical trail, and a 19-hour cutoff. This is your hardest race per metre of ascent.',
    phases: [
      {
        name: 'Build', weeks: 'Jul–Aug (8 weeks)',
        focus: 'Vertical accumulation and back-to-back long efforts.',
        sessions: [
          'Back-to-back long runs: Sat 16 miles / Sun 10 miles — 4 of these across July–August',
          'Lake District day trips: Helvellyn, Fairfield Horseshoe, High Street ridge — get proper mountain legs',
          'Target 2,500–3,500ft vert in every Saturday long run',
          'Tempo: 8–10 miles at Z3 with 1,000ft of climb built in',
          'S&C twice weekly with heavy posterior chain focus — Romanian deadlifts, hip thrusts',
        ],
      },
      {
        name: 'Peak', weeks: 'Sep 1–20',
        focus: 'Race-specific vert and confidence on technical terrain.',
        sessions: [
          'Recce section of actual route if possible — Ullswater to Haweswater is the remote heart of the race',
          'Hill reps: 8×3 min at hard effort with full recovery — focus on uphill running form',
          'One overnight outing: 4 hours on trail in the dark — get comfortable with headtorch running',
          'Practice eating on the move on steep climbs — this is a skill, not a given',
        ],
      },
    ],
    raceStrategy: '<strong>This race is won in Haweswater.</strong> The middle section — miles 12 to 22 — is the most remote, most beautiful, and most dangerous section. Go out controlled from Ambleside. <strong>Fuelling:</strong> Every 30 minutes from the gun. The sustained mountain terrain elevates HR constantly — you burn fuel faster than you think. <strong>Descents:</strong> Lakeland descents are rocky and technical. Stay light on your feet, short stride. <strong>Keswick finish:</strong> Save 10% for the final Thirlmere section — it comes at mile 28 when you\'re tired.',
    keyRisk: 'Underestimating the remote nature of the Haweswater section. If something goes wrong between miles 12–22 you are a long way from help. Self-sufficiency is essential.',
    kitList: ['Lakeland fell shoes (Inov-8 or Mudclaws)', 'Poles', '2L hydration', 'Full waterproof (compulsory)', 'Gloves + hat', 'Emergency kit to event spec', 'Min 2,500 kcal food', 'Anti-chafe', 'Headtorch (early finish possible)'],
    intel: {
      targetFinish: { optimistic: '9:30', realistic: '11:00', conservative: '13:30' },
      aidStations: [
        { name: 'CP1 — Ullswater', mile: 10, notes: 'First checkpoint. Fill bottles, grab food. The hardest climbing is still ahead. Don\'t sit down. Morale is high here — keep it controlled.' },
        { name: 'CP2 — Haweswater', mile: 20, notes: 'The heart of the race. Most remote point. Big refuel here — eat proper food, not just gels. 16 miles remain. This is where the race starts.' },
        { name: 'CP3 — Thirlmere', mile: 28, notes: 'With 8 miles to Keswick. You\'re tired. Eat something, refill, and remember: Keswick is runnable from here. Move well.' },
      ],
      pacingSections: [
        { section: 'Miles 0–10', label: 'Ambleside → Ullswater', effort: 'Zone 2', targetTime: '2:10–2:30', cue: 'Controlled through Windermere. The crowd at the start will try to drag you out fast. Ignore them. Let the first valley pass before you push anything.' },
        { section: 'Miles 10–20', label: 'Ullswater → Haweswater', effort: 'Zone 2', targetTime: '2:20–2:45', cue: 'Spectacular but exposed. Walk every steep ascent. This is the section that breaks people who went out too hard. Stay patient.' },
        { section: 'Miles 20–28', label: 'Haweswater → Thirlmere', effort: 'Managed effort', targetTime: '2:00–2:20', cue: 'The hardest climbing is here. Poles working. Eat on every descent. This section has the most vert per mile of the entire race.' },
        { section: 'Miles 28–36', label: 'Thirlmere → Keswick', effort: 'Everything left', targetTime: '1:45–2:10', cue: 'Keswick is visible on the horizon from parts of this section. Use it. Count the miles down. You will finish.' },
      ],
      fuelPlan: [
        { milestone: 'Breakfast', timing: 'T−3h', what: 'Porridge, banana, coffee', cals: 500, note: 'Same as Tittesworth. Nothing new. Big bowl — 8,200ft requires big fuel.' },
        { milestone: 'Pre-start', timing: 'T−30min', what: 'Half bar', cals: 100, note: 'Sip water only. Stomach settles during the first valley.' },
        { milestone: 'Mile 7', timing: '~1:35 in', what: 'Gel #1 + chew', cals: 150, note: 'Before Ullswater CP. Start the engine.' },
        { milestone: 'CP1 Ullswater', timing: '~2:20 in', what: 'Real food + refill', cals: 250, note: 'Banana, potato, whatever\'s there. Fill both bottles for Haweswater — longest gap.' },
        { milestone: 'Mile 15', timing: '~3:30 in', what: 'Gel + salt cap', cals: 100, note: 'Mid-section fuel. Remote zone — nothing until CP2.' },
        { milestone: 'CP2 Haweswater', timing: '~4:45 in', what: 'Hot food if available + gels', cals: 350, note: 'Most important stop. 16 miles remain. Eat properly. This is where the real race starts.' },
        { milestone: 'Mile 24', timing: '~5:45 in', what: 'Gel + real food', cals: 150, note: 'Between CPs 2 and 3. Keep the clock ticking.' },
        { milestone: 'CP3 Thirlmere', timing: '~6:45 in', what: 'Quick snack + refill', cals: 200, note: '8 miles to Keswick. Quick grab and go. You\'re nearly there.' },
        { milestone: 'Miles 31–36', timing: 'Final push', what: 'Gels only', cals: 200, note: 'Stomach shuts down. Gels only. Small sips. Keswick is close.' },
      ],
    },
  },
  {
    id: 'utyd', name: 'UTYD 50k', shortName: 'UTYD',
    date: '2026-10-17', distanceMi: 31, elevationFt: 4921,
    type: 'Self-Nav Ultra', location: 'Yorkshire Dales',
    color: '#27ae60', difficulty: 4,
    description: 'A self-navigation 50k just 3 weeks after 5 Valleys. The challenge here is dual: navigation competence AND managing carry-over fatigue from your hardest race block. Treat this as a long training effort with a race number — go in ready to walk, navigate carefully, and finish strong.',
    phases: [
      {
        name: 'Recovery + Nav', weeks: '3 weeks post-5 Valleys',
        focus: 'Active recovery with navigation practice. No hard sessions.',
        sessions: [
          'Nav practice outing: 3–4 hours in unfamiliar moorland — Bowland or the Dales. Map only, no GPS.',
          'Easy running only: 10–12 miles max — legs are carrying 5 Valleys fatigue, respect that',
          'Pre-mark key route waypoints on your watch before race day',
          'Kit check: compass, 1:25k map, battery pack for GPS, headtorch for Oct darkness',
          'Study the route profile twice — know where you can push and where to be careful',
        ],
      },
    ],
    raceStrategy: '<strong>Navigation is the race.</strong> A wrong turn costs more time than any fitness deficit. Keep map in hand on open moorland. At every junction: stop, check, move. <strong>Pace:</strong> 5 Valleys is 3 weeks ago — your legs remember. Start conservatively and reassess at halfway. <strong>October evenings:</strong> Sunset is around 6:30pm — carry headtorch even if you think you won\'t need it.',
    keyRisk: 'Navigation errors in open moorland combined with residual fatigue from 5 Valleys. Know when to slow down and check rather than committing to a wrong line.',
    kitList: ['1:25k map + compass (mandatory)', 'GPS watch + spare battery', 'Headtorch (Oct sunset)', 'Waterproofs', '1.5L hydration', 'Emergency kit', 'Warm mid-layer'],
    intel: {
      targetFinish: { optimistic: '6:30', realistic: '7:45', conservative: '9:00' },
      aidStations: [
        { name: 'CP1 — Arncliffe', mile: 15.5, notes: 'The only official checkpoint. Mandatory kit check likely. Eat something substantial — there\'s nothing else provided until the finish. Refill water from the beck or carry enough to last the back half.' },
      ],
      pacingSections: [
        { section: 'Miles 0–7', label: 'Grassington → Kilnsey', effort: 'Zone 2', targetTime: '1:25–1:40', cue: 'Valley floor to start, some climb. Easy running. The nav demands increase later — stay fresh and keep your head in the map.' },
        { section: 'Miles 7–15.5', label: 'Kilnsey → Arncliffe CP', effort: 'Zone 2', targetTime: '1:50–2:10', cue: 'Limestone escarpments and open moorland. Technical underfoot. This section will feel harder than the pace suggests — 5 Valleys is still in your legs.' },
        { section: 'Miles 15.5–22', label: 'Arncliffe → Malham Tarn', effort: 'Managed effort', targetTime: '1:35–1:55', cue: 'Steady climb out of Arncliffe. The Tarn is exposed — wind is common. Walk the sustained climbs, run the flats honestly. Nav focus: fence lines are your friend on open moorland.' },
        { section: 'Miles 22–31', label: 'Malham → Grassington finish', effort: 'Whatever you have left', targetTime: '1:30–2:00', cue: 'Descent back into the Dales via the Dales Way corridor. Legs will be heavy from 5 Valleys fatigue — don\'t be surprised, be prepared. Count gate to gate. Keep eating.' },
      ],
      fuelPlan: [
        { milestone: 'Breakfast', timing: 'T−3h', what: 'Porridge, banana, coffee', cals: 500, note: 'Same as every race. Nothing new.' },
        { milestone: 'Pre-start', timing: 'T−20min', what: 'Half bar or gel', cals: 100, note: 'Small top-up. Self-nav demands sharp thinking — don\'t start even slightly depleted.' },
        { milestone: 'Mile 5', timing: '~1:00 in', what: 'Gel #1', cals: 100, note: 'Start the fuel clock early. October air is cold — appetite often drops in the chill.' },
        { milestone: 'Mile 10', timing: '~2:05 in', what: 'Gel #2 + real food', cals: 200, note: 'Carry a wrap or real food item from home. No aid station until mile 15.5.' },
        { milestone: 'CP1 (15.5)', timing: '~3:20 in', what: 'Biggest feed of the race', cals: 350, note: 'This is your only checkpoint. Eat a proper meal — not just gels. Load 3 more gels for the back half. Refill water.' },
        { milestone: 'Mile 19', timing: '~4:10 in', what: 'Gel #4', cals: 100, note: 'Between checkpoint and Malham. Non-negotiable — the climb out of Arncliffe will be depleting.' },
        { milestone: 'Mile 23', timing: '~5:00 in', what: 'Gel #5 + bar', cals: 200, note: 'Post-Malham Tarn. Brain fog can set in on self-nav races — eating keeps the nav sharp.' },
        { milestone: 'Mile 27', timing: '~5:50 in', what: 'Final gel', cals: 100, note: 'Last fuel. You\'re 4 miles from Grassington. Empty the tank.' },
      ],
    },
  },
  {
    id: 'spine', name: 'Spine Sprint South', shortName: 'Spine Sprint',
    date: '2027-01-09', distanceMi: 46, elevationFt: 6616,
    type: 'Non-Stop Winter Ultra', location: 'Pennine Way: Edale → Hebden Bridge',
    color: '#3498db', difficulty: 5,
    description: 'The biggest step up in your calendar. Non-stop, self-sufficient, winter conditions on the Pennine Way from Edale to Hebden Bridge. 46 miles, 6,616ft of grim Pennine climbing, an 18-hour cutoff, and a noon start meaning you will run through the night. This is as much a skills challenge as a fitness one — and by January you will be ready for it.',
    phases: [
      {
        name: 'Build + Night', weeks: 'Oct–Nov (8 weeks)',
        focus: 'Volume, night running confidence, and winter conditions exposure.',
        sessions: [
          'Night runs starting in October: 2–3 hours in the dark with headtorch — get comfortable before it\'s cold',
          'Winter hill days: full days on Pennine Way sections in whatever weather arrives',
          'Back-to-back long efforts: Friday evening run + early Saturday long run',
          'One "camping out" nav exercise — simulate the cold and fatigue combo',
          'S&C: single-leg focus and upper body for pole efficiency in bogs',
        ],
      },
      {
        name: 'Kit + Recce', weeks: 'Dec (4 weeks)',
        focus: 'Dial in kit, recce the opening miles, mental rehearsal.',
        sessions: [
          'Recce the first 15 miles of route in daylight — walk every key section',
          'Kit shake-out: carry full race pack on a 20-mile effort — identify what chafes, what\'s heavy',
          'Sleep deprivation sim: stay up to 3am once, then run 10 miles in the morning',
          'Emergency procedures cold-read: know your checkpoints, cut-offs, and bail routes',
        ],
      },
    ],
    raceStrategy: '<strong>The Spine is managed, not raced.</strong> Move efficiently, eat constantly, stay warm. No official aid stations — you rely on yourself and opportunistic pubs/cafes en route. <strong>Night sections:</strong> You\'ll hit the bogs of Bleaklow and Black Hill in the dark (roughly hours 3–7). Reduce pace, trust the path, don\'t short-cut bog. <strong>Noon start:</strong> You have roughly 4–5 hours of daylight — use it to bank miles on Kinder Scout before night falls. <strong>Stoodley Pike (mi40):</strong> If you reach it, the finish is yours.',
    keyRisk: 'Hypothermia from stopping too long in cold conditions. Wet cotton is an emergency. Keep moving or get dry and warm immediately.',
    kitList: ['Heavyweight waterproof (not a race jacket)', 'Insulated mid-layer', 'Winter gloves + spare pair', 'Micro-spikes', '1:25k Pennine Way maps', 'Headtorch + 2× spare batteries', 'Bivvy bag + emergency mat', 'Stove + freeze-dried food', 'Min 3,500 kcal on person', 'Gaiters', 'Dry bag for sleeping kit'],
    intel: {
      targetFinish: { optimistic: '14:00', realistic: '16:00', conservative: '17:30' },
      aidStations: [
        { name: 'Kinder Scout plateau', mile: 6, notes: 'No aid — key nav landmark. The plateau is featureless in cloud/dark. Use compass bearing, not GPS alone. In daylight you\'ll be here ~1:30 in. Banks of fog are common Jan.' },
        { name: 'Bleaklow Head', mile: 14, notes: 'No aid. Highest and boggiest point of the course. Night by now if you started noon. Micro-spikes if frozen. Don\'t try to run — move efficiently and protect your ankles.' },
        { name: 'Black Hill (Soldier\'s Lump)', mile: 20, notes: 'No aid. Classic Pennine grind. The boardwalk here is icy in January — short steps. You are in the hardest section now. Count to Standedge, not to the finish.' },
        { name: 'Standedge Cutting (A62)', mile: 26, notes: 'Road crossing — The Carriage House pub/café is nearby if open. Warm up, hot drink, foot check. This is your halfway morale reset. Don\'t linger more than 20 minutes.' },
        { name: 'Blackstone Edge', mile: 33, notes: 'No aid. Dramatic gritstone edge — wind will be fierce here. Lower your head and move. The Roman Road descent is runnable if not iced. 13 miles to Hebden.' },
        { name: 'Stoodley Pike monument', mile: 40, notes: 'No aid but enormous psychological marker. If you\'re here, you finish. 6 miles of descending trail to Hebden Bridge — this is where you can finally let go.' },
      ],
      pacingSections: [
        { section: 'Miles 0–6', label: 'Edale → Kinder Scout', effort: 'Zone 2', targetTime: '1:30–1:45', cue: 'Noon start. Daylight. Bank these miles at a controlled pace. The ascent of Grindsbrook Clough is steep — walk it. You have 46 miles to go.' },
        { section: 'Miles 6–14', label: 'Kinder → Bleaklow', effort: 'Zone 2', targetTime: '2:00–2:20', cue: 'Technical bog navigation. Dark by mile 10 in January. No shortcuts. Follow the path even when it looks slower — the bog will eat you otherwise.' },
        { section: 'Miles 14–26', label: 'Bleaklow → Standedge', effort: 'Zone 2', targetTime: '2:30–3:00', cue: 'Through the night section. Black Hill is soul-destroying in bad weather — it\'s meant to be. Eat every 30 min. Talk to yourself. Keep the poles moving.' },
        { section: 'Miles 26–33', label: 'Standedge → Blackstone Edge', effort: 'Managed effort', targetTime: '1:40–2:00', cue: 'Post-Standedge boost — you\'re on the home stretch in spirit if not in miles. The A672 moors are more runnable. Take advantage.' },
        { section: 'Miles 33–40', label: 'Blackstone Edge → Stoodley Pike', effort: 'Strong effort', targetTime: '1:45–2:10', cue: 'Reservoir section then the long climb to Stoodley. Wind tunnel territory. Dig in. When the Pike appears, you\'ve done it.' },
        { section: 'Miles 40–46', label: 'Stoodley Pike → Hebden Bridge', effort: 'Everything left', targetTime: '1:10–1:30', cue: 'Descend into Hebden. Trail becomes path becomes town. Every step is a victory lap. Run what you can, walk if you must, but keep moving.' },
      ],
      fuelPlan: [
        { milestone: 'Breakfast', timing: 'Morning of race', what: 'Big cooked breakfast', cals: 700, note: 'Noon start means you have time. Full cooked breakfast. Extra toast. This is your last hot meal before the night.' },
        { milestone: 'Pre-start', timing: 'T−30min', what: 'Gel + coffee', cals: 150, note: 'Top up glycogen. Last caffeine before the race starts.' },
        { milestone: 'Hour 1 (mi~5)', timing: '~1h in', what: 'Gel #1 + real food', cals: 200, note: 'Eat before you\'re hungry. Cold air suppresses appetite — ignore it.' },
        { milestone: 'Hour 3 (mi~14)', timing: '~3h in', what: 'Hot food from stove or bar', cals: 400, note: 'Bleaklow section. Cold, dark, boggy. A hot meal from your stove here is transformative — mentally and physically. Instant noodles, porridge, or similar.' },
        { milestone: 'Hour 5 (mi~22)', timing: '~5h in', what: 'Gels × 2', cals: 200, note: 'Deep night. Stomach can be reluctant. Gels are easiest to stomach. Keep the calories coming.' },
        { milestone: 'Standedge stop (mi26)', timing: '~6–7h in', what: 'Pub/café food if open', cals: 500, note: 'Hot drink, soup, whatever\'s available. Aim for 20 min maximum — you will stiffen up fast in the cold if you stop longer.' },
        { milestone: 'Hour 9 (mi~32)', timing: '~9h in', what: 'Freeze-dried meal or real food', cals: 400, note: 'Second big food stop. Cook something if you can find shelter. This is the fuel that gets you to Stoodley Pike.' },
        { milestone: 'Hour 11 (mi~38)', timing: '~11h in', what: 'Final gels × 3', cals: 300, note: '8 miles left. Empty the food bag. Everything you carry to the finish is dead weight.' },
      ],
    },
  },
  {
    id: 'lap', name: 'The Lap', shortName: 'The Lap',
    date: '2027-05-08', distanceMi: 47, elevationFt: 8530,
    type: 'Mountain Ultra', location: 'Lake Windermere Circuit',
    color: '#a78bfa', difficulty: 5,
    description: 'Your season finale — a complete circumnavigation of Lake Windermere through the Lakeland fells. Beautiful, exposed, and everything a mountain ultra should be. By May 2027 you will have Tittesworth, 5 Valleys, UTYD, and the Spine in your legs. This is your graduation race.',
    phases: [
      {
        name: 'Recovery', weeks: 'Jan–Feb (post-Spine)',
        focus: 'Recover fully. Patience now is training for May.',
        sessions: [
          'Weeks 1–2: no running at all. Walks, yoga, swimming only.',
          'Weeks 3–4: short easy runs 5–8 miles — how do you feel? Let the answer guide you.',
          'Weeks 5–8: rebuild to 35–40 miles/week with low intensity',
          'S&C back in at week 3 — maintain the body you\'ve built',
        ],
      },
      {
        name: 'Build', weeks: 'Mar–Apr (8 weeks)',
        focus: 'Lakeland-specific prep. Volume, vert, and enjoyment.',
        sessions: [
          'Monthly Lake District day: 20+ miles, 5,000ft+ vert — High Street, Helvellyn, or Scafell range',
          'Weekly long run building from 16 to 22 miles',
          'Fell race circuit: 2–3 local fell races for speed sharpening',
          'S&C twice weekly — sport-specific loading through full ROM',
          'Long runs with elevation profile matching The Lap course',
        ],
      },
    ],
    raceStrategy: '<strong>Soak it in.</strong> You have earned this start line. Run with curiosity, not just effort. <strong>The High Street ridge (miles 15–25):</strong> Exposed and spectacular — manage weather with layers. <strong>Troutbeck bag drop (~mile 24):</strong> Change socks, fresh shoes if needed, hot food, mental reset. <strong>Finish:</strong> The lakeside final miles are runnable and beautiful — let them be.',
    keyRisk: 'Overconfidence from a full year of racing. Respect the distance and the May Lake District weather.',
    kitList: ['Lake District fell shoes', 'Poles', 'Full layering system (May = anything)', '2L hydration', 'Compulsory kit to spec', 'Crew bag for halfway', 'Spare shoes + socks'],
    intel: {
      targetFinish: { optimistic: '12:00', realistic: '14:00', conservative: '18:00' },
      aidStations: [
        { name: 'FS1 — Ambleside area', mile: 8, notes: 'Early and well-stocked. Grab a snack and keep moving — you\'re only 8 miles in. Don\'t linger. Top up fluids.' },
        { name: 'FS2 — Troutbeck area', mile: 14, notes: 'Southern fells section. Refuel before the High Street climb. This is your last stop before the exposed ridge.' },
        { name: 'FS3 — Troutbeck bag drop (HALFWAY)', mile: 24, notes: 'This is the big one. Race HQ is Low Cunsey Farm — your halfway drop bag is here at Troutbeck. Change socks, change shoes, eat a real meal. Spend 15–20 minutes here and leave feeling reset. The second half is yours.' },
        { name: 'FS4 — Hawkshead area', mile: 31, notes: 'Post-High Street descent. You\'re into familiar western Lakeland now. Eat a gel before you arrive so you\'re not hitting an aid station desperate — stay ahead of hunger.' },
        { name: 'FS5 — Grizedale area', mile: 38, notes: 'The forest miles. Beautiful and runnable but can feel relentless. Refuel and mentally divide the remaining 9 miles into three 3-mile chunks.' },
        { name: 'FS6 — Low Cunsey Farm approach', mile: 44, notes: 'Final aid station. 3 miles to go. Take what you need and run — you are finishing The Lap today. The lakeside path is flat and you will run every step of it.' },
      ],
      pacingSections: [
        { section: 'Miles 0–8', label: 'Start → FS1', effort: 'Zone 2', targetTime: '2:00–2:20', cue: 'Low Cunsey Farm start. Controlled. This is a 47-mile day — nothing you do in the first 8 miles matters unless you go too fast. Let the May morning carry you.' },
        { section: 'Miles 8–14', label: 'FS1 → FS2', effort: 'Zone 2', targetTime: '1:30–1:45', cue: 'Eastern shore trail. Varied terrain. Settle into your rhythm — legs should feel good here. Resist the urge to push.' },
        { section: 'Miles 14–24', label: 'FS2 → Troutbeck halfway', effort: 'Zone 2', targetTime: '2:30–3:00', cue: 'The High Street ridge traverse. Most exposed section of the race. Spectacular views — enjoy them. Walk sustained climbs, run ridgeline sections. Wind is the enemy here in May.' },
        { section: 'Miles 24–31', label: 'Halfway → FS4', effort: 'Managed effort', targetTime: '1:45–2:05', cue: 'Post-bag-drop reset. Legs are 24 miles in. Your head is fresh, your body less so. Be honest about the gap between the two. Run what you can, walk the climbs.' },
        { section: 'Miles 31–38', label: 'FS4 → FS5 (Grizedale)', effort: 'Strong effort', targetTime: '1:45–2:05', cue: 'Forest miles. Softer underfoot — kinder on legs at this stage of the race. Grizedale Forest is atmospheric and cushioned. Use it. This is where The Lap\'s feel changes.' },
        { section: 'Miles 38–47', label: 'FS5 → Finish', effort: 'Everything left', targetTime: '2:00–2:30', cue: 'Final push. Low Cunsey Farm is circling back into view. The lakeside path to the finish is flat — run every step. You have done Tittesworth, 5 Valleys, UTYD, the Spine, and now this. Let that land.' },
      ],
      fuelPlan: [
        { milestone: 'Breakfast', timing: 'T−3h', what: 'Porridge, banana, coffee, toast', cals: 650, note: 'You have been here before. Same routine. Familiar food. Race morning is not the time for experiments.' },
        { milestone: 'Pre-start', timing: 'T−20min', what: 'Gel + water', cals: 100, note: 'Just a top-up. You ate well at breakfast. Don\'t over-eat before a long day.' },
        { milestone: 'Mile 5', timing: '~1:10 in', what: 'Gel #1', cals: 100, note: 'Start the fuel clock early. May Lake District is milder than winter — but 47 miles is 47 miles.' },
        { milestone: 'FS1 (mi8)', timing: '~2:00 in', what: 'Real food + gel pocket', cals: 250, note: 'First aid station. Eat a banana or potato. Load a gel. Keep it quick.' },
        { milestone: 'Mile 12', timing: '~2:50 in', what: 'Gel #3', cals: 100, note: 'Before the High Street climb. Fuel the ascent, not during it.' },
        { milestone: 'FS2 (mi14)', timing: '~3:20 in', what: 'Carbs + electrolytes', cals: 200, note: 'Last stop before the ridge. Top up water. Eat something starchy.' },
        { milestone: 'Mile 19 (ridge)', timing: '~4:30 in', what: 'Gel #5 + bar', cals: 200, note: 'High Street ridge. Wind may be cold — eating is harder. Small bites, wash down with water.' },
        { milestone: 'Halfway bag drop (mi24)', timing: '~6:00 in', what: 'Full meal from drop bag', cals: 500, note: 'Your biggest feed. Real food from your own bag — pack something you love. Wrap, rice balls, peanut butter sandwich. This meal carries you to the finish.' },
        { milestone: 'Mile 28', timing: '~7:00 in', what: 'Gel #7', cals: 100, note: 'Post-halfway — stomach can feel settled after real food. Keep the gels ticking over.' },
        { milestone: 'FS4 (mi31)', timing: '~7:45 in', what: 'Soup or hot drink if available', cals: 200, note: 'Real food if offered. Soup is ideal at this stage. Something warm resets the mood.' },
        { milestone: 'Mile 35', timing: '~8:45 in', what: 'Gel #9 + real food', cals: 200, note: 'Forest miles. Keep the fuel clock going. 12 miles left — don\'t underfuel the finish.' },
        { milestone: 'FS5 (mi38)', timing: '~9:30 in', what: 'Final real food', cals: 250, note: '9 miles to go. Eat something substantial. This is your last pit stop before Low Cunsey Farm.' },
        { milestone: 'Mile 43', timing: '~10:30 in', what: 'Final gel × 2', cals: 200, note: 'Empty the vest. You\'re 4 miles from the finish line of your biggest year. Leave nothing in the bag.' },
      ],
    },
  },
  {
    id: 'summer-spine-north', name: 'Summer Spine Sprint North', shortName: 'Spine North',
    date: '2027-06-15', distanceMi: 43, elevationFt: 5771,
    type: 'Non-Stop Summer Ultra', location: 'Pennine Way: Bellingham → Kirk Yetholm',
    color: '#f59e0b', difficulty: 5,
    description: 'The northern chapter of the Pennine Way in summer. 43 miles from Brown Rigg/Bellingham to the border village of Kirk Yetholm, with 5,771ft of Cheviot Hills terrain and an 18-hour cutoff. Noon start. Unlike the winter Spine, you get long summer daylight — but the Cheviots in June can still throw fog, wind, and bogs at you. This is your capstone event: everything the Spine taught you, applied to wilder, more remote terrain.',
    phases: [
      {
        name: 'Spring Build', weeks: 'Mar–May (post-Lap recovery)',
        focus: 'Recover from The Lap, then rebuild volume for a summer peak.',
        sessions: [
          'Weeks 1–3 post-Lap: rest and easy walking. The Lap is a big race — honour the recovery.',
          'May: rebuild long runs 14–18 miles. One Cheviot Hills recce if possible.',
          'Night running: June sunsets are late but do one overnight effort to keep the skill sharp',
          'Navigation: the Cheviots are remote and the path less obvious than southern Pennine Way — map work matters',
          'S&C: maintain through spring — don\'t let it drop post-Lap',
        ],
      },
    ],
    raceStrategy: '<strong>Noon start, long daylight.</strong> You\'ll have 19+ hours of June daylight — use them. Unlike Spine South, you can nav in light for most of the race if you push well. <strong>The Cheviots (miles 25–43):</strong> Remote, boggy, beautiful. The final 20 miles are on the Cheviot range and the border ridge — no bail routes, no pubs, no shortcuts. Commit to the route. <strong>Kirk Yetholm is waiting:</strong> This is the finish line of the full Pennine Way. Cross it.',
    keyRisk: 'The remote Cheviot section has no easy escape. If weather closes in, you must have the navigation and kit to manage it. Overconfidence after a successful season is the real risk — the Cheviots don\'t care about your CV.',
    kitList: ['Fell shoes (bog-ready)', 'Poles', 'Lightweight waterproof', 'Warm mid-layer (Cheviots can be cold)', '1:25k Pennine Way North maps', 'Headtorch (belt and braces — still needed)', '2L hydration (remote sections)', 'Min 3,000 kcal on person', 'Emergency bivvy', 'Gaiters'],
    intel: {
      targetFinish: { optimistic: '13:00', realistic: '15:00', conservative: '17:00' },
      aidStations: [
        { name: 'Bellingham (start area)', mile: 0, notes: 'Noon start from Brown Rigg/Bellingham. Full kit check. Eat a big lunch 2h before start — this is your last guaranteed hot meal. Load up.' },
        { name: 'Byrness Village', mile: 15, notes: 'Last village before the final Cheviot wilderness section. No official aid — but The Byrness Inn or B&Bs here may provide food for runners. This is your resupply point if needed. Do not leave Byrness without full water and food.' },
        { name: 'Cheviot summit area', mile: 30, notes: 'No aid. Most remote point of the race. The trig point is a psychological landmark — you are 13 miles from Kirk Yetholm. Wind is almost always present here. Keep moving, stay warm, count the fences.' },
        { name: 'The Border fence', mile: 37, notes: 'No aid. The Pennine Way follows the England/Scotland border fence across the ridge. Navigation becomes clearer. You are 6 miles from Kirk Yetholm. This is where summer runners start to see the finish.' },
      ],
      pacingSections: [
        { section: 'Miles 0–15', label: 'Bellingham → Byrness', effort: 'Zone 2', targetTime: '3:00–3:30', cue: 'Noon start in June sun. Cool valley running through Redesdale Forest. Very runnable opening miles — hold back. You are banking patience here.' },
        { section: 'Miles 15–25', label: 'Byrness → Cheviot foothills', effort: 'Zone 2', targetTime: '2:30–3:00', cue: 'The ascent into the Cheviots begins. Grassy, boggy, relentless. Walk the long climbs. This section is deceptive — it looks easier than Kinder Scout but the terrain is softer and the footing less certain.' },
        { section: 'Miles 25–37', label: 'Cheviot Hills traverse', effort: 'Managed effort', targetTime: '3:00–3:30', cue: 'The heart of the race. Ridge running on the Cheviot Hills, following the border fence. Some boardwalk, some bog. Wind will be your companion. Eat every 30 min. Keep the navigation sharp — the path splits in places.' },
        { section: 'Miles 37–43', label: 'Border Ridge → Kirk Yetholm', effort: 'Everything left', targetTime: '1:15–1:30', cue: 'The descent into Scotland. The village is below you. The Border Hotel at the finish has been welcoming Pennine Way runners for decades. You are nearly there. Run what you can, soak in every step.' },
      ],
      fuelPlan: [
        { milestone: 'Pre-race lunch', timing: 'T−2h (10am)', what: 'Big cooked lunch', cals: 700, note: 'Noon start means you eat lunch before you race. Pasta, rice, whatever sticks. This meal sets up the first 3 hours.' },
        { milestone: 'Pre-start', timing: 'T−20min', what: 'Gel + coffee', cals: 150, note: 'Final top-up. Last caffeine before the Cheviots.' },
        { milestone: 'Hour 2 (mi~8)', timing: '~2h in', what: 'Gel #1 + bar', cals: 200, note: 'Redesdale Forest section. Easy running, easy eating. Start the fuel clock.' },
        { milestone: 'Byrness (mi15)', timing: '~3:15 in', what: 'Real food — biggest stop', cals: 500, note: 'Last village. Eat a full meal here if anything is available. Carry 3,000+ kcal from this point — there is nothing else until Kirk Yetholm.' },
        { milestone: 'Hour 5 (mi~22)', timing: '~5h in', what: 'Hot meal from stove', cals: 400, note: 'Cheviot foothills. Cook something if conditions allow. Instant noodles, freeze-dried, porridge — whatever you packed. A hot meal in the hills is morale and fuel combined.' },
        { milestone: 'Hour 7 (mi~30)', timing: '~7h in', what: 'Gel × 2 + bar', cals: 300, note: 'Cheviot summit section. Appetite often drops at altitude and in wind. Force calories. You have 13 miles left.' },
        { milestone: 'Hour 9 (mi~37)', timing: '~9h in', what: 'Final gels × 3', cals: 300, note: 'Border fence section. 6 miles to go. Empty the vest. Everything you\'re carrying becomes dead weight the moment you finish.' },
      ],
    },
  },
]

// Community race recommendations — sourced from Women's Spine Support Group,
// "Training races we love" WhatsApp chat. Real talk, not generic lists.
const COMMUNITY_RECS = [
  {
    id: 'shropshire-way',
    name: 'Shropshire Way 80k',
    distance: '80k (50mi)',
    elevation: '8,000ft+',
    location: 'Shropshire',
    timing: 'April',
    spineValue: 5,
    tags: ['Nav challenge', 'Spine prep', 'Walkers welcome', '24h cutoff'],
    hiveSays: "Multiple women in the group call this their favourite Spine prep race. 'Tricky nav in places — great head game practice.' Open to walkers and runners, 24h cutoff, lots of checkpoints with real food. Maxine: 'It'd actually be a great first big ultra.'",
    recommenders: 2,
  },
  {
    id: 'pilgrims-ultra',
    name: "Pilgrim's Ultra",
    distance: '50k / 100k / 100mi',
    elevation: 'Rolling',
    location: 'Scotland (Edinburgh to Glamis / Bamburgh)',
    timing: 'September',
    spineValue: 4,
    tags: ['Women-friendly', 'Well-stocked', 'Multiple distances', 'Scenic'],
    hiveSays: "Strong community consensus. 'Ladies only toilets with products we all need, pit stops well stocked almost every 10 miles.' Lisa: 'Mince and tatties at the 100km checkpoint was the food of the gods.' Multiple runners plan to return. Generous 32h cutoff.",
    recommenders: 4,
  },
  {
    id: 'stanza-stones',
    name: 'Stanza Stones (Cragrunner)',
    distance: '~30mi',
    elevation: 'Yorkshire Moors',
    location: 'Yorkshire',
    timing: 'Summer / Winter editions',
    spineValue: 5,
    tags: ['Spine terrain', 'Kit check', 'Brilliant food', 'Small field'],
    hiveSays: "Claire: 'Amazing race, Cragrunner are utterly brilliant and will totally look after you. Their food stations are fab.' Kirsty: 'Having recce'd most of Spine Sprint and run Stanza, there is very little difference between them.' Rated as the closest Spine simulation available.",
    recommenders: 5,
  },
  {
    id: 'peak-district-sn',
    name: 'Peak District South/North',
    distance: 'Day 1 + Day 2 option',
    elevation: 'Peak District',
    location: 'Peak District',
    timing: 'Late November',
    spineValue: 5,
    tags: ['Two-day option', 'Low key', 'Spine runners', 'Great route'],
    hiveSays: "Aleks: 'Very low key but well organised.' Kirsty: 'I second this — it's such a good event and there's always lots of Spine racers there.' Great for kit testing in winter conditions and meeting your future race community.",
    recommenders: 3,
  },
  {
    id: 'rat-race-100',
    name: 'Rat Race 100',
    distance: '100mi',
    elevation: 'Varied',
    location: 'Various UK',
    timing: 'July / Various',
    spineValue: 3,
    tags: ['Generous cutoffs', '43% women', 'Great support', 'Well organised'],
    hiveSays: "CJP: 'Did it last year and it was a great experience, despite the weather! Definitely recommend them.' Good choice for runners who want big distance with a supportive race culture. 43% women starters. 48h cutoff option available.",
    recommenders: 3,
  },
  {
    id: 'fellsman',
    name: 'The Fellsman',
    distance: '60mi',
    elevation: 'Yorkshire Dales',
    location: 'Yorkshire Dales',
    timing: 'April',
    spineValue: 4,
    tags: ['Night movement', '25 checkpoints', 'Old school', 'Boggy'],
    hiveSays: "Jo: 'Old school scouts. Tent in a field with tea and biscuits at checkpoints.' Not glamorous but excellent nav and terrain practice. Sue: 'Boggy. Great route though.' The 25 checkpoints teach you checkpoint management under pressure.",
    recommenders: 2,
  },
  {
    id: 'pilgrims-challenge',
    name: "Pilgrim's Challenge (SDW)",
    distance: '66mi over 2 days',
    elevation: 'South Downs',
    location: 'South Downs',
    timing: 'February',
    spineValue: 3,
    tags: ['Two-day', 'Good intro', 'Winter conditions'],
    hiveSays: "Community recommend for building back-to-back experience. Good for testing overnight fatigue management without full commitment of a 100 miler. South Downs terrain is very different to Spine but useful race experience.",
    recommenders: 2,
  },
  {
    id: 'punk-panther',
    name: 'Punk Panther Events',
    distance: '50k / 50mi / 100k',
    elevation: 'West Yorkshire',
    location: 'West Yorkshire',
    timing: 'Throughout year',
    spineValue: 4,
    tags: ['Local', 'Multiple options', 'Accessible', 'Good organisation'],
    hiveSays: "Kirsty: 'Recommend looking at Punk Panther, Ranger Ultras, Due North UTYD — all great races!' Multiple community members use these as training races. West Yorkshire base means Pennine terrain and similar conditions to Spine country.",
    recommenders: 3,
  },
]

const STRENGTH_SESSIONS = [
  {
    id: 'A', name: 'Session A — Posterior Chain',
    tag: 'Tue / Thu', tagColor: 'orange',
    goal: 'Build the engine: glutes, hamstrings, calves. These are your climbing muscles.',
    exercises: [
      { name: 'Romanian Deadlift', sets: '4×8', why: 'Loads the posterior chain through full range. Directly mimics the hip hinge of uphill running. If you do one exercise, make it this.' },
      { name: 'Hip Thrust (barbell or banded)', sets: '3×12', why: 'Glute max activation at end-range extension — exactly what\'s needed for steep climbs. Keep ribs down, don\'t hyperextend.' },
      { name: 'Nordic Hamstring Curl', sets: '3×6 (eccentric focus)', why: 'Bulletproofs the hamstrings against the eccentric load of descents. Go slowly — this is about control, not reps.' },
      { name: 'Standing Calf Raise (single leg)', sets: '3×15 each', why: 'Your calves absorb every footfall on trail. Single-leg exposes any bilateral compensation early.' },
      { name: 'Glute Med Band Walk', sets: '3×20 steps each', why: 'Lateral hip stability — keeps knees tracking over toes on technical terrain.' },
    ],
  },
  {
    id: 'B', name: 'Session B — Single Leg + Stability',
    tag: 'Sat (post-run)', tagColor: 'blue',
    goal: 'Build the stabilisers: single-leg strength, ankle proprioception, knee tracking.',
    exercises: [
      { name: 'Bulgarian Split Squat', sets: '4×8 each', why: 'The king of single-leg training for trail runners. Develops the quad strength needed to run downhills without braking. Start with bodyweight, then add load.' },
      { name: 'Step-Up (weighted)', sets: '3×10 each', why: 'Mimics the step-up motion of scrambling. Develop hip drive, not momentum — step up slowly and with control.' },
      { name: 'Single Leg RDL', sets: '3×8 each', why: 'Hip stability and balance on one leg. Directly transfers to navigating uneven trail surfaces at speed.' },
      { name: 'Lateral Lunge', sets: '3×10 each', why: 'Prepares the adductors and hip abductors for cambered terrain and traversing hillsides.' },
      { name: 'Farmer\'s Carry (single arm)', sets: '3×40m each', why: 'Trains core anti-lateral flexion — the stability you need when running with poles or a heavy race pack.' },
    ],
  },
  {
    id: 'C', name: 'Session C — Core + Upper',
    tag: 'Optional (Mon or Wed)', tagColor: 'green',
    goal: 'Build the frame: core stability, upper body endurance for poles, injury resilience.',
    exercises: [
      { name: 'Dead Bug', sets: '3×8 each side', why: 'True core stability — anti-extension under load. Essential for maintaining form in the final miles of an ultra when fatigue sets in.' },
      { name: 'Copenhagen Plank', sets: '3×20 sec each', why: 'The most under-rated hip adductor exercise. Significant injury prevention for trail runners with lateral load demands.' },
      { name: 'Pallof Press', sets: '3×10 each side', why: 'Anti-rotation core strength — the transfer to trail running is direct: resisting rotation on cambered paths.' },
      { name: 'Prone Y-T-W', sets: '3×10 each', why: 'Scapular health and rear delt strength — essential if you\'re using poles for 8+ hours. Neglect this and your shoulders will remind you.' },
      { name: 'Pull-Up or TRX Row', sets: '3×8–10', why: 'Upper back pulling strength for pole efficiency. You want to be able to pull yourself up climbs with your poles, not just lean on them.' },
    ],
  },
]

const MENTAL_CONTENT = {
  preRaceNight: [
    { title: 'Lay everything out the night before', desc: 'Kit, food, poles, tracker — everything. Decision fatigue on race morning is real. Eliminate it.' },
    { title: 'Eat a proper dinner, not a feast', desc: 'Pasta is fine. So is rice, potatoes, anything familiar. Don\'t try anything new. Stay hydrated but don\'t force fluids.' },
    { title: 'Write down your three intentions', desc: 'Not goals — intentions. How you want to feel, how you want to run. "Start patient. Walk the climbs. Eat every 30 minutes." Stick it in your race pack.' },
    { title: 'Sleep badly and accept it', desc: 'Almost every ultra runner sleeps poorly the night before a big race. Your body doesn\'t care — adrenaline will carry you through the start. A bad night\'s sleep has minimal impact on a well-trained body.' },
  ],
  raceMorning: [
    { title: 'Wake with enough time to eat properly', desc: '2–3 hours before start. Porridge, toast, rice — something you\'ve trained with. Coffee if that\'s your normal routine.' },
    { title: 'Arrive early, move slowly', desc: 'Rushing at the start line burns cortisol you\'ll want later. Arrive with 45+ minutes to spare. Walk around, get warm.' },
    { title: 'Find your breathing', desc: 'Before the start, find 5 minutes alone. Slow breathing: 4 counts in, 6 counts out. Activate the parasympathetic. You\'ve trained for this.' },
  ],
  darkPatches: [
    { title: 'The Third Quarter Rule', desc: 'In any ultra, miles 60–80% are the hardest. Not physically — psychologically. The novelty has worn off and the finish is still far away. Name it. "This is the third quarter. It\'s supposed to feel like this. Keep moving."' },
    { title: 'Chunk it down', desc: 'Never think about the finish line from mile 15. Think about the next aid station. The next hill. The next mile marker. Long races are won in small segments.' },
    { title: 'Change something physical', desc: 'When the mind goes dark, change something you can control. Eat something. Add a layer. Swap poles to the other hand. The physical change creates a psychological reset.' },
    { title: 'The 10 minute rule', desc: 'Feeling terrible? Tell yourself you\'ll reassess in 10 minutes. Almost without exception, you will feel different in 10 minutes. The body is not static — feelings pass.' },
  ],
  mantras: [
    { text: '"Keep moving forward."', context: 'Use at miles 20–30 when everything feels hard' },
    { text: '"This is the work."', context: 'When you\'re suffering exactly as much as you trained to suffer' },
    { text: '"Strong legs, soft effort."', context: 'Technical descents when tension creeps in — relax the quads' },
    { text: '"Walk fast, eat something."', context: 'When forward progress stalls and you need to reset' },
    { text: '"I\'ve done harder things."', context: 'Spine Sprint: at 3am, in the wind, on the Pennine Way' },
    { text: '"One more valley."', context: '5 Valleys specific — each valley is its own small race' },
  ],
}

const FUEL_GUIDE = {
  training: [
    { time: 'Short runs < 60 min', title: 'Water only', detail: 'No need for fuel on anything under an hour at easy effort. Just stay well hydrated going in.' },
    { time: '60–90 min', title: 'Water + electrolytes', detail: 'Add a salt tab or electrolyte drink. If the effort is moderate-hard, consider 1–2 gels in the back half.' },
    { time: '90 min – 2.5 hours', title: '45–60g carbs/hour', detail: 'Start fuelling at 45 minutes, then every 25–30 minutes. Mix gels with real food (dates, banana, rice cakes). Practice this until it\'s automatic.' },
    { time: '2.5+ hours', title: '60–90g carbs/hour + sodium', detail: 'This is race-day territory. You need to eat real food. 300–400mg sodium/hour in warm weather. Practice eating on steep climbs — it\'s a skill.' },
    { time: 'Back-to-back days', title: 'Prioritise recovery nutrition', detail: 'Within 30 minutes of finishing a long run: 20g+ protein + 60g+ carbs. The second long run depends on how well you refuelled after the first.' },
  ],
  raceDay: [
    { time: 'Pre-race (T-3h)', title: 'Familiar carb-based meal', detail: 'Porridge with banana, toast with peanut butter, rice — whatever your gut knows. 100g+ carbs. Coffee if that\'s your habit.' },
    { time: 'T-30 min', title: 'Small top-up + caffeine optional', detail: 'A gel or small snack. Sip water. Don\'t overfill. Save coffee for the mid-race slump if you use it.' },
    { time: 'Miles 0–6', title: 'Start eating early', detail: 'First food at 45 minutes regardless of hunger. Your gut needs warming up, not a 3-hour fast at effort. Gel or real food — your choice.' },
    { time: 'Every 30 min', title: '60–80g carbs/hour target', detail: 'Alternate gels and real food where possible. Gels for moving fast, real food at aid stations and walk sections. Eat on every downhill.' },
    { time: 'Every hour', title: '250–400mg sodium', detail: 'Salt caps, electrolyte tabs, or salty food. In cold weather (Spine, UTYD) you sweat less but still need sodium for muscle function.' },
    { time: 'Aid stations', title: 'Always sit for 60 seconds', detail: 'Take stock. Eat hot food if available. Check feet. Refill everything. The 60 seconds you spend here saves you 20 minutes of suffering later.' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function daysUntil(dateStr) {
  const diff = new Date(dateStr + 'T00:00:00') - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function mpsToMinMile(mps) {
  if (!mps || mps <= 0) return '—'
  const s = 1609.34 / mps
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}/mi`
}

function metersToMiles(m) { return (m * 0.000621371).toFixed(1) }
function metersToFt(m) { return Math.round(m * 3.28084) }

function isoDate(d) { return d.toISOString().slice(0, 10) }

function getMonday(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

// Rolling 7 days ending now — use this instead of calendar-week for mileage displays
function rolling7Start() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWorkouts() {
  try { return JSON.parse(localStorage.getItem('cc_workouts_v2') || '[]') } catch { return [] }
}
function saveWorkouts(ws) { localStorage.setItem('cc_workouts_v2', JSON.stringify(ws)) }

function getTittesworthPlan() {
  return [
    // ── This weekend ──
    { id: 'plan-01', date: '2026-06-13', name: 'Final Long Run 🏔', type: 'long',  miles: '13', notes: 'Last big effort before Tittesworth. 2,000ft+ vert — Bowland, Pendle or Goyt. Poles in pack. Walk every climb over 10%. This is not a race.' },
    { id: 'plan-02', date: '2026-06-14', name: 'Recovery Jog',      type: 'easy',  miles: '5',  notes: 'Easy Zone 1–2. Flush the legs. No effort.' },
    // ── Week 1 ──
    { id: 'plan-03', date: '2026-06-15', name: 'S&C Session A 💪',  type: 'rest',  miles: '',   notes: 'Full S&C: RDLs, hip thrusts, split squats, calf raises. Focus on form.' },
    { id: 'plan-04', date: '2026-06-17', name: 'Easy Midweek',      type: 'easy',  miles: '8',  notes: 'Zone 2. Flat or gentle trail. Keep HR honest.' },
    { id: 'plan-05', date: '2026-06-18', name: 'S&C Session B 💪',  type: 'rest',  miles: '',   notes: 'Core + upper + single-leg stability.' },
    { id: 'plan-06', date: '2026-06-19', name: 'Strides Session',   type: 'interval', miles: '7', notes: '5mi easy warm-up, then 8×20s at 5k effort with 90s walk recovery. Legs should feel sharp not wrecked.' },
    { id: 'plan-07', date: '2026-06-20', name: 'Trail Run 🏔',      type: 'trail', miles: '10', notes: '1,500ft vert. Deliberately walk all steep climbs — this is a skill, not laziness. Practice your race-day hiking pace.' },
    // ── Week 2 ──
    { id: 'plan-08', date: '2026-06-22', name: 'Easy Run',          type: 'easy',  miles: '7',  notes: 'Taper begins. Volume drops from here. Zone 2, relaxed.' },
    { id: 'plan-09', date: '2026-06-24', name: 'Easy Run',          type: 'easy',  miles: '6',  notes: 'Zone 2. 10 days to race. Resist the urge to do more.' },
    { id: 'plan-10', date: '2026-06-25', name: 'FINAL S&C 💪',      type: 'rest',  miles: '',   notes: 'Last S&C session — 10 days out. Light weights, full range. No DOMS after this.' },
    { id: 'plan-11', date: '2026-06-27', name: 'Easy Run',          type: 'easy',  miles: '8',  notes: 'Flat and easy. No big vert in taper. Legs sharp not tired.' },
    { id: 'plan-12', date: '2026-06-28', name: 'Recovery Jog',      type: 'easy',  miles: '4',  notes: 'Easy legs-only. Zone 1.' },
    // ── Race week ──
    { id: 'plan-13', date: '2026-06-29', name: 'Easy + Strides',    type: 'easy',  miles: '5',  notes: 'Easy with 6×15s strides at race effort. Keep legs awake. Nothing more.' },
    { id: 'plan-14', date: '2026-06-30', name: 'Shakeout',          type: 'easy',  miles: '4',  notes: 'Zone 1–2 only. Just moving. No effort.' },
    { id: 'plan-15', date: '2026-07-01', name: 'Shakeout',          type: 'easy',  miles: '3',  notes: 'Very easy. Last real run. Then rest till race.' },
    { id: 'plan-16', date: '2026-07-02', name: 'Rest / Mobility',   type: 'rest',  miles: '',   notes: 'Yoga, foam roll, stretch. Check full kit list.' },
    { id: 'plan-17', date: '2026-07-03', name: 'Rest – Pack Kit 🎒', type: 'rest', miles: '',   notes: 'Poles ✓ Waterproof ✓ Headtorch ✓ Gels ✓ Salt caps ✓ Foil blanket ✓ Food for 6h ✓' },
    { id: 'plan-18', date: '2026-07-04', name: 'Rest – Travel Day', type: 'rest',  miles: '',   notes: 'Travel to Peak District. Legs up. Eat a big dinner. Sleep early. You are ready.' },
    { id: 'plan-19', date: '2026-07-05', name: '🏁 TITTESWORTH 50K RACE DAY', type: 'trail', miles: '31', notes: 'Start 20% slower than you think. Walk climbs from mile 1. Eat every 30 mins. Count to the next aid station, not the finish. Go be brilliant.' },
    // ── Recovery + 5 Valleys build ──
    { id: 'plan-20', date: '2026-07-08', name: 'Post-Race Recovery', type: 'easy', miles: '4',  notes: 'Easy shakeout only if legs feel ok. No pressure. Recovery week.' },
    { id: 'plan-21', date: '2026-07-11', name: 'Easy Run',           type: 'easy', miles: '6',  notes: 'Recovery week. Zone 1–2 only. Celebrate Tittesworth.' },
    { id: 'plan-22', date: '2026-07-18', name: 'Back-to-Back Day 1', type: 'long', miles: '16', notes: '5 Valleys build begins. 2,000ft vert. Sat long run — one of 4 across July–Aug.' },
    { id: 'plan-23', date: '2026-07-19', name: 'Back-to-Back Day 2', type: 'easy', miles: '10', notes: 'Run on tired legs. This is the point. Easy effort.' },
  ]
}
function getStravaAuth() {
  try { return JSON.parse(localStorage.getItem('cc_strava_auth') || 'null') } catch { return null }
}
function saveStravaAuth(data) { localStorage.setItem('cc_strava_auth', JSON.stringify(data)) }
function clearStravaAuth() { localStorage.removeItem('cc_strava_auth') }



// ═══════════════════════════════════════════════════════════════════════════════
// WEEKLY CHECK-IN
// ═══════════════════════════════════════════════════════════════════════════════

function CheckInWidget({ onCheckinDone, onCheckinSave }) {
  const [open, setOpen] = useState(false)
  const [scores, setScores] = useState({ legs: 0, sleep: 0, stress: 0, motivation: 0 })
  const [niggles, setNiggles] = useState('')
  const [feeling, setFeeling] = useState('')
  const latest = getLatestCheckin()
  const overdue = checkinOverdue()

  function submit() {
    const saved = { ...scores, niggles, feeling }
    saveCheckin(saved)
    setOpen(false)
    setScores({ legs: 0, sleep: 0, stress: 0, motivation: 0 })
    setNiggles('')
    setFeeling('')
    if (onCheckinDone) onCheckinDone()
    if (onCheckinSave) onCheckinSave(saved)
  }

  function ScoreRow({ label, field, icon, low, high, invert = false }) {
    const val = scores[field]
    // For inverted fields (stress): low score = good (mint), high score = bad (red)
    // For normal fields: low score = bad (red), high score = good (mint)
    function dotColor(n) {
      if (val < n) return 'var(--border)' // unfilled
      if (invert) {
        if (n >= 4) return 'var(--red)'
        if (n === 3) return 'var(--yellow)'
        return 'var(--mint)'
      } else {
        if (n <= 2) return 'var(--red)'
        if (n === 3) return 'var(--yellow)'
        return 'var(--mint)'
      }
    }
    const labelColor = val === 0 ? 'var(--muted)' : invert
      ? (val >= 4 ? 'var(--red)' : val === 3 ? 'var(--yellow)' : 'var(--mint)')
      : (val <= 2 ? 'var(--red)' : val === 3 ? 'var(--yellow)' : 'var(--mint)')
    const labelText = val === 0 ? '—' : (val <= 2 ? low : val >= 4 ? high : 'OK')
    return (
      <div className="ci-row">
        <div className="ci-row-label">{icon} {label}</div>
        <div className="ci-dots">
          {[1,2,3,4,5].map(n => (
            <button key={n} className="ci-dot"
              style={{ background: dotColor(n) }}
              onClick={() => setScores(s => ({ ...s, [field]: n }))} />
          ))}
          <span className="ci-dot-label" style={{ color: labelColor }}>{labelText}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {overdue && !open && (
        <div className="checkin-banner" onClick={() => setOpen(true)}>
          <div className="checkin-banner-left">
            <div className="checkin-banner-title">📋 Weekly check-in</div>
            <div className="checkin-banner-sub">60 seconds. Your coach adapts this week based on your answers.</div>
          </div>
          <button className="btn btn-orange" style={{ fontSize: 12, padding: '7px 14px', flexShrink: 0 }} onClick={e => { e.stopPropagation(); setOpen(true) }}>
            Check in
          </button>
        </div>
      )}

      {!overdue && latest && (
        <div className="checkin-summary">
          <span className="ci-sum-label">Last check-in</span>
          {['legs','sleep','stress','motivation'].map(k => (
            <div key={k} className="ci-sum-item">
              <span className="ci-sum-key">{({'legs':'🦵','sleep':'😴','stress':'⚡','motivation':'🔥'})[k]}</span>
              <div className="ci-sum-bar">
                <div className="ci-sum-fill" style={{ width: `${latest[k]*20}%`, background: latest[k] <= 2 ? 'var(--red)' : latest[k] >= 4 ? 'var(--green)' : 'var(--blue)' }} />
              </div>
            </div>
          ))}
          <button className="ci-redo" onClick={() => setOpen(true)}>Update</button>
        </div>
      )}

      {open && (
        <div className="overlay open">
          <div className="modal">
            <div className="modal-title">Weekly Check-in</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Honest answers only. Your coach uses this to adapt your week.</div>

            <ScoreRow label="Leg freshness" field="legs" icon="🦵" low="Heavy" high="Fresh" />
            <ScoreRow label="Sleep quality" field="sleep" icon="😴" low="Poor" high="Great" />
            <ScoreRow label="Life stress" field="stress" icon="⚡" low="Low" high="High" invert={true} />
            <ScoreRow label="Motivation" field="motivation" icon="🔥" low="Low" high="Fired up" />

            <div className="fg" style={{ marginTop: 16 }}>
              <label className="fl">Any niggles or soreness?</label>
              <input className="fi" value={niggles} onChange={e => setNiggles(e.target.value)} placeholder="Left knee, tight calves, nothing..." />
            </div>
            <div className="fg">
              <label className="fl">How are you feeling this week?</label>
              <textarea className="ft" rows={2} value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="Tired but motivated. Work has been stressful. Ready to race..." />
            </div>

            <div className="ma">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-orange" onClick={submit}>Save check-in</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI COACH CHAT
// ═══════════════════════════════════════════════════════════════════════════════

function HevyWorkoutButton({ workout, apiKey }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [errMsg, setErrMsg] = useState('')
  const [calSaved, setCalSaved] = useState(false)

  async function sendToHevy() {
    setState('loading')
    try {
      const res = await fetch('/api/hevy-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, title: workout.title, exercises: workout.exercises }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error || 'Error'); setState('error'); return }
      setState('done')
    } catch (err) {
      setErrMsg(err.message); setState('error')
    }
  }

  // #41: Save coach workout to training calendar
  function saveToCalendar() {
    const today = new Date().toISOString().slice(0, 10)
    const existing = getWorkouts()
    const w = {
      id: `coach_${Date.now()}`,
      date: today,
      name: workout.title,
      type: 'rest',
      miles: '',
      notes: workout.exercises.map(e => `${e.name} ${e.sets}×${e.reps}`).join(', '),
      isRace: false,
    }
    saveWorkouts([...existing, w])
    setCalSaved(true)
  }

  if (state === 'error') return (
    <div className="hevy-btn-row">
      <span style={{ fontSize: 11, color: 'var(--red)' }}>Hevy error: {errMsg}</span>
    </div>
  )

  return (
    <div className="hevy-btn-row">
      {state !== 'done' && (
        <button className="hevy-send-btn" onClick={sendToHevy} disabled={state === 'loading'}>
          {state === 'loading' ? '…' : '🏋️ Add to Hevy'}
        </button>
      )}
      {state === 'done' && <span className="hevy-btn-done">✓ In Hevy</span>}
      <button className="hevy-send-btn" onClick={saveToCalendar} disabled={calSaved}
        style={{ background: calSaved ? 'var(--mint-dim)' : undefined, color: calSaved ? 'var(--mint)' : undefined }}>
        {calSaved ? '✓ In calendar' : '📅 Add to calendar'}
      </button>
      <div className="hevy-workout-preview">
        {workout.exercises.map((e, i) => (
          <span key={i} className="hevy-ex-pill">{e.name} {e.sets}×{e.reps}</span>
        ))}
      </div>
    </div>
  )
}

function parseHevyWorkout(text) {
  const match = text.match(/HEVY_WORKOUT_START\s*([\s\S]*?)\s*HEVY_WORKOUT_END/)
  if (!match) return null
  const block = match[1]
  const titleMatch = block.match(/^title:\s*(.+)/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Coach S&C Session'
  const exerciseLines = [...block.matchAll(/^- name:\s*([^|]+)\s*\|\s*sets:\s*(\d+)\s*\|\s*reps:\s*(\d+)/gm)]
  const exercises = exerciseLines.map(m => ({
    name: m[1].trim(),
    sets: parseInt(m[2]),
    reps: parseInt(m[3]),
  }))
  return exercises.length ? { title, exercises } : null
}

function stripHevyBlock(text) {
  return text.replace(/\n*HEVY_WORKOUT_START[\s\S]*?HEVY_WORKOUT_END\n*/g, '').trim()
}

function ChatSection({ activities, athlete, hevyWorkouts = [], hevyKey = '', pendingCheckin, onPendingCheckinConsumed }) {
  const [messages, setMessages] = useState(getChats)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useCallback(el => el?.scrollIntoView({ behavior: 'smooth' }), [messages])
  const profile = getProfile()
  const checkIn = getLatestCheckin()
  const allCheckins = getCheckins()

  const METERS_TO_MILES = 0.000621371
  const RUN_TYPES = ['Run','TrailRun','Hike','Walk','VirtualRun']

  const recentRuns = (activities || [])
    .filter(a => RUN_TYPES.includes(a.type))
    .slice(0, 10)
    .map(a => ({
      date: a.start_date_local?.slice(0,10),
      name: a.name,
      miles: (a.distance * METERS_TO_MILES).toFixed(1),
      elevFt: Math.round((a.total_elevation_gain || 0) * 3.28084),
    }))

  const today = new Date()
  const upcomingRaces = RACES.filter(r => new Date(r.date) > today)
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .map(r => ({ name: r.name, date: r.date, distanceMi: r.distanceMi, elevationFt: r.elevationFt }))

  // Check-in trend (last 4 weeks)
  const checkinTrend = allCheckins.slice(0, 4).map(c => ({
    date: c.date?.slice(0, 10),
    legs: c.legs, sleep: c.sleep, stress: c.stress, motivation: c.motivation,
    niggles: c.niggles || '',
    feeling: c.feeling || '',
  }))

  // Recurring niggles — any mentioned more than once
  const niggleHistory = allCheckins
    .filter(c => c.niggles?.trim())
    .map(c => `${c.date?.slice(0,10)}: ${c.niggles}`)
    .slice(0, 6)

  // Race debrief memory
  const debriefMemory = getDebriefs().map(d => ({
    race: d.raceId,
    date: d.date?.slice(0,10),
    finished: d.finished,
    scores: { overall: d.overall, execution: d.execution, nutrition: d.nutrition, mental: d.mental, fitness: d.fitness },
    lessons: d.lessons || '',
    proud: d.proud || '',
    nextTime: d.nextTime || '',
  }))

  const weekMiles = (activities || [])
    .filter(a => new Date(a.start_date_local) >= rolling7Start() && RUN_TYPES.includes(a.type))
    .reduce((s, a) => s + a.distance * METERS_TO_MILES, 0)

  // Race Brain — pass its readiness signal to coach so they cannot contradict
  const brain = getRaceBrain(activities || [], checkIn)
  const brainReadiness = `${brain.readiness.label} (${brain.days} days to ${brain.nextRace?.name}). Focus: ${brain.focus}. Risk: ${brain.risk}.`

  // Planned calendar — next 3 weeks
  const todayStr = new Date().toISOString().slice(0, 10)
  const threeWeeks = new Date(); threeWeeks.setDate(threeWeeks.getDate() + 21)
  const threeWeeksStr = threeWeeks.toISOString().slice(0, 10)
  const plannedCalendar = getWorkouts()
    .filter(w => w.date >= todayStr && w.date <= threeWeeksStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => `${w.date}: ${w.name}${w.miles ? ` — ${w.miles}mi` : ''}${w.elevFt ? `, ${w.elevFt}ft vert` : ''}${w.isRace ? ' [RACE]' : ''}${w.notes ? ` (${w.notes})` : ''}`)

  const nextRace = upcomingRaces[0]
  const daysToRace = nextRace ? Math.ceil((new Date(nextRace.date) - today) / 86400000) : null
  const currentPhase = nextRace
    ? (daysToRace <= 14 ? `${daysToRace} days to ${nextRace.name} — TAPER`
      : daysToRace <= 30 ? `${daysToRace} days to ${nextRace.name} — Sharpen phase`
      : `${daysToRace} days to ${nextRace.name} — Build phase`)
    : 'Off season'

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    saveChats(updated)
    setLoading(true)

    try {
      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          context: {
            profile,
            races: upcomingRaces,
            recentRuns,
            checkIn,
            checkinTrend,
            niggleHistory,
            debriefMemory,
            currentPhase,
            brainReadiness,
            weekMiles: weekMiles.toFixed(1),
            plannedCalendar,
            recentStrength: hevyWorkouts.slice(0, 5).map(w => ({
              date: w.date, title: w.title,
              exercises: w.exercises.map(e => e.name).join(', '),
              sets: w.totalSets,
            })),
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const reply = { role: 'assistant', content: data.reply }
      const withReply = [...updated, reply]
      setMessages(withReply)
      saveChats(withReply)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    if (!confirm('Clear chat history?')) return
    setMessages([])
    saveChats([])
  }

  // Auto-fire coach response when a new check-in is saved
  useEffect(() => {
    if (!pendingCheckin) return
    const legs = pendingCheckin.legs
    const sleep = pendingCheckin.sleep
    const stress = pendingCheckin.stress
    const motivation = pendingCheckin.motivation
    const niggles = pendingCheckin.niggles
    const feeling = pendingCheckin.feeling
    const prompt = `I just did my check-in: legs ${legs}/5, sleep ${sleep}/5, stress ${stress}/5, motivation ${motivation}/5${niggles ? `, niggles: ${niggles}` : ''}${feeling ? `. Feeling: "${feeling}"` : ''}. How should I adapt my week based on this?`
    // Slight delay so the tab switch animation completes
    const t = setTimeout(() => {
      const userMsg = { role: 'user', content: prompt }
      const updated = [...getChats(), userMsg]
      setMessages(updated)
      saveChats(updated)
      setLoading(true)
      setError(null)
      fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          context: {
            profile: getProfile(),
            races: RACES.filter(r => new Date(r.date) > new Date()).map(r => ({ name: r.name, date: r.date, distanceMi: r.distanceMi, elevationFt: r.elevationFt })),
            recentRuns: (activities || []).filter(a => RUN_TYPES.includes(a.type)).slice(0, 8).map(a => ({ date: a.start_date_local?.slice(0,10), name: a.name, miles: (a.distance * 0.000621371).toFixed(1), elevFt: Math.round((a.total_elevation_gain||0)*3.28084) })),
            checkIn: pendingCheckin,
            weekMiles: (activities || []).filter(a => new Date(a.start_date_local) >= rolling7Start() && RUN_TYPES.includes(a.type)).reduce((s,a) => s + a.distance * 0.000621371, 0).toFixed(1),
            currentPhase: 'Check-in response',
            plannedCalendar: getWorkouts()
              .filter(w => { const t = new Date().toISOString().slice(0,10); const e = new Date(); e.setDate(e.getDate()+21); return w.date >= t && w.date <= e.toISOString().slice(0,10) })
              .sort((a,b) => a.date.localeCompare(b.date))
              .map(w => `${w.date}: ${w.name}${w.miles ? ` — ${w.miles}mi` : ''}${w.isRace ? ' [RACE]' : ''}`),
          },
        }),
      }).then(r => r.json()).then(data => {
        if (data.error) throw new Error(data.error)
        const reply = { role: 'assistant', content: data.reply }
        const withReply = [...updated, reply]
        setMessages(withReply)
        saveChats(withReply)
      }).catch(e => setError(e.message)).finally(() => setLoading(false))
      if (onPendingCheckinConsumed) onPendingCheckinConsumed()
    }, 400)
    return () => clearTimeout(t)
  }, [pendingCheckin])

  const STARTERS = [
    'Should I run today?',
    `How should I approach ${nextRace?.name || 'my next race'}?`,
    'My legs feel heavy — what do I do?',
    'What should my long run look like this weekend?',
    "I'm nervous about the Spine Sprint. Is that normal?",
  ]

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <div>
          <div className="section-title" style={{ marginBottom: 0 }}>Coach</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Knows your races, your training, your WHY</div>
        </div>
        {messages.length > 0 && <button className="ci-redo" onClick={clearChat}>Clear</button>}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-title">Ask your coach anything</div>
            <div className="chat-empty-sub">I know your races, your recent training, and your check-in. Ask me anything — training questions, race strategy, injury worries, or whether to run today.</div>
            <div className="chat-starters">
              {STARTERS.map((s, i) => (
                <button key={i} className="chat-starter" onClick={() => { setInput(s) }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const workout = m.role === 'assistant' ? parseHevyWorkout(m.content) : null
          const displayText = workout ? stripHevyBlock(m.content) : m.content
          return (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.role === 'assistant' && <div className="chat-avatar">⚡</div>}
              <div style={{ flex: 1 }}>
                <div className="chat-bubble">{displayText}</div>
                {workout && hevyKey && (
                  <HevyWorkoutButton workout={workout} apiKey={hevyKey} />
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-avatar">⚡</div>
            <div className="chat-bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">{error.includes('ANTHROPIC_API_KEY') ? 'Add ANTHROPIC_API_KEY to your Vercel env vars to enable the AI coach.' : error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-wrap">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask your coach…"
          disabled={loading}
        />
        <button className="chat-send" onClick={send} disabled={loading || !input.trim()}>
          {loading ? '…' : '↑'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// YEAR ARC
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIRMED_RACES_KEY = 'confirmed_strava_races'
const DISMISSED_RACES_KEY = 'dismissed_strava_races'

function getConfirmedRaceIds() {
  try { return JSON.parse(localStorage.getItem(CONFIRMED_RACES_KEY) || '[]') } catch { return [] }
}
function saveConfirmedRaceId(id) {
  const ids = getConfirmedRaceIds()
  if (!ids.includes(id)) localStorage.setItem(CONFIRMED_RACES_KEY, JSON.stringify([...ids, id]))
}
function getDismissedRaceIds() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_RACES_KEY) || '[]') } catch { return [] }
}
function saveDismissedRaceId(id) {
  const ids = getDismissedRaceIds()
  if (!ids.includes(id)) localStorage.setItem(DISMISSED_RACES_KEY, JSON.stringify([...ids, id]))
}

function SeasonSection({ activities = [], stravaConnected = false }) {
  const today = new Date()
  const [classifyState, setClassifyState] = useState('idle') // idle | loading | review | done
  const [suggestions, setSuggestions] = useState([]) // AI-suggested races pending review
  const [confirmedIds, setConfirmedIds] = useState(getConfirmedRaceIds)
  const [dismissedIds, setDismissedIds] = useState(getDismissedRaceIds)

  async function findMyRaces() {
    setClassifyState('loading')
    const RUN_TYPES = ['Run', 'TrailRun', 'VirtualRun', 'Hike']
    // Only classify past activities not already confirmed/dismissed/in RACES
    const dismissed = getDismissedRaceIds()
    const confirmed = getConfirmedRaceIds()
    const candidates = activities.filter(a => {
      if (!RUN_TYPES.includes(a.type)) return false
      if (new Date(a.start_date_local) >= today) return false
      if (a.workout_type === 1) return false // already a Strava race
      if (dismissed.includes(a.id) || confirmed.includes(a.id)) return false
      const d = new Date(a.start_date_local)
      if (d.getFullYear() < 2025) return false // only recent history
      // Skip if already matched to a planned RACES entry
      const alreadyMatched = RACES.some(r => Math.abs(new Date(r.date) - d) / 86400000 <= 3)
      return !alreadyMatched
    })
    if (!candidates.length) { setClassifyState('done'); return }
    try {
      const resp = await fetch('/api/classify-races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: candidates }),
      })
      const data = await resp.json()
      const raceSuggestions = (data.races || []).filter(r => r.verdict === 'race')
      if (!raceSuggestions.length) { setClassifyState('done'); return }
      // Enrich suggestions with full activity data
      const enriched = raceSuggestions.map(s => ({
        ...s,
        activity: candidates.find(a => a.id === s.id),
      })).filter(s => s.activity)
      setSuggestions(enriched)
      setClassifyState('review')
    } catch (err) {
      console.error(err)
      setClassifyState('idle')
    }
  }

  function confirmRace(id) {
    saveConfirmedRaceId(id)
    setConfirmedIds(getConfirmedRaceIds())
    setSuggestions(s => s.filter(x => x.id !== id))
    if (suggestions.length <= 1) setClassifyState('done')
  }
  function dismissRace(id) {
    saveDismissedRaceId(id)
    setDismissedIds(getDismissedRaceIds())
    setSuggestions(s => s.filter(x => x.id !== id))
    if (suggestions.length <= 1) setClassifyState('done')
  }

  // Race season: Jul 2026 → Jul 2027 (covers all 6 races)
  const yearStart = new Date('2026-07-01')
  const yearEnd   = new Date('2027-07-01')

  // Season quarters
  const QUARTERS = [
    { id: 'q3-2026', label: 'Summer / Autumn 2026', emoji: '☀️',  start: '2026-07-01', end: '2026-09-30', color: 'var(--orange)' },
    { id: 'q4-2026', label: 'Autumn / Winter 2026', emoji: '🍂',  start: '2026-10-01', end: '2026-12-31', color: '#e67e22' },
    { id: 'q1-2027', label: 'Winter / Spring 2027', emoji: '❄️',  start: '2027-01-01', end: '2027-03-31', color: 'var(--blue)' },
    { id: 'q2-2027', label: 'Spring / Summer 2027', emoji: '🌿',  start: '2027-04-01', end: '2027-07-01', color: 'var(--green)' },
  ]

  const RUN_TYPES = ['Run', 'TrailRun', 'VirtualRun', 'Hike']
  const runs = activities.filter(a => RUN_TYPES.includes(a.type))

  function qMiles(qStart, qEnd) {
    const s = new Date(qStart), e = new Date(qEnd)
    return runs
      .filter(a => { const d = new Date(a.start_date_local); return d >= s && d <= e })
      .reduce((sum, a) => sum + (a.distance * 0.000621371), 0)
  }

  function qRuns(qStart, qEnd) {
    const s = new Date(qStart), e = new Date(qEnd)
    return runs.filter(a => { const d = new Date(a.start_date_local); return d >= s && d <= e })
  }

  function qVert(qStart, qEnd) {
    const s = new Date(qStart), e = new Date(qEnd)
    return runs
      .filter(a => { const d = new Date(a.start_date_local); return d >= s && d <= e })
      .reduce((sum, a) => sum + ((a.total_elevation_gain || 0) * 3.28084), 0)
  }

  // Try to match a RACES entry with a Strava activity (within 2 days, running type)
  function findStravaResult(race) {
    const raceDate = new Date(race.date)
    return runs.find(a => {
      const d = new Date(a.start_date_local)
      const diff = Math.abs(d - raceDate) / 86400000
      return diff <= 2 && (a.distance * 0.000621371) > race.distanceMi * 0.5
    })
  }

  // Detect historic races from Strava not already in RACES array
  // Includes: workout_type === 1 (user tagged in Strava) OR user confirmed via AI classifier
  const stravaRaces = runs.filter(a => {
    const d = new Date(a.start_date_local)
    if (d.getFullYear() < 2025) return false
    if (d >= today) return false
    // Only include if not already matched to a RACES entry
    const alreadyMatched = RACES.some(r => {
      const diff = Math.abs(new Date(r.date) - d) / 86400000
      return diff <= 3
    })
    if (alreadyMatched) return false
    return a.workout_type === 1 || confirmedIds.includes(a.id)
  }).map(a => ({
    id: `strava_${a.id}`,
    name: a.name,
    date: a.start_date_local?.slice(0, 10),
    distanceMi: (a.distance * 0.000621371).toFixed(1),
    elevationFt: Math.round((a.total_elevation_gain || 0) * 3.28084),
    movingTime: a.moving_time,
    isStravaOnly: true,
  }))

  const sorted = [...RACES].sort((a, b) => new Date(a.date) - new Date(b.date))
  // All races across the full 2026-2027 season
  const yearRaces = sorted.filter(r => new Date(r.date) >= yearStart && new Date(r.date) <= yearEnd)
  const totalPlannedMiles = yearRaces.reduce((s, r) => s + r.distanceMi, 0)
  const racesDone = yearRaces.filter(r => new Date(r.date) < today).length
  const totalStravaYearMiles = Math.round(qMiles('2026-07-01', '2027-07-01'))

  // Year progress bar
  const yearProgress = Math.min(100, Math.max(0,
    ((today - yearStart) / (yearEnd - yearStart)) * 100
  ))

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const nextRace = sorted.find(r => new Date(r.date) >= today)
  const nextRaceDays = nextRace ? Math.ceil((new Date(nextRace.date) - today) / 86400000) : null

  return (
    <div>
      <div className="section-title">2026 Season</div>

      {/* Next race hero */}
      {nextRace && (
        <div className="next-race-hero" style={{ borderLeftColor: nextRace.color }}>
          <div className="next-race-hero-top">
            <div>
              <div className="next-race-hero-label">Next race</div>
              <div className="next-race-hero-name">{nextRace.name}</div>
              <div className="next-race-hero-meta">{nextRace.type} · {nextRace.distanceMi}mi · {(nextRace.elevationFt/1000).toFixed(1)}k ft vert · {nextRace.location}</div>
            </div>
            <div className="next-race-hero-countdown">
              <div className="next-race-hero-days">{nextRaceDays === 0 ? '🏁' : nextRaceDays}</div>
              <div className="next-race-hero-days-label">{nextRaceDays === 0 ? 'race day' : nextRaceDays === 1 ? 'day to go' : 'days to go'}</div>
              <div className="next-race-hero-date">{fmtDate(nextRace.date)}</div>
            </div>
          </div>
          <div className="next-race-hero-desc">{nextRace.description.slice(0, 130)}…</div>
        </div>
      )}

      {/* AI Race Finder */}
      {stravaConnected && (
        <div style={{ marginBottom: 16 }}>
          {classifyState === 'idle' && (
            <button className="btn btn-ghost" style={{ fontSize: 12, gap: 6 }} onClick={findMyRaces}>
              🔍 Find past races from Strava
            </button>
          )}
          {classifyState === 'loading' && (
            <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0' }}>
              🤖 Analysing your Strava history…
            </div>
          )}
          {classifyState === 'done' && suggestions.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0' }}>
              ✓ No additional races found{confirmedIds.length > 0 ? ` — ${confirmedIds.length} confirmed` : ''}
            </div>
          )}
          {classifyState === 'review' && suggestions.length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>🤖 Possible races found — confirm?</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
                AI detected these from your Strava history. Tap ✓ to add to your season, ✗ to dismiss.
              </div>
              {suggestions.map(s => {
                const a = s.activity
                const miles = (a.distance * 0.000621371).toFixed(1)
                const elevFt = Math.round((a.total_elevation_gain || 0) * 3.28084)
                const hrs = Math.floor(a.moving_time / 3600)
                const mins = Math.floor((a.moving_time % 3600) / 60)
                const dateStr = new Date(a.start_date_local).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <div key={s.id} className="classify-row">
                    <div className="classify-row-body">
                      <div className="classify-row-name">{a.name}</div>
                      <div className="classify-row-meta">{dateStr} · {miles}mi · {elevFt}ft · {hrs}h{mins}m</div>
                      <div className="classify-row-reason">{s.reason}</div>
                    </div>
                    <div className="classify-row-actions">
                      <button className="classify-btn confirm" onClick={() => confirmRace(s.id)}>✓</button>
                      <button className="classify-btn dismiss" onClick={() => dismissRace(s.id)}>✗</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Year stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Races done', value: `${racesDone}/${yearRaces.length}`, sub: `${yearRaces.length - racesDone} ahead` },
          { label: 'Race Miles', value: totalPlannedMiles, sub: 'planned season' },
          { label: 'Training Miles', value: stravaConnected ? `${totalStravaYearMiles}` : '—', sub: stravaConnected ? 'Jul 26–Jul 27' : 'connect Strava' },
          { label: 'Race Vert', value: `${(yearRaces.reduce((s,r)=>s+(r.elevationFt||0),0)/1000).toFixed(0)}k ft`, sub: 'planned season' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ color: 'var(--text)' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{s.label}</div>
            <div className="stat-label">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Year timeline bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Season Timeline — Jul 2026 → Jun 2027</div>
        <div className="season-timeline">
          <div className="season-track">
            <div className="season-progress" style={{ width: `${yearProgress}%` }} />
            <div className="season-now" style={{ left: `${yearProgress}%` }}>
              <div className="season-now-dot" />
              <div className="season-now-label">Today</div>
            </div>
          </div>
          <div className="season-pins">
            {/* Planned races */}
            {yearRaces.map(r => {
              const p = Math.min(99, Math.max(1,
                ((new Date(r.date) - yearStart) / (yearEnd - yearStart)) * 100
              ))
              const isPast = new Date(r.date) < today
              const isNext = !isPast && yearRaces.find(x => new Date(x.date) > today)?.id === r.id
              return (
                <div key={r.id} className={`season-pin ${isPast ? 'past' : ''} ${isNext ? 'next' : ''}`} style={{ left: `${p}%` }}>
                  <div className="season-pin-dot" style={{ background: isPast ? 'var(--muted)' : r.color }} />
                  <div className="season-pin-name">{r.shortName || r.name?.split(' ')[0]}</div>
                  <div className="season-pin-date">{fmtDate(r.date)}</div>
                </div>
              )
            })}
            {/* Strava-detected historic races */}
            {stravaRaces.map(r => {
              const p = Math.min(99, Math.max(1,
                ((new Date(r.date) - yearStart) / (yearEnd - yearStart)) * 100
              ))
              return (
                <div key={r.id} className="season-pin past" style={{ left: `${p}%` }}>
                  <div className="season-pin-dot" style={{ background: 'var(--purple)' }} />
                  <div className="season-pin-name" style={{ color: 'var(--purple)' }}>{r.name?.split(' ').slice(0,2).join(' ')}</div>
                  <div className="season-pin-date">{fmtDate(r.date)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quarters */}
      {QUARTERS.map(q => {
        const qStart = new Date(q.start)
        const qEnd = new Date(q.end)
        const isActive = today >= qStart && today <= qEnd
        const isPast = today > qEnd
        const qRaceList = yearRaces.filter(r => { const d = new Date(r.date); return d >= qStart && d <= qEnd })
        const qStravaRaces = stravaRaces.filter(r => { const d = new Date(r.date); return d >= qStart && d <= qEnd })
        const miles = Math.round(qMiles(q.start, q.end))
        const vert = Math.round(qVert(q.start, q.end))
        const runCount = qRuns(q.start, q.end).length

        return (
          <div key={q.id} className={`year-quarter ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
            style={{ borderLeftColor: isActive ? q.color : isPast ? 'var(--border)' : q.color + '66' }}>
            <div className="year-quarter-header">
              <div className="year-quarter-left">
                <span className="year-quarter-emoji">{q.emoji}</span>
                <div>
                  <div className="year-quarter-label" style={{ color: isActive ? q.color : isPast ? 'var(--muted)' : 'var(--text)' }}>
                    {q.label} {isActive && <span className="year-quarter-now">NOW</span>}
                  </div>
                  <div className="year-quarter-dates">{fmtDate(q.start)} → {fmtDate(q.end)}</div>
                </div>
              </div>
              {stravaConnected && (miles > 0 || isPast) && (
                <div className="year-quarter-stats">
                  <div className="year-quarter-stat"><span>{miles}</span><span>mi</span></div>
                  {vert > 0 && <div className="year-quarter-stat"><span>{(vert/1000).toFixed(0)}k</span><span>ft vert</span></div>}
                  {runCount > 0 && <div className="year-quarter-stat"><span>{runCount}</span><span>runs</span></div>}
                </div>
              )}
            </div>

            {qRaceList.length === 0 && qStravaRaces.length === 0 ? (
              <div className="year-quarter-empty">No races this quarter</div>
            ) : (
              <>
              {qStravaRaces.map(r => {
                const hrs = r.movingTime ? Math.floor(r.movingTime / 3600) : null
                const mins = r.movingTime ? Math.floor((r.movingTime % 3600) / 60) : null
                const finishTime = hrs !== null ? `${hrs}h ${String(mins).padStart(2,'0')}m` : null
                return (
                  <div key={r.id} className="year-race-row past result-card">
                    <div className="year-race-color-bar" style={{ background: 'var(--mint)' }} />
                    <div className="year-race-body">
                      <div className="year-race-top">
                        <div style={{ flex: 1 }}>
                          <div className="year-race-name">{r.name}</div>
                          <div className="year-race-meta">{r.distanceMi}mi · {(r.elevationFt/1000).toFixed(1)}k ft vert · {fmtDate(r.date)}</div>
                        </div>
                        {finishTime && (
                          <div className="result-finish-time">
                            <div className="result-time-val">{finishTime}</div>
                            <div className="result-time-lbl">finish</div>
                          </div>
                        )}
                        {!finishTime && (
                          <div className="year-race-status done" style={{ background: 'var(--mint-dim)', color: 'var(--mint)' }}>✓ Done</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {qRaceList.map(r => {
                const isPastRace = new Date(r.date) < today
                const days = Math.ceil((new Date(r.date) - today) / 86400000)
                const stravaResult = stravaConnected ? findStravaResult(r) : null

                return (
                  <div key={r.id} className={`year-race-row ${isPastRace ? 'past' : ''}`}>
                    <div className="year-race-color-bar" style={{ background: isPastRace ? 'var(--border)' : r.color }} />
                    <div className="year-race-body">
                      <div className="year-race-top">
                        <div>
                          <div className="year-race-name">{r.name}</div>
                          <div className="year-race-meta">{r.type} · {r.distanceMi}mi · {(r.elevationFt/1000).toFixed(1)}k ft · {r.location}</div>
                        </div>
                        <div className="year-race-badge-col">
                          <div className="year-race-date">{fmtDate(r.date)}</div>
                          <div className={`year-race-status ${isPastRace ? 'done' : days <= 30 ? 'soon' : ''}`}>
                            {isPastRace ? '✓ Done' : days === 0 ? 'TODAY' : `${days}d`}
                          </div>
                        </div>
                      </div>
                      {stravaResult && (() => {
                        const rHrs = Math.floor(stravaResult.moving_time / 3600)
                        const rMins = Math.floor((stravaResult.moving_time % 3600) / 60)
                        return (
                          <div className="year-race-strava result-highlight">
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--mint)' }}>
                              {rHrs}h {String(rMins).padStart(2,'0')}m
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>
                              · {(stravaResult.distance * 0.000621371).toFixed(1)}mi on Strava
                            </span>
                          </div>
                        )
                      })()}
                      {!stravaConnected && isPastRace && (
                        <div className="year-race-strava muted">Connect Strava to see your result</div>
                      )}
                      <div className="year-race-desc">{r.description.slice(0, 110)}…</div>
                    </div>
                  </div>
                )
              })}
              </>
            )}
          </div>
        )
      })}

      {/* Community Race Recs */}
      <RaceRecsSection />
    </div>
  )
}

function RaceRecsSection() {
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'spine', label: '🏔 Spine prep' },
    { id: 'nav', label: '🧭 Nav' },
    { id: 'long', label: '💯 100mi' },
  ]

  function matchFilter(r) {
    if (filter === 'all') return true
    if (filter === 'spine') return r.spineValue >= 4
    if (filter === 'nav') return r.tags.some(t => t.toLowerCase().includes('nav'))
    if (filter === 'long') return r.distance.toLowerCase().includes('100')
    return true
  }

  const visible = COMMUNITY_RECS.filter(matchFilter)

  return (
    <div style={{ marginTop: 28 }}>
      <div className="card-title" style={{ marginBottom: 4 }}>🐝 Community Race Recs</div>
      <div className="section-sub" style={{ marginBottom: 14 }}>Sourced from your WhatsApp groups — real recommendations from women who have done these races</div>

      <div className="rec-filters">
        {filters.map(f => (
          <button key={f.id} className={`rec-filter-btn ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {visible.map(r => (
        <div key={r.id} className={`rec-card ${expanded === r.id ? 'open' : ''}`} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
          <div className="rec-card-top">
            <div className="rec-card-left">
              <div className="rec-card-name">{r.name}</div>
              <div className="rec-card-meta">{r.distance} · {r.location} · {r.timing}</div>
              <div className="rec-tags">
                {r.tags.map((t, i) => <span key={i} className="rec-tag">{t}</span>)}
              </div>
            </div>
            <div className="rec-card-right">
              <div className="rec-spine-val">
                <div className="rec-spine-label">Spine value</div>
                <div className="rec-spine-dots">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className={`rec-spine-dot ${n <= r.spineValue ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="rec-voices">{r.recommenders} voices</div>
              <div className="rec-chevron">{expanded === r.id ? '▲' : '▼'}</div>
            </div>
          </div>
          {expanded === r.id && (
            <div className="rec-hive-quote">
              <span className="rec-hive-bee">🐝</span>
              <div className="rec-hive-text">{r.hiveSays}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE + JOURNEY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

function getProfile() { try { return JSON.parse(localStorage.getItem('cc_profile_v1') || 'null') } catch { return null } }
function saveProfile(p) { localStorage.setItem('cc_profile_v1', JSON.stringify(p)) }

// Check-in helpers
function getCheckins() { try { return JSON.parse(localStorage.getItem('cc_checkins_v1') || '[]') } catch { return [] } }
function saveCheckin(c) {
  const all = getCheckins()
  all.unshift({ ...c, date: new Date().toISOString() })
  localStorage.setItem('cc_checkins_v1', JSON.stringify(all.slice(0, 12)))
}
function getLatestCheckin() { return getCheckins()[0] || null }
function checkinOverdue() {
  const latest = getLatestCheckin()
  if (!latest) return true
  return (Date.now() - new Date(latest.date).getTime()) > 6 * 24 * 60 * 60 * 1000
}

// Chat helpers
function getChats() { try { return JSON.parse(localStorage.getItem('cc_chats_v1') || '[]') } catch { return [] } }
function saveChats(msgs) { localStorage.setItem('cc_chats_v1', JSON.stringify(msgs.slice(-40))) }

// Debrief helpers — the start of Ultra Memory
function getDebriefs() { try { return JSON.parse(localStorage.getItem('cc_debriefs_v1') || '[]') } catch { return [] } }
function saveDebrief(d) {
  const all = getDebriefs().filter(x => x.id !== d.id)
  all.unshift(d)
  localStorage.setItem('cc_debriefs_v1', JSON.stringify(all))
}
function deleteDebrief(id) {
  const all = getDebriefs().filter(x => x.id !== id)
  localStorage.setItem('cc_debriefs_v1', JSON.stringify(all))
}

const LEVELS = [
  { id: 'new',      icon: '🚶', label: 'Just Starting Out',   sub: 'Walking or occasional jogging' },
  { id: 'runner',   icon: '🏃', label: 'Regular Runner',      sub: 'Comfortable at 5–10k' },
  { id: 'half',     icon: '🎽', label: 'Half Marathon Runner', sub: 'Road or trail halfs done' },
  { id: 'marathon', icon: '🏅', label: 'Marathon Runner',     sub: 'Road marathon under your belt' },
  { id: 'trail',    icon: '🏔', label: 'Trail Runner',        sub: 'Trail or fell races done' },
  { id: 'ultra',    icon: '⚡', label: 'Ultra Runner',        sub: 'Racing 25k+ already' },
]

const GOALS = [
  { id: '25k',   icon: '🌿', label: 'First Trail 25k',        sub: '15 miles — your gateway race' },
  { id: '50k',   icon: '🏔', label: 'First 50k Ultra',        sub: '31 miles / 5–8 hours' },
  { id: '100k',  icon: '🔥', label: '100k Ultra',              sub: '62 miles — serious commitment' },
  { id: 'multi', icon: '❄️', label: 'Non-Stop Multi-Day',     sub: 'Spine, Lakeland, UTMB etc' },
  { id: 'any',   icon: '🧭', label: 'No target race yet',     sub: 'Build the base first' },
]

const GAPS = [
  { id: 'miles',   icon: '📈', label: 'Building mileage safely' },
  { id: 'vert',    icon: '⛰',  label: 'Hills and elevation' },
  { id: 'long',    icon: '⏱',  label: 'Running 2+ hours' },
  { id: 'fuel',    icon: '⚡', label: 'Eating and drinking on the run' },
  { id: 'mental',  icon: '🧠', label: 'Mental toughness' },
  { id: 'injury',  icon: '🩹', label: 'Staying injury-free' },
]

const LEVEL_WEEKLY_MILES = { new: 12, runner: 22, half: 32, marathon: 40, trail: 45, ultra: 50 }

function generateJourneyPlan(profile) {
  const base = LEVEL_WEEKLY_MILES[profile.level] || 20
  const daysPerWeek = profile.days || 4
  const today = new Date()
  const workouts = []

  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  function weekStart(weekNum) {
    const mon = new Date(today)
    mon.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekNum * 7)
    mon.setHours(0, 0, 0, 0)
    return mon
  }

  // Session templates by level
  const sessionsByDay = {
    new: [
      { offset: 1, name: 'Run/Walk', type: 'easy', miles: '2', notes: 'Run 3 minutes, walk 1 minute. Repeat. You are building the habit first, fitness second.' },
      { offset: 3, name: 'Easy Run', type: 'easy', miles: '2.5', notes: "Slow enough to hold a full conversation. If you can't speak you're going too fast." },
      { offset: 5, name: 'Longer Run', type: 'long', miles: '4', notes: 'Your weekend long run. No pressure on pace. Just time on feet.' },
    ],
    runner: [
      { offset: 1, name: 'Easy Run', type: 'easy', miles: '5', notes: 'Zone 2 — conversational pace. This is the engine-builder.' },
      { offset: 3, name: 'Hills + Effort', type: 'interval', miles: '6', notes: '4 miles easy + 6×1 min hill efforts. Walk back down. This is your weekly quality session.' },
      { offset: 5, name: 'Long Run', type: 'long', miles: '10', notes: 'Longest run of the week. Run/walk if needed. Get to trail if possible.' },
      { offset: 6, name: 'Recovery Jog', type: 'easy', miles: '4', notes: 'Easy. Loosen the legs from yesterday.' },
    ],
    half: [
      { offset: 1, name: 'Easy Run', type: 'easy', miles: '7', notes: 'Zone 2. Flat or gentle trail.' },
      { offset: 2, name: 'S&C', type: 'rest', miles: '', notes: 'Strength: squats, lunges, single-leg work. Your trail-running insurance.' },
      { offset: 3, name: 'Trail Run', type: 'trail', miles: '8', notes: 'Find a trail. Include hills. Walk the steep ones — learn to hike strong.' },
      { offset: 5, name: 'Long Run', type: 'long', miles: '14', notes: 'Build to 16+ over 8 weeks. Bring food. Practice eating on the move.' },
    ],
    marathon: [
      { offset: 1, name: 'Easy Trail Run', type: 'trail', miles: '8', notes: "Zone 2 on trail. Your aerobic engine is strong — we're adding terrain now." },
      { offset: 2, name: 'S&C', type: 'rest', miles: '', notes: 'Romanian deadlifts, hip thrusts, single-leg squats. Trail-specific strength.' },
      { offset: 3, name: 'Hill Session', type: 'interval', miles: '8', notes: '5 miles with 3×10 min threshold hill climb. Walk descents to protect quads.' },
      { offset: 5, name: 'Back-to-Back Day 1', type: 'long', miles: '16', notes: 'Longest run. 2,000ft vert if possible. Practice eating every 30 mins.' },
      { offset: 6, name: 'Back-to-Back Day 2', type: 'easy', miles: '8', notes: 'Run on tired legs. This is the ultra-specific adaptation. Keep it easy.' },
    ],
    trail: [
      { offset: 1, name: 'Easy Run', type: 'easy', miles: '8', notes: 'Zone 2. Let recovery happen.' },
      { offset: 2, name: 'S&C', type: 'rest', miles: '', notes: 'Posterior chain focus. Deadlifts, hip thrusts.' },
      { offset: 3, name: 'Quality Run', type: 'interval', miles: '10', notes: 'Tempo or hill reps. One hard session per week — make it count.' },
      { offset: 5, name: 'Long Run', type: 'long', miles: '18', notes: '2,500ft+ vert. This is your weekly anchor. Everything else supports this.' },
      { offset: 6, name: 'Recovery Run', type: 'easy', miles: '6', notes: 'Easy effort. Flush the legs.' },
    ],
    ultra: [
      { offset: 1, name: 'Easy Recovery', type: 'easy', miles: '8', notes: 'Zone 2. Recovery is training. Protect it.' },
      { offset: 2, name: 'S&C', type: 'rest', miles: '', notes: 'Full session. RDLs, hip thrusts, single-leg work.' },
      { offset: 3, name: 'Quality Session', type: 'interval', miles: '10', notes: 'Threshold or hill reps. One quality session per week.' },
      { offset: 5, name: 'Long Trail Run', type: 'long', miles: '20', notes: '3,000ft+ vert. Your weekly anchor session. Poles if relevant race.' },
      { offset: 6, name: 'Back-to-Back', type: 'easy', miles: '10', notes: 'Run on tired legs. Eat well. This is ultra-specific adaptation.' },
    ],
  }

  const sessions = sessionsByDay[profile.level] || sessionsByDay.runner

  // Generate 12 weeks
  const progressionByLevel = { new: 0.08, runner: 0.08, half: 0.07, marathon: 0.06, trail: 0.05, ultra: 0.05 }
  const progression = progressionByLevel[profile.level] || 0.07

  for (let week = 0; week < 12; week++) {
    const wStart = weekStart(week)
    const multiplier = 1 + (week * progression)
    const isCutback = (week + 1) % 4 === 0

    sessions.forEach(s => {
      const date = addDays(wStart, s.offset)
      const rawMiles = s.miles ? Math.round(parseFloat(s.miles) * multiplier * (isCutback ? 0.7 : 1) * 2) / 2 : ''
      workouts.push({
        id: `journey-w${week}-${s.offset}`,
        date: date.toISOString().slice(0, 10),
        name: isCutback && s.type === 'long' ? s.name + ' (cutback)' : s.name,
        type: s.type,
        miles: rawMiles ? String(rawMiles) : '',
        notes: week === 0 ? s.notes : (isCutback ? '↓ Cutback week — let your body adapt. ' + s.notes : s.notes),
      })
    })
  }

  return workouts
}

const JOURNEY_PHASES = {
  new:      [
    { name: 'Foundation', weeks: '1–4',  color: 'var(--green)',  desc: 'Build the habit. Run/walk. 3× per week.' },
    { name: 'Consistency', weeks: '5–8', color: 'var(--blue)',   desc: 'Increase to 4× per week. First trail.' },
    { name: 'Distance',    weeks: '9–12', color: 'var(--orange)', desc: 'Long run reaches 8–10mi. First trail race.' },
    { name: 'Ultra Prep',  weeks: '13+', color: 'var(--purple)', desc: 'Back-to-backs. Race-specific training.' },
  ],
  runner: [
    { name: 'Trail Intro', weeks: '1–4',  color: 'var(--green)',  desc: 'Transition to trail. Introduce hills.' },
    { name: 'Build',       weeks: '5–8',  color: 'var(--blue)',   desc: 'Long run to 14mi. Back-to-backs start.' },
    { name: 'Peak',        weeks: '9–11', color: 'var(--orange)', desc: '20mi+ long runs. Race simulation.' },
    { name: 'Taper + Race', weeks: '12', color: 'var(--yellow)', desc: 'Race-ready. Trust your training.' },
  ],
  half: [
    { name: 'Trail Shift', weeks: '1–4',  color: 'var(--green)',  desc: 'Off the road and onto the fells. Learn to walk climbs.' },
    { name: 'Vert Build',  weeks: '5–8',  color: 'var(--blue)',   desc: 'Elevation focus. Back-to-backs. Eat on the run.' },
    { name: 'Peak Block',  weeks: '9–11', color: 'var(--orange)', desc: 'Race-pace work. Kit finalised. Night session.' },
    { name: 'Race',        weeks: '12',   color: 'var(--yellow)', desc: 'You are ready.' },
  ],
  marathon: [
    { name: 'Trail Conversion', weeks: '1–4', color: 'var(--green)',  desc: 'Your engine exists. Add trail skills and vert.' },
    { name: 'Ultra Patterns',   weeks: '5–8', color: 'var(--blue)',   desc: 'Back-to-backs. 4h+ runs. Eating systems locked in.' },
    { name: 'Race Specific',    weeks: '9–11',color: 'var(--orange)', desc: 'Simulate race conditions. Night running. Poles.' },
    { name: 'Race',             weeks: '12',  color: 'var(--yellow)', desc: 'Trust the process.' },
  ],
  trail: [
    { name: 'Base Reset', weeks: '1–3',  color: 'var(--green)',  desc: 'Recover, reset, build aerobic base.' },
    { name: 'Build',      weeks: '4–8',  color: 'var(--blue)',   desc: 'Push mileage and vert. Back-to-backs every weekend.' },
    { name: 'Peak',       weeks: '9–11', color: 'var(--orange)', desc: 'Race simulation. Night runs. Kit sorted.' },
    { name: 'Taper',      weeks: '12',   color: 'var(--yellow)', desc: "Protect what you've built." },
  ],
  ultra: [
    { name: 'Taper',      weeks: '1–3',  color: 'var(--green)',  desc: 'Tittesworth is close. Sharpen and protect.' },
    { name: '5V Build',   weeks: '4–11', color: 'var(--blue)',   desc: 'Vert-specific block for 5 Valleys.' },
    { name: 'Peak + Race', weeks: '12', color: 'var(--orange)', desc: '5 Valleys. Execute your plan.' },
    { name: 'Beyond →',   weeks: '13+', color: 'var(--purple)', desc: 'UTYD, Spine Sprint, The Lap.' },
  ],
}

const LEVEL_COACH_VOICE = {
  new:      { greeting: 'Every ultra runner started exactly where you are.',      callout: 'Your only job right now: show up consistently. Everything else follows.' },
  runner:   { greeting: "You have the fitness. Trail running is a skill — we're going to teach it to you.", callout: 'The biggest shift: learning to hike climbs and not seeing it as failure.' },
  half:     { greeting: 'Half marathon fitness is a serious platform to build from.', callout: 'The key transition: time on feet over pace. Ultras reward patience above all else.' },
  marathon: { greeting: "Your aerobic engine is your biggest asset. We don't need to rebuild it — we need to point it at the mountains.", callout: 'Back-to-back long runs are the single biggest differentiator between road marathoners and ultra runners.' },
  trail:    { greeting: 'You know how to suffer on trail. Now we make it systematic.', callout: 'The next level is ruthless consistency and race-specific vert. No junk miles.' },
  ultra:    { greeting: "You're already in the arena. This is about racing smarter and going further.", callout: 'With 5 races in 12 months, recovery is as important as the hard sessions. Protect it.' },
}

function JourneyWidget({ profile }) {
  const phases = JOURNEY_PHASES[profile.level] || JOURNEY_PHASES.runner
  const voice = LEVEL_COACH_VOICE[profile.level] || LEVEL_COACH_VOICE.runner
  const levelLabel = LEVELS.find(l => l.id === profile.level)?.label || ''

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title">Your Journey — {levelLabel} → Ultra Runner</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        {voice.greeting}
      </div>
      <div className="journey-phases">
        {phases.map((p, i) => (
          <div key={i} className="journey-phase">
            <div className="journey-phase-bar" style={{ background: p.color }} />
            <div className="journey-phase-content">
              <div className="journey-phase-name">{p.name}</div>
              <div className="journey-phase-weeks">Weeks {p.weeks}</div>
              <div className="journey-phase-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--orange-dim)', borderRadius: 8, fontSize: 13, color: 'var(--orange)', borderLeft: '3px solid var(--orange)' }}>
        {voice.callout}
      </div>
    </div>
  )
}

function OnboardingFlow({ onComplete, onSkip }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ level: null, goal: null, days: 4, gap: null, motivation: '' })

  function set(key, val) { setProfile(p => ({ ...p, [key]: val })) }
  function next() { setStep(s => s + 1) }
  function back() { setStep(s => s - 1) }

  const totalSteps = 5

  return (
    <div className="ob-overlay">
      <div className="ob-container">
        {step > 0 && (
          <div className="ob-progress-wrap">
            <div className="ob-progress-bar" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        )}

        {step === 0 && (
          <div className="ob-welcome">
            <div className="ob-logo">⚡</div>
            <h1 className="ob-title">ClaudeCoach</h1>
            <p className="ob-sub">Your AI ultra running coach. Answer five questions and we'll build your personal path to the finish line — wherever you're starting from.</p>
            <button className="btn btn-orange btn-lg" onClick={next} style={{ width: '100%', padding: '16px', fontSize: 16 }}>Let's build your plan →</button>
            {onSkip && <button onClick={onSkip} style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', padding: '8px' }}>Skip — take me to my plan</button>}
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <div className="ob-step-num">1 of 5</div>
            <div className="ob-q">Where are you right now?</div>
            <div className="ob-options">
              {LEVELS.map(l => (
                <button key={l.id} className={`ob-option ${profile.level === l.id ? 'selected' : ''}`}
                  onClick={() => { set('level', l.id); setTimeout(next, 280) }}>
                  <span className="ob-opt-icon">{l.icon}</span>
                  <div className="ob-opt-text">
                    <div className="ob-opt-label">{l.label}</div>
                    <div className="ob-opt-sub">{l.sub}</div>
                  </div>
                  {profile.level === l.id && <span className="ob-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob-step">
            <div className="ob-step-num">2 of 5</div>
            <div className="ob-q">What's the goal?</div>
            <div className="ob-options">
              {GOALS.map(g => (
                <button key={g.id} className={`ob-option ${profile.goal === g.id ? 'selected' : ''}`}
                  onClick={() => { set('goal', g.id); setTimeout(next, 280) }}>
                  <span className="ob-opt-icon">{g.icon}</span>
                  <div className="ob-opt-text">
                    <div className="ob-opt-label">{g.label}</div>
                    <div className="ob-opt-sub">{g.sub}</div>
                  </div>
                  {profile.goal === g.id && <span className="ob-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="ob-step">
            <div className="ob-step-num">3 of 5</div>
            <div className="ob-q">Training days per week?</div>
            <div className="ob-days-grid">
              {[3, 4, 5, 6].map(d => (
                <button key={d} className={`ob-day-btn ${profile.days === d ? 'selected' : ''}`}
                  onClick={() => set('days', d)}>
                  <span className="ob-day-num">{d}</span>
                  <span className="ob-day-label">{['','','','Minimum','Balanced','Committed','All in'][d]}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-orange" style={{ width: '100%', marginTop: 28, padding: 14 }} onClick={next}>Continue →</button>
          </div>
        )}

        {step === 4 && (
          <div className="ob-step">
            <div className="ob-step-num">4 of 5</div>
            <div className="ob-q">Biggest challenge right now?</div>
            <div className="ob-options">
              {GAPS.map(g => (
                <button key={g.id} className={`ob-option ${profile.gap === g.id ? 'selected' : ''}`}
                  onClick={() => { set('gap', g.id); setTimeout(next, 280) }}>
                  <span className="ob-opt-icon">{g.icon}</span>
                  <div className="ob-opt-label">{g.label}</div>
                  {profile.gap === g.id && <span className="ob-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="ob-step">
            <div className="ob-step-num">5 of 5</div>
            <div className="ob-q">Why ultra running?</div>
            <div className="ob-sub-q">Your coach uses this to keep you on track when training gets hard.</div>
            <textarea className="ob-textarea"
              placeholder="Prove to myself I can do it. Something bigger than a road race. The mountains. The community. Just to see if I can…"
              value={profile.motivation}
              onChange={e => set('motivation', e.target.value)}
              rows={4}
            />
            <button className="btn btn-orange" style={{ width: '100%', marginTop: 20, padding: 14, fontSize: 15 }}
              onClick={() => {
                const finalProfile = { ...profile, createdAt: new Date().toISOString() }
                saveProfile(finalProfile)
                onComplete(finalProfile)
              }}>
              Build my plan →
            </button>
          </div>
        )}

        {step > 1 && step < 5 && (
          <button className="ob-back" onClick={back}>← Back</button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRAVA HOOK
// ═══════════════════════════════════════════════════════════════════════════════

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || ''
const RUN_TYPES = ['Run', 'TrailRun', 'VirtualRun']

function useStrava() {
  const [auth, setAuth] = useState(null)
  const [activities, setActivities] = useState([])
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check for OAuth callback code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const scope = params.get('scope')
    if (code && scope?.includes('activity')) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      exchangeCode(code)
    } else {
      // Load from storage
      const stored = getStravaAuth()
      if (stored) {
        if (stored.expires_at * 1000 < Date.now()) {
          refreshToken(stored.refresh_token)
        } else {
          setAuth(stored)
          fetchActivities(stored.access_token)
        }
      }
    }
  }, [])

  async function exchangeCode(code) {
    setLoading(true)
    try {
      const res = await fetch(`/api/exchange-token?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const authData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        athlete: data.athlete,
      }
      saveStravaAuth(authData)
      setAuth(authData)
      setAthlete(data.athlete)
      fetchActivities(data.access_token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function refreshToken(refresh_token) {
    try {
      const res = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const stored = getStravaAuth()
      const authData = { ...stored, access_token: data.access_token, expires_at: data.expires_at }
      saveStravaAuth(authData)
      setAuth(authData)
      fetchActivities(data.access_token)
    } catch (e) {
      clearStravaAuth()
      setAuth(null)
    }
  }

  async function fetchActivities(token) {
    setLoading(true)
    try {
      const since = Math.floor((Date.now() - 365 * 24 * 3600 * 1000) / 1000)
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${since}&per_page=200`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.errors) throw new Error('Strava API error')
      const sorted = (data || []).sort((a, b) =>
        new Date(b.start_date_local) - new Date(a.start_date_local)
      )
      setActivities(sorted)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function connect() {
    if (!STRAVA_CLIENT_ID) {
      alert('Strava Client ID not configured. Add VITE_STRAVA_CLIENT_ID to your Vercel env vars.')
      return
    }
    const redirect = window.location.origin + window.location.pathname
    const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=read,activity:read`
    window.location.href = url
  }

  function disconnect() {
    clearStravaAuth()
    setAuth(null)
    setActivities([])
    setAthlete(null)
  }

  return { auth, activities, athlete, loading, error, connect, disconnect }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROACTIVE NUDGES — computed once, rendered on Home
// ═══════════════════════════════════════════════════════════════════════════════

function getNudges(activities, checkIn, nextRace, days) {
  const nudges = []
  const runs = (activities || []).filter(a => ['Run','TrailRun','Hike','VirtualRun'].includes(a.type))

  // ── Running silence (5+ days) ──
  if (runs.length > 0) {
    const lastRun = new Date(runs[0].start_date_local)
    const daysSince = Math.floor((Date.now() - lastRun) / 86400000)
    if (daysSince >= 5) {
      nudges.push({
        type: 'silence', icon: '🔇', color: 'var(--yellow)',
        title: `${daysSince} days since your last run`,
        body: `Last: "${runs[0].name}" on ${new Date(runs[0].start_date_local).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}. Resting deliberately, or drifting?`,
      })
    }
  } else {
    nudges.push({ type: 'no-data', icon: '📡', color: 'var(--blue)', title: 'No Strava data yet', body: 'Connect Strava so your coach can see what you\'ve been doing.' })
  }

  // ── Race week ──
  if (days <= 7 && days > 0 && nextRace) {
    nudges.push({
      type: 'race-week', icon: '🏁', color: 'var(--mint)',
      title: `Race week — ${nextRace.name} in ${days} day${days !== 1 ? 's' : ''}`,
      body: `Short shakeout runs only. No new sessions. Kit check tonight — poles, waterproof, headtorch, gels. The work is done.`,
    })
  }

  // ── Final sharpen (8–21 days) ──
  if (days > 7 && days <= 21 && nextRace) {
    nudges.push({
      type: 'taper', icon: '📉', color: 'var(--orange)',
      title: `${days} days to ${nextRace.shortName || nextRace.name} — taper territory`,
      body: `Volume drops 30% now. One more quality long run, then protect what you\'ve built. No heroics.`,
    })
  }

  // ── Load spike ──
  const thisWeekStart = rolling7Start()
  const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const thisWeekMi = runs.filter(a => new Date(a.start_date_local) >= thisWeekStart)
    .reduce((s,a) => s + a.distance * 0.000621371, 0)
  const lastWeekMi = runs.filter(a => {
    const d = new Date(a.start_date_local); return d >= lastWeekStart && d < thisWeekStart
  }).reduce((s,a) => s + a.distance * 0.000621371, 0)
  if (lastWeekMi > 8 && thisWeekMi > lastWeekMi * 1.5) {
    nudges.push({
      type: 'spike', icon: '📈', color: 'var(--red)',
      title: `Load spike — ${thisWeekMi.toFixed(0)} mi this week (+${Math.round((thisWeekMi/lastWeekMi-1)*100)}%)`,
      body: `Big jump in volume. Prioritise sleep, nutrition, and an extra easy day. Injury risk increases with sudden spikes.`,
    })
  }

  // ── Declining check-in trend ──
  const allCheckins = getCheckins()
  if (allCheckins.length >= 3) {
    const recent3 = allCheckins.slice(0, 3)
    const avgMot = recent3.reduce((s,c)=>s+(c.motivation||3),0)/3
    const avgLegs = recent3.reduce((s,c)=>s+(c.legs||3),0)/3
    if (avgMot < 2.5 && (checkIn?.motivation || 3) <= 2) {
      nudges.push({ type: 'mood', icon: '💙', color: 'var(--blue)', title: 'Motivation has been low for 3 weeks', body: 'Ask your coach about it — low motivation sustained is a signal, not a failure.' })
    } else if (avgLegs < 2.5 && (checkIn?.legs || 3) <= 2) {
      nudges.push({ type: 'fatigue', icon: '🦵', color: 'var(--red)', title: 'Persistent leg fatigue', body: 'Three weeks of heavy legs may mean accumulated fatigue. Consider an easy week.' })
    }
  }

  return nudges.slice(0, 3) // cap at 3
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHOE MILEAGE TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

function ShoeTracker({ activities, token }) {
  const [gear, setGear] = useState({})
  const [fetching, setFetching] = useState(false)

  // Group miles by gear_id
  const gearMiles = {}
  ;(activities || []).filter(a => a.gear_id).forEach(a => {
    gearMiles[a.gear_id] = (gearMiles[a.gear_id] || 0) + a.distance * 0.000621371
  })

  const ids = Object.keys(gearMiles)
  const maxMiles = Math.max(...Object.values(gearMiles), 1)

  useEffect(() => {
    if (!token || !ids.length) return
    const toFetch = ids.filter(id => !gear[id])
    if (!toFetch.length) return
    setFetching(true)
    Promise.all(toFetch.map(id =>
      fetch(`https://www.strava.com/api/v3/gear/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => ({ id, name: d.name || d.description || 'Unknown shoe' })).catch(() => ({ id, name: 'Unknown shoe' }))
    )).then(results => {
      const map = {}; results.forEach(r => { map[r.id] = r.name }); setGear(g => ({ ...g, ...map }))
    }).finally(() => setFetching(false))
  }, [token, ids.join(',')])

  if (!ids.length) return null

  const sorted = Object.entries(gearMiles).sort((a,b) => b[1] - a[1])

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title">👟 Shoe Mileage {fetching && <span style={{fontSize:11,color:'var(--muted)',fontWeight:400}}>Loading…</span>}</div>
      {sorted.map(([id, miles]) => (
        <div key={id} className="shoe-row">
          <div className="shoe-name">{gear[id] || '…'}</div>
          <div className="shoe-bar-wrap">
            <div className="shoe-bar" style={{ width: `${(miles/maxMiles)*100}%`,
              background: miles > 400 ? 'var(--red)' : miles > 250 ? 'var(--yellow)' : 'var(--mint)' }} />
          </div>
          <div className="shoe-miles">{Math.round(miles)} mi</div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Red = replace soon (400+ mi) · Based on last 12 months</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR ICS EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

function exportToICS(workouts) {
  const esc = s => (s || '').replace(/[,;\\]/g, c => '\\' + c).replace(/\n/g, '\\n')
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ClaudeCoach//Ultra Training//EN','CALSCALE:GREGORIAN',
  ]
  workouts.filter(w => w.name && w.date).forEach(w => {
    const dt = w.date.replace(/-/g, '')
    const nextDay = new Date(w.date); nextDay.setDate(nextDay.getDate() + 1)
    const dtEnd = nextDay.toISOString().slice(0,10).replace(/-/g,'')
    const summary = esc(`${w.name}${w.miles ? ` — ${w.miles}mi` : ''}${w.isRace ? ' 🏁' : ''}`)
    const desc = esc(w.notes || '')
    lines.push('BEGIN:VEVENT',`UID:${w.id}@claudecoach`,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${dtEnd}`,`SUMMARY:${summary}`,desc ? `DESCRIPTION:${desc}` : '','END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.filter(Boolean).join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'claudecoach-training.ics'
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════════
// COACH'S BRIEF
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// RACE INTELLIGENCE HUB
// ═══════════════════════════════════════════════════════════════════════════════

function RaceIntelHub({ race, onClose }) {
  const [view, setView] = useState('strategy')
  const [hiveQuery, setHiveQuery] = useState('')
  const [hiveAnswer, setHiveAnswer] = useState(null)
  const [hiveLoading, setHiveLoading] = useState(false)
  const [hiveError, setHiveError] = useState(null)
  const intel = race.intel
  if (!intel) return null

  const tabs = [
    { id: 'strategy', label: '🗺 Strategy' },
    { id: 'pacing',   label: '⏱ Pacing' },
    { id: 'fuel',     label: '⚡ Fuel' },
    { id: 'raceday',  label: '📋 Race Day' },
    { id: 'kit',      label: '🎒 Kit' },
    { id: 'hive',     label: '🐝 Hive' },
  ]

  const HIVE_PROMPTS = [
    "What do women who've done the Spine say about feet?",
    "Best nutrition strategy for a 50k ultra?",
    "How do experienced runners handle sleep deprivation?",
    "What kit do Spine runners recommend?",
    "How to train for a big ultra alongside a full-time job?",
    "What races do people recommend as prep for the Spine?",
  ]

  async function askHive(q) {
    const question = q || hiveQuery
    if (!question.trim()) return
    setHiveLoading(true)
    setHiveAnswer(null)
    setHiveError(null)
    try {
      const resp = await fetch('/api/hive-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, race: { name: race.name, distanceMi: race.distanceMi, elevationFt: race.elevationFt, location: race.location, date: race.date } })
      })
      const data = await resp.json()
      if (data.error) throw new Error(data.error)
      setHiveAnswer({ text: data.answer, sourceCount: data.sourceCount })
    } catch (err) {
      setHiveError("Couldn't reach the hive right now. Try again.")
    } finally {
      setHiveLoading(false)
    }
  }

  return (
    <div className="intel-overlay">
      <div className="intel-container">
        <div className="intel-header">
          <div>
            <div className="intel-title">🏔 Race Intelligence</div>
            <div className="intel-subtitle">{race.name} · {formatDate(race.date)} · {daysUntil(race.date)} days</div>
          </div>
          <button className="intel-close" onClick={onClose}>✕</button>
        </div>

        <div className="intel-target">
          <div className="intel-target-label">Target Finish</div>
          <div className="intel-target-times">
            <div className="intel-time-box optimistic"><span>{intel.targetFinish.optimistic}</span><span className="intel-time-lbl">Best case</span></div>
            <div className="intel-time-box realistic active"><span>{intel.targetFinish.realistic}</span><span className="intel-time-lbl">Realistic</span></div>
            <div className="intel-time-box conservative"><span>{intel.targetFinish.conservative}</span><span className="intel-time-lbl">Safe finish</span></div>
          </div>
        </div>

        <div className="intel-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`intel-tab ${view === t.id ? 'active' : ''}`} onClick={() => setView(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="intel-body">
          {view === 'strategy' && (
            <div>
              <div className="intel-section-title">Race Strategy</div>
              <div className="intel-prose" dangerouslySetInnerHTML={{ __html: race.raceStrategy }} />
              <div className="intel-risk">
                <span className="intel-risk-icon">⚠️</span>
                <div>
                  <div className="intel-risk-title">Biggest Risk</div>
                  <div className="intel-risk-body">{race.keyRisk}</div>
                </div>
              </div>
              <div className="intel-section-title" style={{ marginTop: 20 }}>Aid Stations</div>
              {intel.aidStations.map((a, i) => (
                <div key={i} className="intel-aid">
                  <div className="intel-aid-header">
                    <span className="intel-aid-name">{a.name}</span>
                    <span className="intel-aid-mile">Mile {a.mile}</span>
                  </div>
                  <div className="intel-aid-notes">{a.notes}</div>
                </div>
              ))}
            </div>
          )}

          {view === 'pacing' && (
            <div>
              <div className="intel-section-title">Pacing Plan</div>
              <div className="intel-pacing-note">Based on {intel.targetFinish.realistic} realistic target. Walk all climbs over ~12% grade throughout.</div>
              {intel.pacingSections.map((p, i) => (
                <div key={i} className="intel-pace-block">
                  <div className="intel-pace-header">
                    <div>
                      <div className="intel-pace-section">{p.section}</div>
                      <div className="intel-pace-label">{p.label}</div>
                    </div>
                    <div className="intel-pace-right">
                      <div className="intel-pace-time">{p.targetTime}</div>
                      <div className={`intel-pace-effort ${p.effort === 'Zone 2' ? 'z2' : p.effort === 'Everything left' ? 'max' : 'managed'}`}>{p.effort}</div>
                    </div>
                  </div>
                  <div className="intel-pace-cue">"{p.cue}"</div>
                </div>
              ))}
            </div>
          )}

          {view === 'fuel' && (
            <div>
              <div className="intel-section-title">Fuel Plan</div>
              <div className="intel-pacing-note">Target 60–80g carbs/hour from mile 5. Total ~1,800–2,200 cals during race. Never skip a feed.</div>
              {intel.fuelPlan.map((f, i) => (
                <div key={i} className="intel-fuel-row">
                  <div className="intel-fuel-left">
                    <div className="intel-fuel-milestone">{f.milestone}</div>
                    <div className="intel-fuel-timing">{f.timing}</div>
                  </div>
                  <div className="intel-fuel-mid">
                    <div className="intel-fuel-what">{f.what}</div>
                    <div className="intel-fuel-note">{f.note}</div>
                  </div>
                  <div className="intel-fuel-cals">{f.cals} cal</div>
                </div>
              ))}
            </div>
          )}

          {view === 'raceday' && (
            <div>
              <div className="intel-section-title">Race Day Timeline</div>
              <div className="intel-pacing-note">Race start: 08:30. Everything should be packed the night before.</div>
              {intel.raceDayTimeline.map((t, i) => (
                <div key={i} className={`intel-timeline-row ${t.time === '08:30' ? 'race-start' : ''}`}>
                  <div className="intel-timeline-time">{t.time}</div>
                  <div className="intel-timeline-content">
                    <div className="intel-timeline-label">{t.label}</div>
                    <div className="intel-timeline-detail">{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'kit' && (
            <div>
              <div className="intel-section-title">Kit List</div>
              <div className="intel-pacing-note">Mandatory items will be checked at registration. Lay everything out tonight.</div>
              <div className="intel-kit-mandatory-label">MANDATORY</div>
              {intel.kitList.filter(k => k.mandatory).map((k, i) => (
                <div key={i} className="intel-kit-row mandatory">
                  <div className="intel-kit-dot mandatory" />
                  <div>
                    <div className="intel-kit-item">{k.item}</div>
                    <div className="intel-kit-note">{k.note}</div>
                  </div>
                </div>
              ))}
              <div className="intel-kit-mandatory-label" style={{ marginTop: 16 }}>RECOMMENDED</div>
              {intel.kitList.filter(k => !k.mandatory).map((k, i) => (
                <div key={i} className="intel-kit-row">
                  <div className="intel-kit-dot" />
                  <div>
                    <div className="intel-kit-item">{k.item}</div>
                    <div className="intel-kit-note">{k.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'hive' && (
            <div>
              <div className="intel-section-title">Ask the Hive</div>
              <div className="intel-pacing-note">Synthesised from your Women's Spine Support Group, Sprint Chat, Nutrition, Feet, Training & more — real talk from women who've done it.</div>

              <div className="hive-input-row">
                <input
                  className="hive-input"
                  type="text"
                  placeholder="Ask your community anything..."
                  value={hiveQuery}
                  onChange={e => setHiveQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askHive()}
                />
                <button className="hive-ask-btn" onClick={() => askHive()} disabled={hiveLoading || !hiveQuery.trim()}>
                  {hiveLoading ? '...' : '🐝'}
                </button>
              </div>

              <div className="hive-prompts">
                {HIVE_PROMPTS.map((p, i) => (
                  <button key={i} className="hive-prompt-chip" onClick={() => { setHiveQuery(p); askHive(p) }}>
                    {p}
                  </button>
                ))}
              </div>

              {hiveLoading && (
                <div className="hive-loading">
                  <div className="hive-loading-dots"><span /><span /><span /></div>
                  <div className="hive-loading-text">Consulting the hive...</div>
                </div>
              )}

              {hiveError && (
                <div className="hive-error">{hiveError}</div>
              )}

              {hiveAnswer && !hiveLoading && (
                <div className="hive-answer">
                  <div className="hive-answer-header">
                    <span className="hive-bee">🐝</span>
                    <span className="hive-answer-label">Hive says</span>
                    <span className="hive-source-count">{hiveAnswer.sourceCount} community messages</span>
                  </div>
                  <div className="hive-answer-text">{hiveAnswer.text}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getCoachBrief(activities) {
  const now = new Date()
  const nextRace = RACES.find(r => daysUntil(r.date) > 0) || RACES[RACES.length - 1]
  const days = daysUntil(nextRace.date)
  const runs = activities.filter(a => RUN_TYPES.includes(a.type))
  const weekMiles = runs
    .filter(a => new Date(a.start_date_local) >= rolling7Start())
    .reduce((s, a) => s + a.distance * 0.000621371, 0)
  const monthMiles = runs
    .filter(a => new Date(a.start_date_local) >= new Date(now.getFullYear(), now.getMonth(), 1))
    .reduce((s, a) => s + a.distance * 0.000621371, 0)

  // Determine phase and brief content
  if (nextRace.id === 'tittesworth' && days <= 23) {
    return {
      phase: 'Final Sharpen Phase',
      title: `${days} days to Tittesworth. Protect the fitness you\'ve built.`,
      body: `The hay is in the barn. Nothing you do in the next ${days} days will meaningfully change your fitness — but plenty could harm it. Your job now is to <strong>arrive at the start line fresh, confident, and ready to execute</strong>.\n\nFocus this week: one more quality long effort with vert (12–14 miles, 2,000ft+), then taper. Keep the legs moving but reduce volume. Get your race kit organised now — don't leave it to the morning. Sleep, eat well, trust the training.`,
      focuses: [
        { icon: '🏔', bg: 'var(--orange-dim)', title: 'One more vert run', desc: 'Forest of Bowland or Pendle. 12–14 miles, 2,000ft+. Keep the effort easy — this is a confidence run, not a fitness run.' },
        { icon: '⚡', bg: 'var(--yellow-dim)', title: 'Strides, not sessions', desc: '8×20 sec at 5k effort, 90 sec recovery. Wake the neuromuscular system without creating fatigue.' },
        { icon: '🎒', bg: 'var(--blue-dim)', title: 'Kit sorted this weekend', desc: 'Lay everything out. Food, poles, waterproofs, headtorch. Weigh it. Know your drop bags. Zero surprises race morning.' },
      ],
    }
  }
  if (nextRace.id === '5valleys') {
    return {
      phase: 'Build Phase — 5 Valleys Block',
      title: `${days} days to 5 Valleys. This is your hardest race — train accordingly.`,
      body: `5 Valleys is the hardest race per mile in your calendar and it demands specific preparation. The relentless short-sharp climbing pattern means <strong>vert exposure matters more than pure mileage</strong>.\n\nThis week, prioritise getting vertical feet in. If you can only travel to Winter Hill or Billinge Hill — go there. Back-to-back long runs are your secret weapon for 5 Valleys — they train the specific fatigue pattern the race creates.`,
      focuses: [
        { icon: '🏔', bg: 'var(--orange-dim)', title: 'Accumulate vert this week', desc: 'Winter Hill, Pendle, or Billinge. Every metre of vertical gain in training counts for 5 Valleys.' },
        { icon: '🔁', bg: 'var(--blue-dim)', title: 'Back-to-back this weekend', desc: 'Sat 15–16 miles / Sun 8–10 miles. Different paces, same principle: train on tired legs.' },
        { icon: '💪', bg: 'var(--green-dim)', title: 'Posterior chain S&C', desc: 'Romanian deadlifts and hip thrusts — your climbing muscles. Twice this week, heavy, controlled.' },
      ],
    }
  }

  // Generic brief
  const weekStr = weekMiles > 0 ? `You've covered ${weekMiles.toFixed(1)} miles this week` : 'Start your week strong'
  return {
    phase: `${nextRace.name} Training Block`,
    title: `${days} days to ${nextRace.shortName}. ${weekStr}.`,
    body: `You're in the main training block for ${nextRace.name}. The focus right now is building the specific fitness, resilience, and skills this race demands. Stay consistent, train smart, and trust the process.\n\nThis week: long run with vert, one quality session, S&C twice. Keep the easy days easy — the work happens when you recover, not when you run.`,
    focuses: [
      { icon: '🏃', bg: 'var(--orange-dim)', title: 'Long run this weekend', desc: `Build towards the demands of ${nextRace.name}. Prioritise time on feet and vert over pace.` },
      { icon: '💪', bg: 'var(--blue-dim)', title: 'S&C twice this week', desc: 'Session A and B. Non-negotiable — strength training is what keeps you injury free across a full racing season.' },
      { icon: '🧭', bg: 'var(--green-dim)', title: 'Skill focus', desc: nextRace.id === 'utyd' || nextRace.id === 'spine' ? 'Navigation practice. Get out with map and compass on unfamiliar ground.' : 'Vert training. Every hill session now builds for race day.' },
    ],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: BRIEF
// ═══════════════════════════════════════════════════════════════════════════════

function getRaceBrain(activities, checkIn) {
  const nextRace = RACES.find(r => daysUntil(r.date) > 0) || RACES[RACES.length - 1]
  const days = daysUntil(nextRace.date)
  const runs = activities.filter(a => RUN_TYPES.includes(a.type))

  // Rolling 7-day mileage
  const rolling7Miles = runs
    .filter(a => new Date(a.start_date_local) >= rolling7Start())
    .reduce((s, a) => s + a.distance * 0.000621371, 0)

  // Recent training signal (14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000)
  const recentRuns = runs.filter(a => new Date(a.start_date_local) >= twoWeeksAgo)
  const recentMiles = recentRuns.reduce((s, a) => s + a.distance * 0.000621371, 0)

  // Check-in signal
  const legs = checkIn?.legs || 3
  const sleep = checkIn?.sleep || 3
  const stress = checkIn?.stress || 3
  const niggles = checkIn?.niggles || ''
  const hasNiggle = niggles.trim().length > 0

  // Readiness logic
  let readiness
  if (days <= 0) {
    readiness = { level: 'done', label: 'RACE COMPLETE', color: 'var(--green)', bg: 'var(--green-dim)' }
  } else if (hasNiggle) {
    readiness = { level: 'watchout', label: 'WATCH YOUR BODY', color: 'var(--red)', bg: 'var(--red-dim)' }
  } else if (legs <= 2 && sleep <= 2) {
    readiness = { level: 'watchout', label: 'RECOVERY DAY', color: 'var(--red)', bg: 'var(--red-dim)' }
  } else if (legs <= 2 || sleep <= 2 || stress >= 4) {
    readiness = { level: 'nearly', label: 'BUILDING WELL', color: 'var(--yellow)', bg: 'var(--yellow-dim)' }
  } else if (days <= 7) {
    readiness = { level: 'taper', label: 'RACE WEEK — STAY FRESH', color: 'var(--orange)', bg: 'var(--orange-dim)' }
  } else {
    readiness = { level: 'ready', label: 'YOU ARE READY', color: 'var(--green)', bg: 'var(--green-dim)' }
  }

  // Focus / Risk / Ignore — phase-aware
  let focus, risk, ignore
  if (days <= 7) {
    focus = 'Short shakeout run only — protect your legs'
    risk = hasNiggle ? niggles : 'Getting talked into one more long run'
    ignore = 'Your Strava stats'
  } else if (days <= 21) {
    focus = 'One more quality vert run, then taper'
    risk = hasNiggle ? niggles : (checkIn?.fuel < 3 ? 'Fuel — practice your race nutrition this weekend' : 'Last-minute mileage panic')
    ignore = 'Adding more miles — the hay is in the barn'
  } else if (days <= 60) {
    focus = recentMiles < 20 ? 'Build consistency — 4 runs this week' : 'Long run with vert this weekend'
    risk = hasNiggle ? niggles : (stress >= 4 ? 'Life stress — protect sleep and recovery' : 'Skipping the long run')
    ignore = 'Pace — all runs easy until race week'
  } else {
    focus = 'Base building — time on feet, not speed'
    risk = hasNiggle ? niggles : 'Doing too much too soon'
    ignore = 'Race-specific training for now'
  }

  return { nextRace, days, readiness, focus, risk, ignore, recentMiles, rolling7Miles, recentRuns: recentRuns.length }
}

function BriefSection({ strava, profile, onCheckinSave, onNavigate }) {
  const { auth, activities, athlete, loading, connect, disconnect } = strava
  const brief = getCoachBrief(activities)
  const checkIn = getLatestCheckin()
  const brain = getRaceBrain(activities, checkIn)
  const { nextRace, days, readiness, focus, risk, ignore } = brain
  const runs = activities.filter(a => RUN_TYPES.includes(a.type))
  const [showIntel, setShowIntel] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  // Proactive nudges
  const nudges = getNudges(activities, checkIn, nextRace, days)

  // Post-race debrief prompt — any planned race passed in last 5 days
  const today = new Date()
  const recentlyCompletedRace = RACES.find(r => {
    const d = new Date(r.date)
    const daysSince = (today - d) / 86400000
    return daysSince >= 0 && daysSince <= 5
  })

  const firstName = athlete?.firstname || profile?.name || 'Coach'
  const weekMiles = brain.rolling7Miles  // rolling 7 days — same value coach sees
  const monthMiles = runs
    .filter(a => new Date(a.start_date_local) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((s, a) => s + a.distance * 0.000621371, 0)
  const totalElev = runs.reduce((s, a) => s + (a.total_elevation_gain || 0), 0)

  // Post-race recovery detection — Strava race type or manual race tag in last 10 days
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000)
  const recentStravaRace = activities.find(a =>
    a.workout_type === 1 && new Date(a.start_date_local) >= tenDaysAgo
  )
  const recentManualRace = getWorkouts().find(w =>
    w.isRace && new Date(w.date) >= tenDaysAgo
  )
  const recentRaceEvent = recentStravaRace || recentManualRace
  const recoveryDaysLeft = recentRaceEvent ? Math.max(0, 7 - Math.floor(
    (Date.now() - new Date(recentRaceEvent.start_date_local || recentRaceEvent.date)) / 86400000
  )) : 0

  return (
    <div>
      {showIntel && <RaceIntelHub race={nextRace} onClose={() => setShowIntel(false)} />}

      {/* ── POST-RACE RECOVERY BANNER ── */}
      {recentRaceEvent && recoveryDaysLeft > 0 && (
        <div style={{
          background: 'var(--card2)', border: '1.5px solid var(--mint)', borderRadius: 12,
          padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 24 }}>🛌</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Recovery week — {recoveryDaysLeft} day{recoveryDaysLeft !== 1 ? 's' : ''} left</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              You raced {recentRaceEvent.name || 'recently'}. Sleep, eat, walk. No sessions over 60 mins. Your fitness is safe.
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>
            RECOVERY<br />MODE
          </div>
        </div>
      )}

      {/* ── POST-RACE DEBRIEF PROMPT ── */}
      {recentlyCompletedRace && (
        <div className="nudge-card nudge-mint" onClick={() => onNavigate && onNavigate('journal')}>
          <span className="nudge-icon">✍️</span>
          <div style={{ flex: 1 }}>
            <div className="nudge-title">Time to debrief — how did {recentlyCompletedRace.shortName} go?</div>
            <div className="nudge-body">Write while it's fresh. Every lesson from {recentlyCompletedRace.name} goes into your Ultra Memory. Tap to open Journal →</div>
          </div>
        </div>
      )}

      {/* ── RACE DAY PREP CARD (≤30 days) ── */}
      {nextRace?.intel && days > 0 && days <= 30 && !recentlyCompletedRace && (
        <div className="nudge-card nudge-race" style={{ borderColor: nextRace.color }} onClick={() => setShowIntel(true)}>
          <span className="nudge-icon">{days <= 7 ? '🏁' : '📋'}</span>
          <div style={{ flex: 1 }}>
            <div className="nudge-title">{days <= 7 ? `Race week — ${days}d to ${nextRace.shortName}` : `${days} days — review your ${nextRace.shortName} plan`}</div>
            <div className="nudge-body">
              {days <= 7
                ? `Pacing: ${nextRace.intel.pacingSections[0]?.effort} for the first ${nextRace.intel.pacingSections[0]?.section}. Target: ${nextRace.intel.targetFinish?.realistic}. Open Race Intel to review.`
                : `Aid stations, pacing splits, fuel plan, kit list — everything you need in one place. Tap to open.`}
            </div>
          </div>
          <span style={{ fontSize: 11, color: nextRace.color, fontWeight: 700, flexShrink: 0 }}>Intel →</span>
        </div>
      )}

      {/* ── PROACTIVE NUDGES ── */}
      {nudges.map((n, i) => (
        <div key={i} className="nudge-card" style={{ borderLeftColor: n.color }}>
          <span className="nudge-icon">{n.icon}</span>
          <div style={{ flex: 1 }}>
            <div className="nudge-title">{n.title}</div>
            <div className="nudge-body">{n.body}</div>
          </div>
        </div>
      ))}

      {/* ── RACE BRAIN HERO ── */}
      <div className="rb-hero">
        <div className="rb-hero-top">
          <div className="rb-greeting">Hi {firstName} 👋</div>
          <div className="rb-race-name">{nextRace.name}</div>
          <div className="rb-race-meta">{nextRace.distanceMi} miles · {nextRace.elevationFt.toLocaleString()}ft · {nextRace.location}</div>
        </div>

        <div className="rb-middle">
          <div className="rb-countdown">
            <div className="rb-days">{days > 0 ? days : '🏁'}</div>
            <div className="rb-days-label">{days > 0 ? 'days to go' : 'Race day!'}</div>
          </div>
          <div className="rb-readiness" style={{ background: readiness.bg, borderColor: readiness.color }}>
            <div className="rb-readiness-dot" style={{ background: readiness.color }} />
            <div className="rb-readiness-label" style={{ color: readiness.color }}>{readiness.label}</div>
          </div>
        </div>

        <div className="rb-signals">
          <div className="rb-signal">
            <div className="rb-signal-key">Focus</div>
            <div className="rb-signal-val">{focus}</div>
          </div>
          <div className="rb-signal rb-signal-risk">
            <div className="rb-signal-key">Risk</div>
            <div className="rb-signal-val">{risk}</div>
          </div>
          <div className="rb-signal rb-signal-ignore">
            <div className="rb-signal-key">Ignore</div>
            <div className="rb-signal-val">{ignore}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rb-actions">
          {nextRace.intel && days > 0 && (
            <button className="rb-action-btn rb-action-primary" onClick={() => setShowIntel(true)}>
              Race Intel →
            </button>
          )}
          <button className="rb-action-btn" onClick={() => setShowDetail(d => !d)}>
            {showDetail ? 'Less ↑' : 'Full brief ↓'}
          </button>
        </div>
      </div>

      {/* ── CHECK-IN ── */}
      <CheckInWidget onCheckinSave={onCheckinSave} />

      {/* ── FULL BRIEF (expandable) ── */}
      {showDetail && (
        <div className="brief-header" style={{ marginBottom: 16 }}>
          <div className="brief-phase">{brief.phase}</div>
          <div className="brief-title">{brief.title}</div>
          <div className="brief-body" dangerouslySetInnerHTML={{ __html: brief.body.replace(/\n/g, '<br/>') }} />
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {brief.focuses.map((f, i) => (
              <div key={i} className="focus-item">
                <div className="focus-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="focus-content">
                  <div className="focus-title">{f.title}</div>
                  <div className="focus-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONNECT STRAVA ── */}
      {!auth && (
        <div className="connect-banner">
          <div style={{ fontSize: 36 }}>🔗</div>
          <div className="connect-text">
            <div className="connect-title">Connect Strava</div>
            <div className="connect-desc">Live training data makes every signal smarter.</div>
          </div>
          <button className="btn btn-orange" onClick={connect}>Connect Strava</button>
        </div>
      )}

      {/* ── STATS ── */}
      {auth && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--mint)' }}>{weekMiles.toFixed(1)}</div>
            <div className="stat-label">Miles (last 7 days)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{monthMiles.toFixed(1)}</div>
            <div className="stat-label">Miles this month</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{runs.length}</div>
            <div className="stat-label">Runs (12 months)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{metersToFt(totalElev).toLocaleString()}</div>
            <div className="stat-label">Total vert (ft)</div>
          </div>
        </div>
      )}

      {/* ── SHOE MILEAGE ── */}
      {auth && <ShoeTracker activities={activities} token={auth.access_token} />}

      {/* ── RACE CALENDAR ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Race Calendar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RACES.map(r => {
            const d = daysUntil(r.date)
            const isNext = r.id === nextRace.id
            return (
              <div key={r.id} className={`race-card ${isNext ? 'next-race' : ''}`}
                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'default' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDate(r.date)} · {r.distanceMi} mi · {r.elevationFt.toLocaleString()}ft</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {d > 0 ? (
                    <>
                      <div style={{ fontSize: 22, fontWeight: 800, color: isNext ? 'var(--orange)' : 'var(--text)' }}>{d}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>days</div>
                    </>
                  ) : (
                    <span className="badge badge-green">Done ✓</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RECENT ACTIVITIES ── */}
      {auth && (
        <div className="card">
          <div className="card-title">Recent Activities</div>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-line wide" />
                    <div className="skeleton skeleton-line short" />
                  </div>
                  <div className="skeleton" style={{ width: 52, height: 36, borderRadius: 6 }} />
                </div>
              ))}
            </div>
          )}
          {!loading && activities.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 0' }}>No activities found.</div>
          )}
          {activities.slice(0, 6).map(a => {
            const isTrail = a.type === 'TrailRun'
            const isRun = RUN_TYPES.includes(a.type)
            const icon = isTrail ? '🏔' : isRun ? '🏃' : '🏋'
            const dist = a.distance >= 300 ? `${(a.distance * 0.000621371).toFixed(1)} mi` : `${Math.round(a.distance)} m`
            const pace = isRun && a.average_speed > 0.5 ? mpsToMinMile(a.average_speed) : null
            return (
              <div key={a.id} className="activity-item">
                <div className="act-icon">{icon}</div>
                <div className="act-info">
                  <div className="act-name">{a.name}</div>
                  <div className="act-meta">
                    {new Date(a.start_date_local).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {a.type}
                    {a.total_elevation_gain > 50 ? ` · ${metersToFt(a.total_elevation_gain)}ft ↑` : ''}
                  </div>
                </div>
                <div>
                  <div className="act-stat">{dist}</div>
                  {pace && <div className="act-pace">{pace}</div>}
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={disconnect} style={{ fontSize: 12, padding: '6px 14px' }}>
              Disconnect Strava
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: RACES
// ═══════════════════════════════════════════════════════════════════════════════

function RacesSection() {
  const [selected, setSelected] = useState('tittesworth')
  const race = RACES.find(r => r.id === selected)
  const [openPhase, setOpenPhase] = useState(0)

  const difficultyLabel = ['', 'Beginner', 'Moderate', 'Challenging', 'Hard', 'Expert'][race.difficulty]

  return (
    <div>
      <div className="section-title">Race Plans</div>
      <div className="section-sub">Phase-by-phase coaching for all five races</div>

      <div className="race-selector">
        {RACES.map(r => (
          <div key={r.id} className={`race-pill ${selected === r.id ? 'active' : ''}`} onClick={() => { setSelected(r.id); setOpenPhase(0) }}>
            <div className="race-pill-name" style={{ color: selected === r.id ? 'var(--orange)' : 'var(--text)' }}>{r.shortName}</div>
            <div className="race-pill-date">{formatDate(r.date)}</div>
          </div>
        ))}
      </div>

      {/* Race header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{race.name}</span>
              <span className="badge badge-orange">{race.type}</span>
              <span className={`badge ${race.difficulty >= 5 ? 'badge-red' : race.difficulty >= 4 ? 'badge-yellow' : 'badge-green'}`}>
                {difficultyLabel}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>📍 {race.location} · {formatDate(race.date)}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 680 }}>{race.description}</div>
          </div>
          <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
            <div className="race-stat">
              <div className="race-stat-val">{race.distanceMi}</div>
              <div className="race-stat-lbl">Miles</div>
            </div>
            <div className="race-stat">
              <div className="race-stat-val">{race.elevationFt.toLocaleString()}</div>
              <div className="race-stat-lbl">Feet ↑</div>
            </div>
            <div className="race-stat">
              <div className="race-stat-val" style={{ color: daysUntil(race.date) > 0 ? 'var(--orange)' : 'var(--green)' }}>
                {daysUntil(race.date) > 0 ? daysUntil(race.date) : '✓'}
              </div>
              <div className="race-stat-lbl">{daysUntil(race.date) > 0 ? 'Days' : 'Done'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Training phases */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Training Phases</div>
          {race.phases.map((phase, i) => (
            <div key={i} className="phase-block">
              <div className="phase-header" onClick={() => setOpenPhase(openPhase === i ? -1 : i)}>
                <div>
                  <div className="phase-name">{phase.name}</div>
                  <div className="phase-weeks">{phase.weeks}</div>
                  <div className="phase-focus">{phase.focus}</div>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 18 }}>{openPhase === i ? '−' : '+'}</span>
              </div>
              {openPhase === i && (
                <div className="phase-body">
                  {phase.sessions.map((s, j) => (
                    <div key={j} className="session-item">
                      <div className="session-bullet" />
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>{s}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right column */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Race Strategy</div>
          <div className="strategy-block" dangerouslySetInnerHTML={{ __html: race.raceStrategy }} style={{ marginBottom: 16 }} />

          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Kit List</div>
          <div className="kit-grid" style={{ marginBottom: 16 }}>
            {race.kitList.map((k, i) => <div key={i} className="kit-item">{k}</div>)}
          </div>

          <div className="risk-block">
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 13 }}>Key Risk</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{race.keyRisk}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: TRAINING
// ═══════════════════════════════════════════════════════════════════════════════

function FourWeekView({ workouts, activities }) {
  const today = new Date()
  const runs = activities.filter(a => ['Run','TrailRun','Hike','VirtualRun'].includes(a.type))
  const weeks = []
  for (let w = 0; w < 4; w++) {
    const mon = getMonday(w)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const weekDays = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(mon); day.setDate(mon.getDate() + d)
      const ds = isoDate(day)
      weekDays.push({
        date: ds,
        label: day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        isToday: ds === isoDate(today),
        planned: workouts.filter(w => w.date === ds),
        actual: runs.filter(a => a.start_date_local?.slice(0,10) === ds),
      })
    }
    const weekMi = weekDays.reduce((s, d) => s + d.actual.reduce((ss, a) => ss + a.distance * 0.000621371, 0), 0)
    const plannedMi = weekDays.reduce((s, d) => s + d.planned.reduce((ss, w) => ss + parseFloat(w.miles || 0), 0), 0)
    weeks.push({ label: `${mon.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – ${sun.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`, days: weekDays, weekMi, plannedMi, isCurrentWeek: w === 0 })
  }

  const typeColor = { easy: 'var(--blue)', long: 'var(--mint)', trail: 'var(--mint)', interval: 'var(--yellow)', rest: 'var(--muted)' }

  return (
    <div className="four-week-grid">
      {weeks.map((week, wi) => (
        <div key={wi} className={`fw-week ${week.isCurrentWeek ? 'current' : ''}`}>
          <div className="fw-week-header">
            <span className="fw-week-label">{week.isCurrentWeek ? 'This week' : `Week ${wi + 1}`} · {week.label}</span>
            <span className="fw-week-miles">
              {week.weekMi > 0 ? <span style={{color:'var(--mint)'}}>{week.weekMi.toFixed(0)} mi done</span> : null}
              {week.plannedMi > 0 && week.weekMi === 0 && <span style={{color:'var(--muted)'}}>{week.plannedMi.toFixed(0)} mi planned</span>}
            </span>
          </div>
          {week.days.filter(d => d.planned.length > 0 || d.actual.length > 0).map(d => (
            <div key={d.date} className={`fw-day ${d.isToday ? 'today' : ''}`}>
              <div className="fw-day-label">{d.label}</div>
              <div className="fw-day-sessions">
                {d.actual.map((a, i) => (
                  <div key={i} className="fw-session actual">
                    {a.type === 'TrailRun' ? '🏔' : '🏃'} {(a.distance*0.000621371).toFixed(1)}mi
                    {a.total_elevation_gain > 50 ? ` · ${Math.round(a.total_elevation_gain * 3.28084)}ft` : ''}
                  </div>
                ))}
                {d.actual.length === 0 && d.planned.map((p, i) => (
                  <div key={i} className="fw-session planned" style={{borderLeftColor: typeColor[p.type] || 'var(--muted)'}}>
                    {p.isRace ? '🏁' : ''} {p.name}{p.miles ? ` · ${p.miles}mi` : ''}
                  </div>
                ))}
                {d.actual.length > 0 && d.planned.length > 0 && d.planned.map((p, i) => (
                  <div key={i} className="fw-session planned dim">
                    <span style={{textDecoration:'line-through',opacity:0.4}}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {week.days.every(d => d.planned.length === 0 && d.actual.length === 0) && (
            <div style={{fontSize:12, color:'var(--muted)', padding:'8px 12px'}}>No sessions planned this week</div>
          )}
        </div>
      ))}
    </div>
  )
}

function TrainingSection({ activities, hevyWorkouts = [], hevyKey = '', setHevyKey, hevyLoading = false }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [workouts, setWorkouts] = useState(getWorkouts())
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'easy', miles: '', notes: '' })
  const [calView, setCalView] = useState('week') // 'week' | '4week'

  // Auto-seed plan if calendar is empty
  useEffect(() => {
    if (workouts.length === 0) {
      const plan = getTittesworthPlan()
      saveWorkouts(plan)
      setWorkouts(plan)
    }
  }, [])

  function loadPlan() {
    if (!confirm('This will add your Tittesworth taper + 5 Valleys build schedule to your calendar. Existing workouts are kept. Continue?')) return
    const existing = workouts.map(w => w.id)
    const newOnes = getTittesworthPlan().filter(p => !existing.includes(p.id))
    const updated = [...workouts, ...newOnes]
    saveWorkouts(updated)
    setWorkouts(updated)
  }

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const monday = getMonday(weekOffset)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  const today = isoDate(new Date())
  const runs = activities.filter(a => RUN_TYPES.includes(a.type))

  function openAdd(dateStr) {
    setModal(dateStr)
    setForm({ name: '', type: 'easy', miles: '', elevFt: '', notes: '', isRace: false, date: dateStr })
  }

  function saveWorkout() {
    if (!form.name) return
    const updated = [...workouts, { id: Date.now().toString(), ...form }]
    saveWorkouts(updated)
    setWorkouts(updated)
    setModal(null)
  }

  function removeWorkout(id) {
    if (!confirm('Remove this workout?')) return
    const updated = workouts.filter(w => w.id !== id)
    saveWorkouts(updated)
    setWorkouts(updated)
  }

  const typeColors = { easy: 'ev-planned', tempo: 'ev-strava', interval: 'ev-strava', long: 'ev-planned', trail: 'ev-trail', rest: 'ev-rest' }

  return (
    <div>
      <div className="section-title">Training Calendar</div>
      <div className="section-sub">Schedule workouts, Strava runs, and Hevy strength sessions</div>

      {/* Hevy — silent indicator only, connect via ⚙️ Settings */}
      {hevyKey && hevyLoading && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>🏋️ Syncing Hevy…</div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-orange" onClick={loadPlan} style={{ fontSize: 13 }}>📅 Load Training Plan</button>
        <button className="btn btn-ghost" onClick={() => exportToICS(workouts)} style={{ fontSize: 13 }}>
          📆 Export to Calendar
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className={`btn ${calView === 'week' ? 'btn-orange' : 'btn-ghost'}`} style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setCalView('week')}>Week</button>
          <button className={`btn ${calView === '4week' ? 'btn-orange' : 'btn-ghost'}`} style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setCalView('4week')}>4 weeks</button>
        </div>
      </div>

      {calView === '4week' && <FourWeekView workouts={workouts} activities={activities} />}

      {calView === 'week' && <div className="card">
        <div className="week-nav">
          <button className="week-nav-btn" onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
          <span className="week-label">
            {monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {sunday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button className="week-nav-btn" onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
        </div>

        <div className="week-grid">
          {DAYS.map((dayName, i) => {
            const d = new Date(monday); d.setDate(monday.getDate() + i)
            const ds = isoDate(d)
            const isToday = ds === today
            const dayRuns = runs.filter(a => a.start_date_local?.slice(0, 10) === ds)
            const dayWks = workouts.filter(w => w.date === ds)
            const dayHevy = hevyWorkouts.filter(w => w.date === ds)

            return (
              <div key={i} className={`day-col ${isToday ? 'today' : ''}`}>
                <div className="day-hdr">
                  <div className="day-name">{dayName}</div>
                  <div className="day-num">{d.getDate()}</div>
                </div>
                <div className="day-body">
                  {dayRuns.map(a => (
                    <div key={a.id} className={`ev ${a.type === 'TrailRun' ? 'ev-trail' : 'ev-strava'}`} title={a.name}>
                      {a.type === 'TrailRun' ? '🏔' : '🏃'} {(a.distance * 0.000621371).toFixed(1)}mi
                    </div>
                  ))}
                  {dayWks.map(w => (
                    <div key={w.id} className={`ev ${w.isRace ? 'ev-trail' : (typeColors[w.type] || 'ev-planned')}`} title={w.notes}
                      onDoubleClick={() => removeWorkout(w.id)}>
                      {w.isRace ? '🏁' : '✓'} {w.name}{w.miles ? ` ${w.miles}mi` : ''}{w.elevFt ? ` ${w.elevFt}ft` : ''}
                    </div>
                  ))}
                  {dayHevy.map(w => (
                    <div key={w.id} className="ev ev-hevy" title={w.exercises.map(e => e.name).join(', ')}>
                      🏋️ {w.title}
                    </div>
                  ))}
                  <div className="day-add" onClick={() => openAdd(ds)}>+ add</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>🟠 Strava activity</span>
          <span>🟢 Trail run</span>
          <span>🔵 Planned workout</span>
          {hevyKey && <span>🟣 Hevy strength</span>}
          <span style={{ fontStyle: 'italic' }}>Double-click planned workout to remove</span>
        </div>
      </div>}

      {/* Add modal */}
      <div className={`overlay ${modal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-title">Add Planned Workout</div>
          <div className="fg">
            <label className="fl">Workout name</label>
            <input className="fi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Easy Run, Long Run, Hill Reps…" />
          </div>
          <div className="frow">
            <div className="fg" style={{ margin: 0 }}>
              <label className="fl">Type</label>
              <select className="fs" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="easy">Easy / Recovery</option>
                <option value="long">Long Run</option>
                <option value="trail">Trail Run</option>
                <option value="tempo">Tempo</option>
                <option value="interval">Intervals / Hill Reps</option>
                <option value="rest">Rest / Cross-train</option>
              </select>
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label className="fl">Distance (miles)</label>
              <input className="fi" type="number" value={form.miles} onChange={e => setForm(f => ({ ...f, miles: e.target.value }))} placeholder="8" step="0.5" />
            </div>
          </div>
          <div className="fg">
            <label className="fl">Elevation gain (ft)</label>
            <input className="fi" type="number" value={form.elevFt} onChange={e => setForm(f => ({ ...f, elevFt: e.target.value }))} placeholder="1500" step="100" />
          </div>
          <div className="fg">
            <label className="fl">Notes</label>
            <textarea className="ft" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Zone 2 effort, poles practice…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isRace: !f.isRace }))}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', border: `1px solid ${form.isRace ? 'var(--mint)' : 'var(--border)'}`,
                background: form.isRace ? 'var(--mint-dim)' : 'var(--card2)',
                color: form.isRace ? 'var(--mint)' : 'var(--muted)',
              }}
            >
              🏁 {form.isRace ? 'Tagged as race' : 'Mark as race'}
            </button>
            {form.isRace && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Will appear in Season & race history</span>}
          </div>
          <div className="ma">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-orange" onClick={saveWorkout}>Save Workout</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: STRENGTH
// ═══════════════════════════════════════════════════════════════════════════════

function StrengthSection() {
  const [activeSession, setActiveSession] = useState('A')
  const session = STRENGTH_SESSIONS.find(s => s.id === activeSession)
  const tagColors = { orange: 'badge-orange', blue: 'badge-blue', green: 'badge-green' }

  return (
    <div>
      <div className="section-title">Strength & Conditioning</div>
      <div className="section-sub">Three sessions per week, tailored for trail and fell ultra running</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
          S&C is <strong style={{ color: 'var(--text)' }}>not optional</strong> for ultra runners. It's what keeps you running when your competitors are walking on mile 25, and what keeps you injury-free across a full racing season.
          Your two main training gaps identified from your Strava data: <strong style={{ color: 'var(--orange)' }}>posterior chain strength</strong> (glutes, hamstrings — your climbing engines) and
          <strong style={{ color: 'var(--orange)' }}> single-leg stability</strong> (cadence drops to ~55spm on climbs). These sessions address both directly.
        </div>
      </div>

      <div className="session-tabs">
        {STRENGTH_SESSIONS.map(s => (
          <button key={s.id} className={`session-tab ${activeSession === s.id ? 'active' : ''}`} onClick={() => setActiveSession(s.id)}>
            {s.name}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span className={`badge ${tagColors[session.tagColor]}`}>{session.tag}</span>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{session.goal}</div>
        </div>

        {session.exercises.map((ex, i) => (
          <div key={i} className="exercise-block">
            <div className="ex-header">
              <span style={{ fontSize: 16, marginRight: 4 }}>
                {['🏋', '🦵', '🏃', '🦶', '↔️'][i] || '⚡'}
              </span>
              <div className="ex-name">{ex.name}</div>
              <span className="ex-sets">{ex.sets}</span>
            </div>
            <div className="ex-why">{ex.why}</div>
          </div>
        ))}

        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--card2)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', borderLeft: '3px solid var(--blue)' }}>
          <strong style={{ color: 'var(--text)' }}>Progression principle:</strong> Start with bodyweight or light loads and focus on form for 2–3 weeks.
          Add weight only when you can complete every rep with full control. In race tapers, drop volume by 50% but keep intensity.
          Never do a hard S&C session within 48 hours of a key run.
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: MENTAL
// ═══════════════════════════════════════════════════════════════════════════════

function MentalSection() {
  return (
    <div>
      <div className="section-title">Mental Performance</div>
      <div className="section-sub">The frameworks that separate finishers from DNFs at mile 30</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
          Ultra running is <strong style={{ color: 'var(--text)' }}>70% mental after mile 20</strong>. Not because your body doesn't matter, but because your body has more left than your mind believes it does.
          The work in this section is about building mental tools before you need them — because you can't learn to use a headtorch for the first time at 2am in a peat bog.
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Pre-Race Night Protocol</div>
          {MENTAL_CONTENT.preRaceNight.map((s, i) => (
            <div key={i} className="protocol-step">
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Race Morning Protocol</div>
          {MENTAL_CONTENT.raceMorning.map((s, i) => (
            <div key={i} className="protocol-step">
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--orange-dim)', borderRadius: 10, fontSize: 13 }}>
            <strong>The one thing:</strong> Before every race, identify your single most important intention. Not a time goal — a <em>process</em> goal. "I will walk every climb from mile 1." Write it on your hand.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Managing the Dark Patches</div>
        {MENTAL_CONTENT.darkPatches.map((s, i) => (
          <div key={i} className="protocol-step">
            <div className="step-num">{i + 1}</div>
            <div className="step-content">
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Race Mantras</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          A mantra works because it gives your mind something to do instead of catastrophising. Pick one or two that resonate. Use them specifically — not as wallpaper, but as anchors when you're in the dark.
        </div>
        <div className="mantra-grid">
          {MENTAL_CONTENT.mantras.map((m, i) => (
            <div key={i} className="mantra-card">
              <div className="mantra-text">{m.text}</div>
              <div className="mantra-context">{m.context}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: FUEL
// ═══════════════════════════════════════════════════════════════════════════════

function FuelSection() {
  const [view, setView] = useState('training')
  return (
    <div>
      <div className="section-title">Nutrition & Fuelling</div>
      <div className="section-sub">Fuel your training and race-day performance in miles and real numbers</div>

      <div className="session-tabs" style={{ marginBottom: 20 }}>
        <button className={`session-tab ${view === 'training' ? 'active' : ''}`} onClick={() => setView('training')}>Training Day</button>
        <button className={`session-tab ${view === 'race' ? 'active' : ''}`} onClick={() => setView('race')}>Race Day</button>
      </div>

      {view === 'training' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--text)' }}>Training your gut is as important as training your legs.</strong> Practise your race-day nutrition strategy in training — every long run over 90 minutes is an opportunity to train your gut to absorb carbohydrates at effort. Don't save the gels for race day.
            </div>
          </div>
          <div className="card">
            <div className="card-title">By Run Duration</div>
            {FUEL_GUIDE.training.map((row, i) => (
              <div key={i} className="fuel-row">
                <div className="fuel-time">{row.time}</div>
                <div className="fuel-content">
                  <div className="fuel-title">{row.title}</div>
                  <div className="fuel-detail">{row.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'race' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--text)' }}>The most common ultra DNF reason isn't fitness — it's nutrition failure.</strong>
              Under-fuelling causes bonking. Over-fuelling causes nausea. The window is narrow and it requires practice.
              At your current training volume, target <strong style={{ color: 'var(--orange)' }}>60–80g carbohydrates per hour</strong> and <strong style={{ color: 'var(--orange)' }}>300–400mg sodium per hour</strong> in warm conditions.
            </div>
          </div>
          <div className="card">
            <div className="card-title">Race Day Timeline</div>
            {FUEL_GUIDE.raceDay.map((row, i) => (
              <div key={i} className="fuel-row">
                <div className="fuel-time">{row.time}</div>
                <div className="fuel-content">
                  <div className="fuel-title">{row.title}</div>
                  <div className="fuel-detail">{row.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// JOURNAL — Race Journal + Lessons Learned Engine
// ═══════════════════════════════════════════════════════════════════════════════

const SCORE_LABELS = ['', 'Poor', 'Weak', 'OK', 'Good', 'Strong']
const SCORE_COLORS = ['', 'var(--red)', '#e67e22', 'var(--yellow)', 'var(--green)', 'var(--blue)']

function HevyKeyInput({ onSave }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        className="hevy-key-input"
        type="password"
        placeholder="Paste API key…"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && val.trim() && onSave(val.trim())}
      />
      <button className="hevy-key-btn" disabled={!val.trim()} onClick={() => onSave(val.trim())}>Connect</button>
    </div>
  )
}

function ScoreInput({ label, value, onChange }) {
  return (
    <div className="score-input-row">
      <div className="score-input-label">{label}</div>
      <div className="score-input-dots">
        {[1,2,3,4,5].map(n => (
          <button key={n} className={`score-dot-btn ${value === n ? 'active' : ''}`}
            style={{ background: value === n ? SCORE_COLORS[n] : 'var(--card2)' }}
            onClick={() => onChange(n)}
          />
        ))}
      </div>
      <div className="score-input-val" style={{ color: value ? SCORE_COLORS[value] : 'var(--muted)' }}>
        {value ? SCORE_LABELS[value] : '—'}
      </div>
    </div>
  )
}

function DebriefForm({ race, existing, onSave, onCancel }) {
  const init = existing || {}
  const [finished, setFinished] = useState(init.finished !== undefined ? init.finished : true)
  const [dnfReason, setDnfReason] = useState(init.dnfReason || '')
  const [time, setTime] = useState(init.time || '')
  const [conditions, setConditions] = useState(init.conditions || '')
  const [shoes, setShoes] = useState(init.shoes || '')
  const [pacing, setPacing] = useState(init.pacing || 0)
  const [fuel, setFuel] = useState(init.fuel || 0)
  const [kit, setKit] = useState(init.kit || 0)
  const [mental, setMental] = useState(init.mental || 0)
  const [worked, setWorked] = useState(init.worked || '')
  const [failed, setFailed] = useState(init.failed || '')
  const [surprised, setSurprised] = useState(init.surprised || '')
  const [change, setChange] = useState(init.change || '')
  const [lesson, setLesson] = useState(init.lesson || '')

  function handleSave() {
    const d = {
      id: existing?.id || `debrief_${race.id}_${Date.now()}`,
      raceId: race.id,
      raceName: race.name,
      raceDate: race.date,
      debriefDate: new Date().toISOString(),
      finished, dnfReason, time, conditions, shoes,
      pacing, fuel, kit, mental,
      worked, failed, surprised, change, lesson,
    }
    saveDebrief(d)
    onSave(d)
  }

  return (
    <div className="debrief-overlay">
      <div className="debrief-container">
        <div className="debrief-header">
          <div>
            <div className="debrief-title">📖 Race Debrief</div>
            <div className="debrief-subtitle">{race.name} · {new Date(race.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
          </div>
          <button className="intel-close" onClick={onCancel}>✕</button>
        </div>

        <div className="debrief-body">
          {/* Finish status */}
          <div className="debrief-section">
            <div className="debrief-section-title">Did you finish?</div>
            <div className="finish-toggle">
              <button className={`finish-btn ${finished ? 'active' : ''}`} onClick={() => setFinished(true)}>
                ✓ Finished
              </button>
              <button className={`finish-btn dnf ${!finished ? 'active' : ''}`} onClick={() => setFinished(false)}>
                DNF
              </button>
            </div>
            {!finished && (
              <input className="debrief-input" placeholder="Why did you DNF?" value={dnfReason} onChange={e => setDnfReason(e.target.value)} />
            )}
          </div>

          {/* Basic info */}
          <div className="debrief-section">
            <div className="debrief-section-title">Race details</div>
            <input className="debrief-input" placeholder="Finish time (e.g. 8:24)" value={time} onChange={e => setTime(e.target.value)} />
            <input className="debrief-input" placeholder="Conditions (e.g. wet, muddy, 12°C)" value={conditions} onChange={e => setConditions(e.target.value)} />
            <input className="debrief-input" placeholder="Shoes worn" value={shoes} onChange={e => setShoes(e.target.value)} />
          </div>

          {/* Scores */}
          <div className="debrief-section">
            <div className="debrief-section-title">How did each area go?</div>
            <ScoreInput label="Pacing" value={pacing} onChange={setPacing} />
            <ScoreInput label="Fuel" value={fuel} onChange={setFuel} />
            <ScoreInput label="Kit" value={kit} onChange={setKit} />
            <ScoreInput label="Mental" value={mental} onChange={setMental} />
          </div>

          {/* Reflection */}
          <div className="debrief-section">
            <div className="debrief-section-title">Reflection</div>
            <textarea className="debrief-textarea" placeholder="What worked well?" value={worked} onChange={e => setWorked(e.target.value)} rows={2} />
            <textarea className="debrief-textarea" placeholder="What failed or went wrong?" value={failed} onChange={e => setFailed(e.target.value)} rows={2} />
            <textarea className="debrief-textarea" placeholder="What surprised you?" value={surprised} onChange={e => setSurprised(e.target.value)} rows={2} />
            <textarea className="debrief-textarea" placeholder="What would you change next time?" value={change} onChange={e => setChange(e.target.value)} rows={2} />
          </div>

          {/* Single lesson */}
          <div className="debrief-section">
            <div className="debrief-section-title">One lesson from this race</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>The single most important thing you learned. This goes into your Ultra Memory.</div>
            <textarea className="debrief-textarea lesson" placeholder="e.g. Always carry 2 more gels than you think you need." value={lesson} onChange={e => setLesson(e.target.value)} rows={2} />
          </div>

          <button className="debrief-save-btn" onClick={handleSave}>
            Save to Journal →
          </button>
        </div>
      </div>
    </div>
  )
}

function LessonsPatterns({ debriefs }) {
  if (debriefs.length < 2) return null

  // Score averages
  const avg = (key) => {
    const vals = debriefs.filter(d => d[key] > 0).map(d => d[key])
    return vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1) : null
  }

  const areas = [
    { key: 'pacing', label: 'Pacing' },
    { key: 'fuel', label: 'Fuel' },
    { key: 'kit', label: 'Kit' },
    { key: 'mental', label: 'Mental' },
  ]

  const scored = areas.map(a => ({ ...a, avg: avg(a.key) })).filter(a => a.avg)
  const strongest = scored.length ? [...scored].sort((a,b) => b.avg - a.avg)[0] : null
  const weakest = scored.length ? [...scored].sort((a,b) => a.avg - b.avg)[0] : null
  const finishRate = Math.round((debriefs.filter(d => d.finished).length / debriefs.length) * 100)

  return (
    <div className="patterns-card">
      <div className="patterns-title">🧠 Pattern Recognition</div>
      <div className="patterns-sub">Across {debriefs.length} races</div>

      <div className="patterns-grid">
        <div className="pattern-stat">
          <div className="pattern-stat-val">{finishRate}%</div>
          <div className="pattern-stat-label">Finish rate</div>
        </div>
        {strongest && (
          <div className="pattern-stat">
            <div className="pattern-stat-val" style={{ color: 'var(--green)' }}>{strongest.label}</div>
            <div className="pattern-stat-label">Biggest strength</div>
          </div>
        )}
        {weakest && weakest.key !== strongest?.key && (
          <div className="pattern-stat">
            <div className="pattern-stat-val" style={{ color: 'var(--orange)' }}>{weakest.label}</div>
            <div className="pattern-stat-label">Needs work</div>
          </div>
        )}
      </div>

      {scored.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {scored.map(a => (
            <div key={a.key} className="pattern-bar-row">
              <div className="pattern-bar-label">{a.label}</div>
              <div className="pattern-bar-track">
                <div className="pattern-bar-fill" style={{ width: `${(parseFloat(a.avg)/5)*100}%`, background: parseFloat(a.avg) >= 4 ? 'var(--green)' : parseFloat(a.avg) >= 3 ? 'var(--yellow)' : 'var(--orange)' }} />
              </div>
              <div className="pattern-bar-val">{a.avg}/5</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <div className="patterns-lessons-title">Lessons learned</div>
        {debriefs.filter(d => d.lesson).map((d, i) => (
          <div key={i} className="pattern-lesson-row">
            <div className="pattern-lesson-race">{d.raceName}</div>
            <div className="pattern-lesson-text">"{d.lesson}"</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function JournalSection() {
  const [debriefs, setDebriefs] = useState(getDebriefs)
  const [showForm, setShowForm] = useState(null) // race object or null
  const [editDebrief, setEditDebrief] = useState(null)
  const today = new Date()
  const pastRaces = [...RACES].filter(r => new Date(r.date) <= today).sort((a,b) => new Date(b.date) - new Date(a.date))
  const futureRaces = [...RACES].filter(r => new Date(r.date) > today).sort((a,b) => new Date(a.date) - new Date(b.date))

  function getDebrief(raceId) {
    return debriefs.find(d => d.raceId === raceId)
  }

  function handleSave(d) {
    setDebriefs(getDebriefs())
    setShowForm(null)
    setEditDebrief(null)
  }

  function handleDelete(id) {
    deleteDebrief(id)
    setDebriefs(getDebriefs())
  }

  return (
    <div>
      {(showForm || editDebrief) && (
        <DebriefForm
          race={showForm || RACES.find(r => r.id === editDebrief.raceId)}
          existing={editDebrief}
          onSave={handleSave}
          onCancel={() => { setShowForm(null); setEditDebrief(null) }}
        />
      )}

      <div className="section-title">Race Journal</div>
      <div className="section-sub">Every race logged. Every lesson remembered. This is your Ultra Memory.</div>

      <LessonsPatterns debriefs={debriefs} />

      {/* Past races */}
      {pastRaces.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Past Races</div>
          {pastRaces.map(r => {
            const d = getDebrief(r.id)
            return (
              <div key={r.id} className="journal-race-card">
                <div className="journal-race-header">
                  <div className="journal-race-color" style={{ background: r.color }} />
                  <div className="journal-race-info">
                    <div className="journal-race-name">{r.name}</div>
                    <div className="journal-race-meta">{r.distanceMi}mi · {new Date(r.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
                  </div>
                  {d ? (
                    <div className="journal-race-actions">
                      <button className="journal-action-btn edit" onClick={() => setEditDebrief(d)}>Edit</button>
                      <button className="journal-action-btn delete" onClick={() => handleDelete(d.id)}>✕</button>
                    </div>
                  ) : (
                    <button className="journal-debrief-btn" onClick={() => setShowForm(r)}>+ Debrief</button>
                  )}
                </div>

                {d && (
                  <div className="journal-debrief-summary">
                    <div className="journal-scores">
                      {['pacing','fuel','kit','mental'].map(k => d[k] > 0 && (
                        <div key={k} className="journal-score-chip" style={{ background: SCORE_COLORS[d[k]] + '22', color: SCORE_COLORS[d[k]], border: `1px solid ${SCORE_COLORS[d[k]]}44` }}>
                          {k} {d[k]}/5
                        </div>
                      ))}
                      {d.finished ? <div className="journal-score-chip finished">✓ Finished {d.time && `· ${d.time}`}</div>
                        : <div className="journal-score-chip dnf">DNF</div>}
                    </div>
                    {d.lesson && (
                      <div className="journal-lesson">
                        <span className="journal-lesson-icon">💡</span>
                        <span>"{d.lesson}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming races — pre-race space */}
      <div>
        <div className="card-title" style={{ marginBottom: 12 }}>Upcoming Races</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Debriefs unlock after race day. Come back here the evening after each race.</div>
        {futureRaces.map(r => {
          const days = Math.ceil((new Date(r.date) - today) / 86400000)
          return (
            <div key={r.id} className="journal-race-card upcoming">
              <div className="journal-race-header">
                <div className="journal-race-color" style={{ background: r.color + '66' }} />
                <div className="journal-race-info">
                  <div className="journal-race-name" style={{ color: 'var(--muted)' }}>{r.name}</div>
                  <div className="journal-race-meta">{r.distanceMi}mi · {days}d away</div>
                </div>
                <div className="journal-locked">🔒 {days}d</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Combined Races tab (Season + Journal) ──
function RacesTab({ activities, stravaConnected }) {
  const [sub, setSub] = useState('season')
  return (
    <div>
      <div className="subtab-row">
        <button className={`subtab-btn ${sub === 'season' ? 'active' : ''}`} onClick={() => setSub('season')}>🏔 Season</button>
        <button className={`subtab-btn ${sub === 'journal' ? 'active' : ''}`} onClick={() => setSub('journal')}>📖 Journal</button>
      </div>
      {sub === 'season' && <SeasonSection activities={activities} stravaConnected={stravaConnected} />}
      {sub === 'journal' && <JournalSection />}
    </div>
  )
}

// ── Combined Train tab (Training + Strength + Fuel) ──
function TrainTab({ activities, hevyWorkouts, hevyKey, setHevyKey, hevyLoading }) {
  const [sub, setSub] = useState('calendar')
  return (
    <div>
      <div className="subtab-row">
        <button className={`subtab-btn ${sub === 'calendar' ? 'active' : ''}`} onClick={() => setSub('calendar')}>📅 Calendar</button>
        <button className={`subtab-btn ${sub === 'strength' ? 'active' : ''}`} onClick={() => setSub('strength')}>💪 Strength</button>
        <button className={`subtab-btn ${sub === 'fuel' ? 'active' : ''}`} onClick={() => setSub('fuel')}>⚡ Fuel</button>
      </div>
      {sub === 'calendar' && <TrainingSection activities={activities} hevyWorkouts={hevyWorkouts} hevyKey={hevyKey} setHevyKey={setHevyKey} hevyLoading={hevyLoading} />}
      {sub === 'strength' && <StrengthSection />}
      {sub === 'fuel' && <FuelSection />}
    </div>
  )
}

const TABS = [
  { id: 'brief',  label: 'Home' },
  { id: 'races',  label: 'Races' },
  { id: 'train',  label: 'Train' },
  { id: 'coach',  label: 'Coach' },
]

const TAB_ICONS = { brief: '🏠', races: '🏔', train: '📅', coach: '💬' }

function getHevyKey() { try { return localStorage.getItem('cc_hevy_key') || '' } catch { return '' } }

function getTheme() { try { return localStorage.getItem('cc_theme') || 'dark' } catch { return 'dark' } }

export default function App() {
  const [tab, setTab] = useState('brief')
  const strava = useStrava()
  const [profile, setProfile] = useState(getProfile)
  const [hevyKey, setHevyKeyState] = useState(getHevyKey)
  const [hevyWorkouts, setHevyWorkouts] = useState([])
  const [hevyLoading, setHevyLoading] = useState(false)
  const [theme, setThemeState] = useState(getTheme)
  const [pendingCheckin, setPendingCheckin] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('cc_theme', theme) } catch {}
  }, [theme])

  // PWA install prompt
  useEffect(() => {
    const dismissed = localStorage.getItem('cc_install_dismissed')
    if (dismissed) return
    const handler = e => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then(() => {
      setShowInstallBanner(false)
      setInstallPrompt(null)
    })
  }

  function dismissInstall() {
    setShowInstallBanner(false)
    try { localStorage.setItem('cc_install_dismissed', '1') } catch {}
  }

  function toggleTheme() {
    setThemeState(t => t === 'dark' ? 'light' : 'dark')
  }

  function setHevyKey(k) {
    setHevyKeyState(k)
    try { if (k) localStorage.setItem('cc_hevy_key', k); else localStorage.removeItem('cc_hevy_key') } catch {}
  }

  useEffect(() => {
    if (!hevyKey) return
    setHevyLoading(true)
    fetch('/api/hevy-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: hevyKey, pageSize: 20 }),
    })
      .then(r => r.json())
      .then(d => { if (d.workouts) setHevyWorkouts(d.workouts) })
      .catch(() => {})
      .finally(() => setHevyLoading(false))
  }, [hevyKey])

  const hasExistingData = () => {
    const workouts = JSON.parse(localStorage.getItem('cc_workouts_v2') || '[]')
    return workouts.length > 0
  }
  const [showOnboarding, setShowOnboarding] = useState(!getProfile() && !hasExistingData())

  function handleOnboardingComplete(p) {
    setProfile(p)
    setShowOnboarding(false)
    // Seed journey workouts if calendar is empty
    const existing = JSON.parse(localStorage.getItem('cc_workouts_v2') || '[]')
    if (existing.length === 0) {
      const plan = p.level === 'ultra' ? getTittesworthPlan() : generateJourneyPlan(p)
      saveWorkouts(plan)
    }
  }

  if (showOnboarding) return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={() => setShowOnboarding(false)} />

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">
          ⚡ ClaudeCoach
          <span className="logo-sub">Ultra</span>
        </div>
        <nav className="nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          {strava.error && <span className="strava-error">{strava.error}</span>}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="settings-btn" onClick={() => setSettingsOpen(true)} title="Settings">⚙️</button>
          <div className={`strava-badge ${strava.auth ? 'connected' : 'disconnected'}`}
            onClick={strava.auth ? undefined : strava.connect}>
            <div className={`dot ${strava.auth ? 'dot-green' : 'dot-grey'}`} />
            {strava.loading ? 'Connecting…' : strava.auth ? (strava.athlete?.firstname ? `Hi ${strava.athlete.firstname} ✓` : 'Strava ✓') : 'Connect Strava'}
          </div>
        </div>
      </header>

      {/* ── PWA INSTALL BANNER ── */}
      {showInstallBanner && (
        <div className="pwa-banner">
          <span className="pwa-banner-icon">⚡</span>
          <div className="pwa-banner-text">
            <div className="pwa-banner-title">Add ClaudeCoach to your home screen</div>
            <div className="pwa-banner-sub">Works offline · No app store needed</div>
          </div>
          <button className="pwa-banner-install" onClick={handleInstall}>Install</button>
          <button className="pwa-banner-dismiss" onClick={dismissInstall}>✕</button>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-drawer" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <div className="settings-title">Settings</div>
              <button className="settings-close" onClick={() => setSettingsOpen(false)}>✕</button>
            </div>

            <div className="settings-section">
              <div className="settings-section-label">Hevy</div>
              {hevyKey ? (
                <div className="settings-row">
                  <span style={{ fontSize: 13, color: 'var(--mint)', fontWeight: 700 }}>🏋️ Connected</span>
                  {hevyLoading && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>Syncing…</span>}
                  {!hevyLoading && hevyWorkouts.length > 0 && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{hevyWorkouts.length} sessions loaded</span>}
                  <button className="settings-disconnect" onClick={() => setHevyKey('')}>Disconnect</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                    Connect your Hevy API key so the coach can see your strength sessions and send workouts to the app.
                  </div>
                  <HevyKeyInput onSave={k => { setHevyKey(k); setSettingsOpen(false) }} />
                </div>
              )}
            </div>

            <div className="settings-section">
              <div className="settings-section-label">Theme</div>
              <div className="settings-row">
                <button className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setThemeState('dark')}>🌙 Dark</button>
                <button className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setThemeState('light')}>☀️ Light</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        {tab === 'brief' && <BriefSection strava={strava} profile={profile}
          onCheckinSave={ci => { setPendingCheckin(ci); setTab('coach') }}
          onNavigate={t => setTab(t)} />}
        {tab === 'races' && <RacesTab activities={strava.activities} stravaConnected={!!strava.auth} />}
        {tab === 'train' && <TrainTab activities={strava.activities} hevyWorkouts={hevyWorkouts} hevyKey={hevyKey} setHevyKey={setHevyKey} hevyLoading={hevyLoading} />}
        {tab === 'coach' && <ChatSection activities={strava.activities} athlete={strava.athlete} hevyWorkouts={hevyWorkouts} hevyKey={hevyKey} pendingCheckin={pendingCheckin} onPendingCheckinConsumed={() => setPendingCheckin(null)} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button key={t.id} className={`bnav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="bnav-icon">{TAB_ICONS[t.id]}</span>
            <span className="bnav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
