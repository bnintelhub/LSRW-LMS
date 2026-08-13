export type StorySlide = {
  emoji: string;
  text: string;
};

export type PictureStory = {
  id: string;
  title: string;
  classNumbers: number[];
  slides: StorySlide[];
};

export const PICTURE_STORIES: PictureStory[] = [
  {
    id: "red-ball",
    title: "The Red Ball",
    classNumbers: [1, 2],
    slides: [
      { emoji: "🌞", text: "The sun is up. It is a bright day." },
      { emoji: "👦", text: "Aarav finds a red ball in the garden." },
      { emoji: "⚽", text: "He kicks the ball. It rolls to a tree." },
      { emoji: "🐶", text: "A puppy runs after the ball. Aarav laughs." },
      { emoji: "🤝", text: "Aarav and the puppy play together. They are happy." },
    ],
  },
  {
    id: "school-bus",
    title: "The Yellow Bus",
    classNumbers: [1, 2, 3],
    slides: [
      { emoji: "🚌", text: "The yellow bus stops at the gate." },
      { emoji: "🎒", text: "Diya packs her bag. She is ready for school." },
      { emoji: "👋", text: "She waves to her mother and sits near the window." },
      { emoji: "📖", text: "On the bus she reads a small storybook." },
      { emoji: "🏫", text: "The bus reaches school. Diya says good morning." },
    ],
  },
  {
    id: "rainy-day",
    title: "A Rainy Day",
    classNumbers: [3, 4],
    slides: [
      { emoji: "☁️", text: "Grey clouds cover the sky after lunch." },
      { emoji: "🌧️", text: "Rain falls on the playground. The class stays inside." },
      { emoji: "📚", text: "The teacher reads a poem about rivers and boats." },
      { emoji: "🌈", text: "The rain stops. A rainbow appears over the field." },
      { emoji: "✏️", text: "The children write three sentences about the rainbow." },
    ],
  },
  {
    id: "lost-pencil",
    title: "The Lost Pencil",
    classNumbers: [2, 3, 4],
    slides: [
      { emoji: "✏️", text: "Kabir cannot find his blue pencil." },
      { emoji: "🪑", text: "He looks under the desk and near the window." },
      { emoji: "👧", text: "Anaya finds it in the art tray and smiles." },
      { emoji: "💬", text: "Kabir says thank you. Anaya says you are welcome." },
      { emoji: "🎨", text: "They share colours and finish the drawing together." },
    ],
  },
];

export function storiesForClass(classNumber: number) {
  return PICTURE_STORIES.filter((story) => story.classNumbers.includes(classNumber));
}
