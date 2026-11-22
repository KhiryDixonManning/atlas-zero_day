// The writing. One voice, remembering one person.
// Nothing here quotes her. Everything here is something she actually shared, or something I actually noticed.

// The letter that unfolds from the envelope: three panels, four short lines each (keep lines under ~36 characters).
export const NOTE = {
  top: ['Lily,', 'I’ve been paying attention.', 'Not in a weird way.', '(Okay. A little in a weird way.)'],
  mid: ['You say things in passing', 'and move on to the next joke,', 'and I keep finding them later,', 'still in my pocket.'],
  bot: ['So I made a place to keep them.', 'None of this is a theory about you.', 'It’s just what I noticed.', 'Turn the page when you’re ready.'],
};

// The journal. Each page has one job in the arc:
// curiosity → playfulness → recognition → creativity → vulnerability → being understood → thoughtfulness → comfort → connection → warmth → peace.
export const PAGES = [
  {
    id: 'open', title: 'Things I noticed', art: 'inklily',
    body: [
      'I don’t think you realize how much you’ve told me. Not in long speeches. In asides. In the half-sentence right before a joke.',
      'I started keeping them. Not to figure you out. Just because I didn’t want to lose any.',
      'Here they are, roughly in the order they happened to me.',
    ],
  },
  {
    id: 'stickers', title: 'The stickers', art: 'sticker',
    body: [
      'You have a whole dialect I’m still learning. The teasing. The dramatic offense when I say something nice. The sticker that arrives instead of an answer.',
      'I’ve started reading the stickers as answers anyway. I’m probably wrong about half of them. I’m keeping all of them.',
      'For the record: you being difficult on purpose is one of my favorite things about talking to you.',
    ],
    hint: 'peel the sticker',
    under: 'translation: still working on it.',
  },
  {
    id: 'pause', title: 'When the act drops', art: 'bubbles',
    body: [
      'Most of the time you keep the jokes between us like a little fence. I like the fence. It’s funny and it’s quick and it keeps me on my toes.',
      'But every now and then you set it down, and for a minute I get to see what you actually feel about something.',
      'Those minutes are small. They’re also the ones I’d keep if I could only keep a few. I never make a big deal of it in the moment. I’m making a big deal of it here.',
    ],
    hint: 'tap the last bubble',
  },
  {
    id: 'loud', title: 'Loud, in the best way', art: 'outfits',
    body: [
      'Cosplay. Fashion. Modeling. You don’t just like these things, you build with them: a look, a character, a version of a day that didn’t exist until you decided it should.',
      'There’s an honesty in that. You say what you think, you wear what you mean, and you don’t ask permission to take up the room.',
      'I could watch you get excited about a new idea all day. You don’t do anything at half volume.',
    ],
    hint: 'tap the sketch',
    margin: 'and yes. I notice the outfits.',
  },
  {
    id: 'attached', title: 'The thing you said once', art: 'leaf',
    body: [
      'You told me you don’t like getting attached.',
      'I think about that more than you’d guess. Not because it worried me. Because you said it to me at all. You handed me something true, and you didn’t have to.',
      'I don’t have a clever response to it. I just want you to know it landed somewhere safe. I’m not in a hurry, and I’m not keeping score. I’m glad to be here, at whatever pace here happens.',
    ],
  },
  {
    id: 'reading', title: 'Reading people', art: 'notes',
    body: [
      'You’ve told me you sometimes struggle to read people. Tone, cues, what someone actually means underneath what they said.',
      'Here’s what I keep noticing: you went toward that, not away from it. You picked psychology partly because you wanted to understand how people think and feel. That isn’t a weakness looking for cover. That’s curiosity with its sleeves rolled up.',
      'And for what it’s worth: you read me fine.',
    ],
    hint: 'tap the notes',
  },
  {
    id: 'flowers', title: 'The flowers', art: 'tag',
    body: [
      'I wanted to buy you flowers. Money was tight, and instead of just letting me, you worried about me spending it.',
      'I’ve thought about that a lot. You were being handed something nice, and your first instinct was to make sure I was okay. That isn’t a small thing. That’s the whole thing.',
      'So, here. These ones didn’t cost anything but a lot of late nights. You’re allowed to keep them.',
    ],
    hint: 'tap the tag',
    margin: 'the real ones are still coming. no rush.',
  },
  {
    id: 'comforts', title: 'Small comforts', art: 'comforts',
    body: [
      'A short, incomplete list of things that make you happy, as observed from a respectful distance:',
      'Your cat. Dumplings, at any hour, with no justification required. Cinnamon Toast Crunch, which I have learned not to argue with.',
      'I don’t know exactly why I like knowing this list. I think it’s that none of it is for show. It’s just you, being happy about something.',
    ],
    hint: 'the cat, the bowl, the dumplings',
  },
  {
    id: 'songs', title: 'Same frequency', art: 'headphones',
    body: [
      'We share music. Some of it I would never have found on my own. Some of it I can’t hear now without thinking of you.',
      'And the humor. The teasing that’s really just two people enjoying each other’s company and refusing to say so plainly. I’d lose arguments to you on purpose to keep that going.',
      'A conversation with you can start as nonsense and end up somewhere real. I don’t take that for granted. I notice it every time.',
    ],
    hint: 'tap the headphones',
    margin: 'send me the next one.',
  },
  {
    id: 'us', title: 'Us, so far', art: 'bench',
    body: [
      'I don’t know what to call this yet, and I don’t think it needs a name today.',
      'I know we laugh a lot. I know you tease me and I tease you back, and somewhere in there it got warmer, and neither of us made an announcement about it.',
      'That’s plenty. Honestly, that’s more than plenty. I’m grateful for it exactly as it is.',
    ],
  },
  {
    id: 'finale', kind: 'finale', title: 'The last page',
    closing: [
      'I don’t know everything about you. I’d be suspicious of anyone who claimed to.',
      'What I have is this: a small collection of true things, and the feeling of still being surprised by you.',
      'I like what I’ve found so far. I like even more that there’s more. Whatever you decide to share next, I’ll be paying attention.',
    ],
    sign: '— still noticing',
    caption: 'Lilium candidum · the white lily',
  },
];
