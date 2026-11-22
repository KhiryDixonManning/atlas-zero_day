// The writing. One voice, remembering one person.
export const NOTE = {
  top: ['Lily,', 'I don’t write things down much.', 'But I kept remembering things', 'you said in passing,'],
  mid: ['long after we’d moved on', 'to the next joke.', 'So I made a place to keep them.', 'It isn’t a claim about who you are.'],
  bot: ['It’s just what I noticed', 'from where I was standing.', 'Tell me what I got wrong.', 'Turn the page when you’re ready.'],
};

export const PAGES = [
  { id: 'note', kind: 'note', title: 'A note, first' },
  {
    id: 'stickers', title: 'The stickers', art: 'sticker',
    body: [
      'I’ve started thinking of your stickers as a language.',
      'There’s the one you send when I’ve said something too sincere and you need a second. The one that means “I’m not admitting anything.” The grumpy one that, as far as I can tell, is the closest a sticker gets to a hug.',
      'I’ve gotten pretty fluent. You can keep pretending they don’t mean anything. I’ll keep reading them anyway.',
    ],
    hint: 'the sticker peels',
  },
  {
    id: 'pause', title: 'The pause', art: 'bubbles',
    body: [
      'Most of the time you deflect. You tease, you get mock-offended, you change the subject with a joke. I like that version of you. It’s quick and it’s funny and it keeps me on my toes.',
      'But every so often, usually late, usually after a lot of back and forth, you stop. You just say the real thing. No sticker. No “anyway.”',
      'I never make a big deal of it when it happens. But I notice. Every time.',
    ],
    hint: 'tap the last bubble',
  },
  {
    id: 'attached', title: 'The thing you said once', art: 'leaf',
    body: [
      'You told me you don’t like getting attached. You said it lightly, the way you say most things that aren’t light.',
      'I’m not going to pretend I understand everything behind that. I don’t. What I know is that you said it to me anyway, and that felt like it took something.',
      'I’ve been careful with it ever since. I’m not in a hurry. I’m just glad to be here.',
    ],
  },
  {
    id: 'reading', title: 'Reading people', art: 'notes',
    body: [
      'You’ve told me, more than once, that you’re not always sure what people mean. Tone. Hints. The thing under the thing. You said it like a confession.',
      'Here’s what I’ve actually seen: someone who went and studied psychology partly because she wanted to understand people and what they feel. That isn’t someone who’s bad at this. That’s someone who cared enough to take it seriously.',
      'Also, for the record: you read me just fine.',
    ],
    hint: 'tap the notes',
  },
  {
    id: 'loud', title: 'Loud, in the best way', art: 'outfits',
    body: [
      'You make things. Costumes, outfits, characters, whole versions of yourself for a day. You talk about a wig or a fabric the way other people talk about the weather, except you actually care.',
      'I like watching you get excited about something. You don’t do it halfway.',
      'There’s a lot of you, and none of it is boring.',
    ],
    hint: 'tap the sketch',
  },
  {
    id: 'flowers', title: 'The flowers', art: 'tag',
    body: [
      'I wanted to buy you flowers. That week I didn’t really have the money for it, and you knew that, and you told me not to. Not in a “you shouldn’t” way. In an “I’d rather you be okay” way.',
      'I thought about that for a long time. It’s a small thing. It’s also exactly the kind of thing I don’t forget.',
      'So: these are the flowers. They cost me a lot of late nights, and nothing else.',
    ],
    hint: 'tap the tag',
  },
  {
    id: 'comforts', title: 'Small comforts', art: 'comforts',
    body: [
      'A short list of things that make you happy, as observed:',
      'Your cat, who you talk about like a roommate with opinions. Dumplings, any time of day, no further notes. Cinnamon Toast Crunch, which you defend like it’s a position.',
      'I don’t know why I like knowing this list so much. I just do.',
    ],
    hint: 'the cat and the bowl',
  },
  {
    id: 'songs', title: 'Shared songs', art: 'headphones',
    body: [
      'Sometimes you send me a song with no explanation. I’ve learned that is the explanation.',
      'I listen to every one. Some I’d never have found. A few I can’t hear anymore without thinking of the exact moment you sent them.',
      'Keep sending them. I’m keeping them.',
    ],
    hint: 'tap the headphones',
  },
  {
    id: 'us', title: 'Us, so far', art: 'bench',
    body: [
      'I don’t know what to call this yet, and I don’t think it needs a name today.',
      'I know we laugh a lot. I know you tease me and I tease you back, and somewhere in there it turned into something warmer. I know the conversations that start as jokes and end up somewhere real are my favorite part of a week.',
      'That’s plenty to be grateful for. So I am.',
    ],
  },
  {
    id: 'finale', kind: 'finale', title: 'The last page',
    closing: [
      'I don’t know everything about you. I’d be suspicious of anyone who said they did.',
      'What I have is this: a growing collection of things I’ve noticed, and the feeling of still being surprised by you.',
      'That’s the part I like most. Not that I’ve figured you out. That I get to keep looking.',
    ],
    sign: '— still noticing',
  },
];
