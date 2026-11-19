import type { Unit } from '../engine/types';

/**
 * Unit 1 — Front Door.
 * Everything you need before and during a first visit, before touching
 * technique. Content is general education, not individual exercise advice.
 * Needs review by a qualified fitness professional before public release.
 */

const FLOORPLAN_DESC =
  'Top-down floor plan of a gym. The entrance and front desk are at the bottom middle. ' +
  'Area 1, top left: rows of treadmills and bikes. Area 2, top right: a long dumbbell rack along the wall with benches and a squat rack. ' +
  'Area 3, bottom left: green turf with floor mats. Area 4, middle: a tall frame with two pulleys. ' +
  'Area 5, bottom right: a grid of seated machines.';

const FLOOR_REGIONS = [
  { id: 'cardio', label: 'Cardio area', x: 20, y: 20, w: 170, h: 100 },
  { id: 'free', label: 'Free-weight area', x: 210, y: 20, w: 170, h: 120 },
  { id: 'stretch', label: 'Stretching and open floor', x: 20, y: 140, w: 120, h: 90 },
  { id: 'cables', label: 'Cable station', x: 150, y: 140, w: 70, h: 86 },
  { id: 'machines', label: 'Machine area', x: 230, y: 156, w: 150, h: 74 },
];

export const unit1: Unit = {
  id: 'u1',
  number: 1,
  title: 'Front Door',
  tagline: 'Walk in knowing what to expect.',
  color: '--plate-green',
  status: 'playable',
  lessons: [
    /* ------------------------------------------------------------ */
    {
      id: 'u1-first-visit',
      unitId: 'u1',
      kind: 'lesson',
      title: 'First Visit',
      summary: 'What to bring, what to do first, and why nobody is watching you.',
      minutes: 3,
      takeaways: [
        'Bring water, a small towel, closed-toe athletic shoes, and your membership card or app.',
        'Ask the front desk about a tour or orientation. Many gyms offer one, and it’s part of the staff’s job.',
        'A short, planned first session beats a long, random one. Leave wanting to come back.',
      ],
      challenges: [
        {
          id: 'u1-fv-1',
          type: 'choice',
          prompt: 'It’s your first time at a new gym. You’ve just checked in. What’s the most useful next move?',
          explain:
            'Front-desk staff field this question constantly. Many gyms include a short tour or orientation with membership, and it turns a big unfamiliar room into a map you understand.',
          options: [
            { id: 'a', text: 'Ask the front desk if there’s a quick tour or orientation' },
            { id: 'b', text: 'Find the heaviest weight you can lift to see where you stand', why: 'Testing your max on day one isn’t safe or useful. Your first job is learning the space.' },
            { id: 'c', text: 'Copy whatever the fittest-looking person is doing', why: 'Their routine fits their years of experience, not your first day.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-fv-2',
          type: 'sort',
          prompt: 'Pack your bag. What’s worth bringing on a first visit?',
          explain:
            'Keep it simple: water, a small towel for wiping sweat and covering benches, closed-toe athletic shoes, and whatever gets you through the door. Stiff clothes and open shoes make moving awkward and less safe.',
          buckets: [
            { id: 'bring', label: 'Bring it' },
            { id: 'skip', label: 'Skip it' },
          ],
          items: [
            { id: 'water', text: 'Water bottle', bucket: 'bring' },
            { id: 'towel', text: 'Small towel', bucket: 'bring' },
            { id: 'shoes', text: 'Closed-toe athletic shoes', bucket: 'bring' },
            { id: 'card', text: 'Membership card or app', bucket: 'bring' },
            { id: 'jeans', text: 'Stiff jeans', bucket: 'skip' },
            { id: 'flips', text: 'Flip-flops for the gym floor', bucket: 'skip' },
          ],
        },
        {
          id: 'u1-fv-3',
          type: 'sequence',
          prompt: 'Put a sensible first visit in order.',
          explain:
            'Check in, stash your stuff, warm up for 5–10 minutes so your body is ready, do what you planned, then leave the space clean for the next person.',
          steps: [
            { id: 's1', text: 'Check in at the front desk' },
            { id: 's2', text: 'Put your bag in a locker or cubby' },
            { id: 's3', text: 'Warm up for 5–10 minutes, like an easy bike ride' },
            { id: 's4', text: 'Do the exercises you planned' },
            { id: 's5', text: 'Wipe down what you used and head out' },
          ],
        },
        {
          id: 'u1-fv-4',
          type: 'choice',
          prompt: 'You feel like everyone is watching you. What’s most likely true?',
          explain:
            'Psychologists call this the spotlight effect: people consistently overestimate how much others notice them. In a gym, most people are counting reps and thinking about their own next set.',
          options: [
            { id: 'a', text: 'Most people are focused on their own workout' },
            { id: 'b', text: 'Regulars expect beginners to already know everything', why: 'Every regular was a beginner once, and most remember it.' },
            { id: 'c', text: 'You should get fitter at home before going to a gym', why: 'Gyms exist to help people get fitter. You don’t need to qualify first.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-fv-5',
          type: 'choice',
          prompt: 'Which first-visit plan is the most realistic?',
          explain:
            'A short session with a warm-up and a handful of simple exercises is plenty for day one. You can always do more next time, and finishing feeling good makes you more likely to come back.',
          options: [
            { id: 'a', text: 'Warm up, do 3–4 simple exercises, done in about 30–45 minutes' },
            { id: 'b', text: 'Try every machine in the building once', why: 'That’s a tour, not a workout. Pick a few things and learn them properly.' },
            { id: 'c', text: 'Two hours as hard as possible, to make the trip count', why: 'Going all-out on day one usually means being very sore and less keen to return.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-fv-6',
          type: 'spot',
          prompt: 'Tap every choice that will make Jordan’s first visit harder.',
          scene: 'Jordan’s first visit',
          explain:
            'Skipping the warm-up, choosing a weight you can’t control, and pushing through sharp pain are the three classic first-day mistakes. Effort and mild burning are normal; sharp pain is a signal to stop.',
          lines: [
            { id: 'l1', time: '5:30', text: 'Arrives in running shoes with a water bottle', wrong: false, why: 'Good prep.' },
            { id: 'l2', time: '5:34', text: 'Skips the warm-up to save time', wrong: true, why: 'A few minutes of easy movement gets joints and muscles ready.' },
            { id: 'l3', time: '5:40', text: 'Asks a staff member where the dumbbells are', wrong: false, why: 'Exactly what staff are there for.' },
            { id: 'l4', time: '5:45', text: 'Picks dumbbells too heavy to control, to look strong', wrong: true, why: 'Choose a weight you can move smoothly with good control.' },
            { id: 'l5', time: '5:58', text: 'Feels a sharp pain in one knee and keeps going', wrong: true, why: 'Sharp pain means stop that exercise.' },
            { id: 'l6', time: '6:10', text: 'Jots down what they did to repeat next time', wrong: false, why: 'A simple log makes the next visit easier.' },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'u1-floor',
      unitId: 'u1',
      kind: 'lesson',
      title: 'Read the Floor',
      summary: 'Most gyms share the same five neighborhoods. Learn to spot them.',
      minutes: 3,
      takeaways: [
        'Most gyms have five zones: cardio, free weights, machines, cables, and open floor for stretching.',
        'Selectorized machines guide the movement and change weight with one pin, which makes them friendly to learn on.',
        'Warm up and stretch on the open floor or turf, not in front of the dumbbell rack.',
      ],
      challenges: [
        {
          id: 'u1-fl-1',
          type: 'hotspot',
          art: 'floorplan',
          artDescription: FLOORPLAN_DESC,
          prompt: 'You want to warm up on a stationary bike. Tap where you’d head.',
          explain:
            'Bikes, treadmills, rowers and ellipticals usually sit together in the cardio area, often in neat rows facing screens or windows.',
          regions: FLOOR_REGIONS,
          answer: 'cardio',
        },
        {
          id: 'u1-fl-2',
          type: 'match',
          prompt: 'Match each zone to what you’ll find there.',
          explain: 'Once you know the five neighborhoods, any gym becomes readable in a minute.',
          pairs: [
            { id: 'p1', left: 'Cardio area', right: 'Treadmills, bikes, rowers' },
            { id: 'p2', left: 'Free weights', right: 'Dumbbells, barbells, benches' },
            { id: 'p3', left: 'Machine area', right: 'Seated machines with weight pins' },
            { id: 'p4', left: 'Cable station', right: 'Pulleys with swappable handles' },
            { id: 'p5', left: 'Open floor', right: 'Mats for warm-ups and stretching' },
          ],
        },
        {
          id: 'u1-fl-3',
          type: 'hotspot',
          art: 'floorplan',
          artDescription: FLOORPLAN_DESC,
          prompt: 'Where are you most likely to find the dumbbells?',
          explain:
            'Dumbbells live on a long rack, usually against a wall or mirror, with benches nearby. That’s the free-weight area, often the busiest part of the floor.',
          regions: FLOOR_REGIONS,
          answer: 'free',
        },
        {
          id: 'u1-fl-4',
          type: 'choice',
          prompt: 'Why are selectorized machines a comfortable place for beginners to start?',
          art: 'machine',
          explain:
            'The machine guides the path of the movement, and you change the weight by moving a single pin. That means fewer things to think about while you learn how an exercise should feel.',
          options: [
            { id: 'a', text: 'The movement is guided and the weight changes with one pin' },
            { id: 'b', text: 'They build more muscle than any other equipment', why: 'They aren’t magic. They’re just easier to learn, which is a good reason on its own.' },
            { id: 'c', text: 'Experienced people aren’t allowed to use them', why: 'Everyone uses machines, from first-timers to athletes.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-fl-5',
          type: 'sort',
          prompt: 'Cardio area or free-weight area?',
          explain:
            'If it moves you continuously (rowing, stepping, gliding), it’s cardio. Benches, racks and loose weights belong to the free-weight area.',
          buckets: [
            { id: 'cardio', label: 'Cardio' },
            { id: 'free', label: 'Free weights' },
          ],
          items: [
            { id: 'row', text: 'Rowing machine', bucket: 'cardio' },
            { id: 'db', text: 'Dumbbells', bucket: 'free' },
            { id: 'ell', text: 'Elliptical', bucket: 'cardio' },
            { id: 'bench', text: 'Adjustable bench', bucket: 'free' },
            { id: 'stair', text: 'Stair climber', bucket: 'cardio' },
            { id: 'rack', text: 'Squat rack', bucket: 'free' },
          ],
        },
        {
          id: 'u1-fl-6',
          type: 'hotspot',
          art: 'floorplan',
          artDescription: FLOORPLAN_DESC,
          prompt: 'The area by the dumbbells is packed. Where’s the better place to do your warm-up stretches?',
          explain:
            'Open floor or turf is made for warm-ups, stretching and bodyweight moves. You get room to move and nobody has to step around you to reach the rack.',
          regions: FLOOR_REGIONS,
          answer: 'stretch',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'u1-ask',
      unitId: 'u1',
      kind: 'lesson',
      title: 'Ask Like a Regular',
      summary: 'Who to ask, when to ask, and the phrases regulars use.',
      minutes: 3,
      takeaways: [
        'Floor staff and instruction placards are there for exactly your questions.',
        'Wait until someone finishes a set before talking to them.',
        '“Can I work in?” means taking turns on equipment between sets. It’s normal and polite.',
      ],
      challenges: [
        {
          id: 'u1-ak-1',
          type: 'choice',
          prompt: 'You can’t figure out how a machine’s seat adjusts. Who’s the best first source?',
          explain:
            'Most machines have an instruction placard showing setup and movement, and floor staff can show you in under a minute. Guessing on adjustable equipment is how people end up in awkward positions.',
          options: [
            { id: 'a', text: 'The placard on the machine, or a staff member on the floor' },
            { id: 'b', text: 'The person next to you, mid-set', why: 'They’re busy concentrating. Staff and placards are the faster route anyway.' },
            { id: 'c', text: 'Nobody. Just keep trying until it moves', why: 'Forcing levers and pins can pinch fingers or leave the seat in a bad position.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-ak-2',
          type: 'choice',
          prompt: 'Someone has headphones in and is mid-set next to a bench you want. When do you ask if it’s free?',
          explain:
            'Interrupting a set breaks someone’s focus and can be unsafe. Wait for them to put the weight down, then catch their eye or give a small wave.',
          options: [
            { id: 'a', text: 'After they finish the set and put the weight down' },
            { id: 'b', text: 'Tap their shoulder right away so you don’t lose time', why: 'Startling someone holding weight is a real safety risk.' },
            { id: 'c', text: 'Don’t ask. Just take it, they’re probably done', why: 'Their towel or bottle may be saving it. Asking takes five seconds.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-ak-3',
          type: 'match',
          prompt: 'Match the gym phrase to what it means.',
          explain: 'Knowing a few phrases makes asking feel normal, because it is.',
          pairs: [
            { id: 'p1', left: '“Can I work in?”', right: 'Can we take turns between sets?' },
            { id: 'p2', left: '“How many sets left?”', right: 'When will this be free?' },
            { id: 'p3', left: '“Are you using this?”', right: 'Is this equipment taken?' },
            { id: 'p4', left: '“Can you spot me?”', right: 'Can you stand by in case a rep fails?' },
          ],
        },
        {
          id: 'u1-ak-4',
          type: 'sequence',
          prompt: 'Working in with someone: put the steps in order.',
          explain:
            'Working in is just taking turns. You ask between sets, swap during each other’s rest, and leave the equipment the way you found it.',
          steps: [
            { id: 's1', text: 'Wait for them to finish their set' },
            { id: 's2', text: 'Ask, “Mind if I work in?”' },
            { id: 's3', text: 'Adjust the seat or weight for your set' },
            { id: 's4', text: 'Do your set while they rest' },
            { id: 's5', text: 'Set it back how they had it' },
          ],
        },
        {
          id: 'u1-ak-5',
          type: 'sort',
          prompt: 'Good time to ask someone a question, or bad time?',
          explain:
            'The rule of thumb: ask during rest, never during effort. Someone mid-rep or mid-sprint can’t safely answer.',
          buckets: [
            { id: 'good', label: 'Good time' },
            { id: 'bad', label: 'Bad time' },
          ],
          items: [
            { id: 'i1', text: 'Between their sets', bucket: 'good' },
            { id: 'i2', text: 'While they’re lifting', bucket: 'bad' },
            { id: 'i3', text: 'Resting, headphones off', bucket: 'good' },
            { id: 'i4', text: 'Halfway through a treadmill sprint', bucket: 'bad' },
            { id: 'i5', text: 'At the front desk', bucket: 'good' },
            { id: 'i6', text: 'On their last, hardest rep', bucket: 'bad' },
          ],
        },
        {
          id: 'u1-ak-6',
          type: 'choice',
          prompt: 'A staff member gives you a quick tip on a machine. Do you now have to buy personal training?',
          explain:
            'Answering quick questions is a normal part of floor staff’s job at most gyms. Paid training sessions are a separate, optional service.',
          options: [
            { id: 'a', text: 'Usually not. Quick questions are normal, and sessions are optional' },
            { id: 'b', text: 'Yes, any advice means you owe them a session', why: 'That’s not how it works at most gyms. You can say thanks and move on.' },
            { id: 'c', text: 'Only if you asked more than one question', why: 'There’s no question limit. Ask what you need.' },
          ],
          answer: 'a',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'u1-etiquette',
      unitId: 'u1',
      kind: 'lesson',
      title: 'House Rules',
      summary: 'Rerack, wipe down, share. The unwritten rules, written down.',
      minutes: 3,
      takeaways: [
        'Rerack: put weights back where they belong, in their labeled spot.',
        'Wipe down benches, seats and handles after you use them.',
        'Share during busy times: don’t save equipment, and give people room to move.',
      ],
      challenges: [
        {
          id: 'u1-et-1',
          type: 'choice',
          prompt: 'A sign says “Please rerack your weights.” What does it mean?',
          explain:
            'Rerack means putting weights back where they belong when you’re done: dumbbells to their numbered slot, plates off the bar and back on the pegs. It’s the single most appreciated habit in any gym.',
          options: [
            { id: 'a', text: 'Return weights to where they belong when you’re done' },
            { id: 'b', text: 'Do your exercise a second time', why: 'Close, but that would be a second set. Rerack is about cleaning up.' },
            { id: 'c', text: 'Stack all the weights neatly in one pile', why: 'Weights have specific homes so the next person can find them.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-et-2',
          type: 'spot',
          prompt: 'Busy weeknight at 6pm. Tap everything that breaks gym etiquette.',
          scene: 'Rush hour on the floor',
          explain:
            'The three classics: leaving equipment loaded, saving several machines at once, and cutting through someone’s space while they lift. Asking how many sets are left and wiping down are exactly right.',
          lines: [
            { id: 'l1', time: '6:02', text: 'Leaves plates loaded on the leg press', wrong: true, why: 'The next person has to unload your weight first.' },
            { id: 'l2', time: '6:05', text: 'Wipes down the bench after using it', wrong: false, why: 'Exactly right.' },
            { id: 'l3', time: '6:09', text: 'Drapes towels on three machines to save them', wrong: true, why: 'One station at a time when it’s busy.' },
            { id: 'l4', time: '6:14', text: 'Walks right in front of someone lifting at the mirror', wrong: true, why: 'Walk behind lifters and give them room.' },
            { id: 'l5', time: '6:20', text: 'Asks how many sets are left on the cable machine', wrong: false, why: 'The polite way to queue.' },
            { id: 'l6', time: '6:31', text: 'Puts dumbbells back in their matching slot', wrong: false, why: 'Textbook rerack.' },
          ],
        },
        {
          id: 'u1-et-3',
          type: 'choice',
          prompt: 'You’re done with a pair of 15 lb dumbbells. Where do they go?',
          explain:
            'Racks are ordered by weight so people can grab what they need without hunting. One pair in the wrong slot sends the next person on a search.',
          options: [
            { id: 'a', text: 'Back on the rack in the 15 lb slot' },
            { id: 'b', text: 'On the floor next to your bench, for whoever’s next', why: 'Weights on the floor are a trip hazard and nobody can find them.' },
            { id: 'c', text: 'Any open slot on the rack', why: 'The labels matter. Matching slots keep the rack usable.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-et-4',
          type: 'sort',
          prompt: 'Do it or skip it?',
          explain:
            'Good etiquette comes down to two ideas: leave things the way you’d want to find them, and remember the space is shared.',
          buckets: [
            { id: 'do', label: 'Do it' },
            { id: 'skip', label: 'Skip it' },
          ],
          items: [
            { id: 'i1', text: 'Wipe the seat and handles when done', bucket: 'do' },
            { id: 'i2', text: 'Take a phone call on speaker', bucket: 'skip' },
            { id: 'i3', text: 'Scroll on a machine for ten minutes when it’s busy', bucket: 'skip' },
            { id: 'i4', text: 'Unload plates from the bar when finished', bucket: 'do' },
            { id: 'i5', text: 'Lay a towel on benches you use', bucket: 'do' },
            { id: 'i6', text: 'Drop dumbbells from overhead', bucket: 'skip' },
          ],
        },
        {
          id: 'u1-et-5',
          type: 'sequence',
          prompt: 'You’re finished with a loaded barbell. Put the cleanup in order.',
          explain:
            'Collars come off first, then plates, which go back on their pegs by size. A quick wipe-down finishes the job. Unloading both sides evenly keeps the bar from tipping.',
          steps: [
            { id: 's1', text: 'Finish your last set and set the bar down safely' },
            { id: 's2', text: 'Take the collars (clips) off' },
            { id: 's3', text: 'Slide the plates off, alternating sides' },
            { id: 's4', text: 'Put plates back on their pegs by size' },
            { id: 's5', text: 'Wipe down the bench and bar' },
          ],
        },
        {
          id: 'u1-et-6',
          type: 'choice',
          prompt: 'Is it okay to film yourself to check your form?',
          explain:
            'Filming yourself is a common, useful way to check form. Just keep the camera out of walkways and keep other people out of the frame.',
          options: [
            { id: 'a', text: 'Yes. Keep others out of the frame and the walkway clear' },
            { id: 'b', text: 'Never. Phones aren’t allowed on gym floors', why: 'Most gyms allow phones. Some have photo rules, so check signs if unsure.' },
            { id: 'c', text: 'Yes, and it’s fine to set your tripod in a walkway', why: 'Tripods in walkways trip people. Find a corner.' },
          ],
          answer: 'a',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'u1-kit',
      unitId: 'u1',
      kind: 'lesson',
      title: 'Know the Kit',
      summary: 'Name the common equipment and the safety parts that matter.',
      minutes: 4,
      takeaways: [
        'Dumbbells and kettlebells are held in your hands; barbells are loaded with plates and secured with collars.',
        'On a selectorized machine, the pin in the weight stack sets the weight, and a separate pin adjusts the seat.',
        'Safety features matter: rack safety arms catch a bar, and the treadmill key stops the belt if you slip.',
      ],
      challenges: [
        {
          id: 'u1-kt-1',
          type: 'picture',
          prompt: 'Which one is a kettlebell?',
          explain:
            'A kettlebell is a cast ball with a handle on top. Its weight sits below your hand, which makes it great for swings and carries, a different feel from a dumbbell.',
          options: [
            { id: 'kb', art: 'kettlebell', label: 'Kettlebell' },
            { id: 'db', art: 'dumbbell', label: 'Dumbbell' },
            { id: 'bb', art: 'barbell', label: 'Barbell' },
            { id: 'bn', art: 'bench', label: 'Bench' },
          ],
          answer: 'kb',
        },
        {
          id: 'u1-kt-2',
          type: 'picture',
          prompt: 'Which one is a cable machine?',
          explain:
            'A cable machine runs a cable over pulleys to a weight stack. You clip on different handles and slide the pulley up or down, so one machine covers many exercises.',
          options: [
            { id: 'mc', art: 'machine', label: 'Seated machine' },
            { id: 'cb', art: 'cable', label: 'Cable machine' },
            { id: 'rk', art: 'rack', label: 'Squat rack' },
            { id: 'tm', art: 'treadmill', label: 'Treadmill' },
          ],
          answer: 'cb',
        },
        {
          id: 'u1-kt-3',
          type: 'hotspot',
          art: 'machine',
          artDescription:
            'Side view of a seated machine. Spot 1: a pin sticking out of the stacked weight plates on the left. Spot 2: a tall back pad. Spot 3: a knob on the seat post under the seat. Spot 4: handles reaching forward on the right.',
          prompt: 'Where do you change how much weight this machine uses?',
          explain:
            'Slide the pin into the weight stack under the plate you want. Everything above the pin lifts with you. Push it all the way in so it can’t slip out.',
          regions: [
            { id: 'stack', label: 'Weight-stack pin', x: 92, y: 180, w: 40, h: 36, marker: 'tr' },
            { id: 'back', label: 'Back pad', x: 140, y: 70, w: 44, h: 104 },
            { id: 'seat', label: 'Seat-height pin', x: 212, y: 210, w: 40, h: 40, marker: 'br' },
            { id: 'handles', label: 'Handles', x: 280, y: 100, w: 52, h: 64 },
          ],
          answer: 'stack',
        },
        {
          id: 'u1-kt-4',
          type: 'hotspot',
          art: 'rack',
          artDescription:
            'Side view of a squat rack. Spot 1: a bar across the very top. Spot 2: a small hook on the front post holding the end of a barbell. Spot 3: a long horizontal arm running between the front and back posts at hip height. Spot 4: pegs on the back post holding stored plates.',
          prompt: 'Tap the safety arms — the part that catches the bar if you can’t finish a rep.',
          explain:
            'Safety arms (also called spotter arms or pins) run front to back inside the rack. Set them just below the lowest point of your movement so they only touch the bar if a rep goes wrong.',
          regions: [
            { id: 'pullup', label: 'Pull-up bar', x: 50, y: 14, w: 90, h: 34 },
            { id: 'jhook', label: 'J-hook', x: 82, y: 86, w: 44, h: 38 },
            { id: 'safety', label: 'Safety arms', x: 150, y: 176, w: 126, h: 32 },
            { id: 'pegs', label: 'Plate storage pegs', x: 300, y: 178, w: 72, h: 92 },
          ],
          answer: 'safety',
        },
        {
          id: 'u1-kt-5',
          type: 'match',
          prompt: 'Match the equipment to what it does.',
          explain: 'These four come up in almost every beginner routine. Now you’ll recognize them by name.',
          pairs: [
            { id: 'p1', left: 'Dumbbell', right: 'Short weight held in one hand' },
            { id: 'p2', left: 'Barbell', right: 'Long bar loaded with plates' },
            { id: 'p3', left: 'Collar', right: 'Clip that stops plates sliding off' },
            { id: 'p4', left: 'Stack pin', right: 'Picks how much a machine lifts' },
          ],
        },
        {
          id: 'u1-kt-6',
          type: 'hotspot',
          art: 'treadmill',
          artDescription:
            'Side view of a treadmill. Spot 1: a display screen at the top front. Spot 2: a small red key on the side of the display with a cord and clip hanging down. Spot 3: a handrail at waist height. Spot 4: the long running belt along the floor.',
          prompt: 'Tap the safety key — the part that stops the belt if you slip.',
          explain:
            'Clip the cord to your clothing before you start. If you slip or drift too far back, the key pulls out and the belt stops. Not every treadmill has one, so also find the stop button before you start.',
          regions: [
            { id: 'console', label: 'Display console', x: 278, y: 54, w: 98, h: 56, marker: 'tr' },
            { id: 'key', label: 'Safety key and clip', x: 222, y: 64, w: 54, h: 70, marker: 'bl' },
            { id: 'rail', label: 'Handrail', x: 190, y: 140, w: 132, h: 32, marker: 'br' },
            { id: 'belt', label: 'Running belt', x: 40, y: 204, w: 250, h: 54 },
          ],
          answer: 'key',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'u1-checkpoint',
      unitId: 'u1',
      kind: 'checkpoint',
      title: 'Front Door Checkpoint',
      summary: 'Mixed challenges from the whole unit. Pass to earn your Front Door Pass.',
      minutes: 5,
      takeaways: [
        'You can plan a first visit: what to bring, what order to do things in, and how long to stay.',
        'You can read a gym floor and name the common equipment.',
        'You know the house rules and how to ask for help without it being awkward.',
      ],
      challenges: [
        {
          id: 'u1-cp-1',
          type: 'choice',
          prompt: 'The cable machine you planned to use is taken, and the person has three sets left. What’s a good move?',
          explain:
            'Busy equipment is normal. Ask to work in, or do a different exercise from your plan and come back. Both keep your session moving without hovering.',
          options: [
            { id: 'a', text: 'Ask to work in, or do another exercise and come back' },
            { id: 'b', text: 'Stand right next to them until they finish', why: 'Hovering is uncomfortable for both of you. Use the time.' },
            { id: 'c', text: 'Give up and go home', why: 'Shuffling your order is a normal part of every gym session.' },
          ],
          answer: 'a',
        },
        {
          id: 'u1-cp-2',
          type: 'sort',
          prompt: 'Free weight or machine?',
          explain:
            'Free weights move however you move them. Machines guide the path and usually have a seat and a weight stack or plate-loaded lever.',
          buckets: [
            { id: 'free', label: 'Free weight' },
            { id: 'machine', label: 'Machine' },
          ],
          items: [
            { id: 'i1', text: 'Dumbbell', bucket: 'free' },
            { id: 'i2', text: 'Leg press', bucket: 'machine' },
            { id: 'i3', text: 'Kettlebell', bucket: 'free' },
            { id: 'i4', text: 'Seated chest press', bucket: 'machine' },
            { id: 'i5', text: 'Barbell', bucket: 'free' },
            { id: 'i6', text: 'Lat pulldown', bucket: 'machine' },
          ],
        },
        {
          id: 'u1-cp-3',
          type: 'hotspot',
          art: 'floorplan',
          artDescription: FLOORPLAN_DESC,
          prompt: 'You want to try a few seated machines with weight pins. Where do you go?',
          explain: 'Selectorized machines usually live together in rows or a grid, often near the free weights.',
          regions: FLOOR_REGIONS,
          answer: 'machines',
        },
        {
          id: 'u1-cp-4',
          type: 'sequence',
          prompt: 'From door to done: put the visit in order.',
          explain: 'Check in, warm up, work through your plan, clean up, and note what you did so next time is easier.',
          steps: [
            { id: 's1', text: 'Check in and store your bag' },
            { id: 's2', text: 'Warm up for 5–10 minutes' },
            { id: 's3', text: 'Work through your planned exercises' },
            { id: 's4', text: 'Rerack weights and wipe down' },
            { id: 's5', text: 'Note what you did for next time' },
          ],
        },
        {
          id: 'u1-cp-5',
          type: 'spot',
          prompt: 'Tap everything Sam should have done differently.',
          scene: 'Sam’s Saturday session',
          explain:
            'Leaving the treadmill key unclipped, abandoning dumbbells on the floor, and pushing through sharp pain are the misses here. Setting safety arms and asking to work in were spot on.',
          lines: [
            { id: 'l1', time: '9:00', text: 'Starts the treadmill with the safety key unclipped', wrong: true, why: 'Clip it on first. It stops the belt if you slip.' },
            { id: 'l2', time: '9:15', text: 'Asks “mind if I work in?” between someone’s sets', wrong: false, why: 'Perfect timing and phrasing.' },
            { id: 'l3', time: '9:24', text: 'Sets the rack’s safety arms before squatting', wrong: false, why: 'Exactly what they’re for.' },
            { id: 'l4', time: '9:38', text: 'Leaves dumbbells on the floor by the bench', wrong: true, why: 'Rerack them in their matching slot.' },
            { id: 'l5', time: '9:45', text: 'Keeps pressing through a sharp pain in the shoulder', wrong: true, why: 'Sharp pain means stop that exercise.' },
          ],
        },
        {
          id: 'u1-cp-6',
          type: 'picture',
          prompt: 'Which of these do you load with plates and secure with collars?',
          explain: 'A barbell is a long bar with sleeves on each end for plates. Collars clip onto the sleeves so plates can’t slide off.',
          options: [
            { id: 'db', art: 'dumbbell', label: 'Dumbbell' },
            { id: 'bb', art: 'barbell', label: 'Barbell' },
            { id: 'kb', art: 'kettlebell', label: 'Kettlebell' },
            { id: 'cb', art: 'cable', label: 'Cable machine' },
          ],
          answer: 'bb',
        },
        {
          id: 'u1-cp-7',
          type: 'match',
          prompt: 'Match the term to its meaning.',
          explain: 'These four words cover most of what makes a gym feel unfamiliar on day one.',
          pairs: [
            { id: 'p1', left: 'Rerack', right: 'Put weights back where they belong' },
            { id: 'p2', left: 'Work in', right: 'Take turns between sets' },
            { id: 'p3', left: 'Safety arms', right: 'Catch the bar if a rep fails' },
            { id: 'p4', left: 'Warm-up', right: 'Easy movement to get ready' },
          ],
        },
        {
          id: 'u1-cp-8',
          type: 'choice',
          prompt: 'Mid-exercise, something feels sharp or painful, not just hard work. What do you do?',
          explain:
            'Effort, muscle burn and breathing hard are normal. Sharp, sudden or joint pain is not. Stop that exercise, and if pain sticks around, get it checked by a qualified health professional.',
          options: [
            { id: 'a', text: 'Stop that exercise. If it lingers, see a health professional' },
            { id: 'b', text: 'Finish the set, then decide', why: 'Sharp pain is the signal to stop now, not after more reps.' },
            { id: 'c', text: 'Add weight so the set ends sooner', why: 'More load on something that hurts makes things worse.' },
          ],
          answer: 'a',
        },
      ],
    },
  ],
};
