const { v4: uuidv4 } = require('uuid');

const TRUTH_QUESTIONS = [
  "What's your biggest fear?",
  "Have you ever lied to your best friend?",
  "What's something you keep secret?",
  "If you could change one thing about yourself, what would it be?",
  "Have you ever cheated on a test?",
  "What's your most embarrassing moment?",
  "Would you rather be rich or famous?",
  "Have you ever had a crush on someone you shouldn't have?",
  "What's the worst thing you've done?",
  "Do you believe in second chances?"
];

const DARE_QUESTIONS = [
  "Do a funny dance for 30 seconds",
  "Sing your favorite song out loud",
  "Tell a joke to the group",
  "Do 10 push-ups",
  "Compliment everyone in the chat",
  "Change your profile picture to something funny",
  "Say 'purple elephant' 5 times fast",
  "Act like an animal for 1 minute",
  "Yell 'WOOP WOOP' in the chat",
  "Give yourself a funny nickname for the day"
];

const getTruthQuestion = () => {
  return TRUTH_QUESTIONS[Math.floor(Math.random() * TRUTH_QUESTIONS.length)];
};

const getDareQuestion = () => {
  return DARE_QUESTIONS[Math.floor(Math.random() * DARE_QUESTIONS.length)];
};

const createUnoCards = () => {
  const colors = ['red', 'blue', 'yellow', 'green'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const specials = ['skip', 'reverse', 'draw2'];
  const wilds = ['wild', 'wild_draw4'];

  let deck = [];

  // Add number cards
  colors.forEach(color => {
    numbers.forEach(number => {
      deck.push(`${color}_${number}`);
    });
    specials.forEach(special => {
      deck.push(`${color}_${special}`);
      deck.push(`${color}_${special}`);
    });
  });

  // Add wild cards
  for (let i = 0; i < 4; i++) {
    deck.push('wild');
    deck.push('wild_draw4');
  }

  return deck.sort(() => Math.random() - 0.5);
};

const drawCard = (deck) => {
  if (deck.length === 0) return null;
  return deck.pop();
};

const isValidPlay = (card, topCard) => {
  if (card.includes('wild')) return true;
  const [cardColor, cardValue] = card.split('_');
  const [topColor, topValue] = topCard.split('_');
  return cardColor === topColor || cardValue === topValue;
};

const generateRoomId = () => {
  return uuidv4().slice(0, 8).toUpperCase();
};

module.exports = {
  getTruthQuestion,
  getDareQuestion,
  createUnoCards,
  drawCard,
  isValidPlay,
  generateRoomId
};
