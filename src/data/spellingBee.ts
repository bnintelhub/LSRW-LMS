const LISTS: Record<number, string[][]> = {
  3: [
    ["sun", "hat", "pen", "book", "tree", "rain", "ball", "fish"],
    ["ship", "lamp", "frog", "milk", "star", "door", "leaf", "bird"],
    ["cake", "jump", "sand", "wind", "bell", "duck", "road", "king"],
    ["play", "home", "gold", "snow", "farm", "gift", "song", "flag"],
  ],
  4: [
    ["school", "friend", "garden", "pencil", "orange", "window", "teacher", "animal"],
    ["family", "planet", "bridge", "market", "circle", "forest", "number", "silver"],
    ["morning", "holiday", "village", "picture", "weather", "library", "question", "student"],
    ["rainbow", "kitchen", "journey", "whisper", "captain", "diamond", "harvest", "freedom"],
  ],
  5: [
    ["because", "through", "science", "measure", "country", "language", "practice", "courage"],
    ["honest", "silence", "journey", "climate", "respect", "imagine", "balance", "victory"],
    ["ancient", "mystery", "grammar", "passage", "citizen", "natural", "promise", "quality"],
    ["listen", "speak", "read", "write", "focus", "effort", "habit", "progress"],
  ],
  6: [
    ["environment", "paragraph", "necessary", "knowledge", "character", "audience", "argument", "evidence"],
    ["independent", "vocabulary", "description", "conclusion", "neighbour", "schedule", "discipline", "opportunity"],
    ["communication", "responsibility", "observation", "imagination", "celebration", "information", "preparation", "explanation"],
    ["confidence", "accuracy", "fluency", "structure", "summary", "dialogue", "headline", "editorial"],
  ],
};

function isoWeek(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function spellingListFor(classNumber: number, date = new Date()) {
  const lists = LISTS[classNumber] ?? LISTS[4];
  return lists[(isoWeek(date) - 1) % lists.length];
}
