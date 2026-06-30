// Curated kid-friendly word bank for Park Hunt. Each is 3–8 letters,
// generally readable for ages 5–10, and themed around things a child
// can picture in a park (nature, animals, family, magic, feelings).
//
// 300+ words → plenty of room for the weekly 100-word shuffle without
// rotation feeling stale.

export const PARK_HUNT_WORDS: string[] = [
  // Nature & weather
  "TREE", "LEAF", "FLOWER", "GRASS", "ROCK", "POND", "RIVER", "CLOUD",
  "SUN", "MOON", "STAR", "RAIN", "SNOW", "WIND", "SKY", "RAINBOW",
  "STONE", "PETAL", "BRANCH", "ROOT", "BUSH", "GRASS", "DEW", "MIST",
  "LIGHT", "SHADOW", "BREEZE", "FROST", "ICE",

  // Animals (park-friendly)
  "BIRD", "EAGLE", "DUCK", "OWL", "SWAN", "FROG", "FISH", "BEE",
  "ANT", "BUG", "BUTTERFLY", "WORM", "SNAIL", "RABBIT", "FOX", "DEER",
  "MOUSE", "SQUIRREL", "BAT", "DOG", "CAT", "PUPPY", "KITTEN", "CHICK",
  "LAMB", "PONY", "TURTLE", "BEAVER", "BADGER", "HEDGEHOG", "OTTER",

  // Family & people
  "MOM", "DAD", "BABY", "FRIEND", "SISTER", "BROTHER", "AUNT", "UNCLE",
  "GRANNY", "FAMILY", "BOY", "GIRL", "KID", "CHILD",

  // Feelings
  "JOY", "LOVE", "HOPE", "KIND", "BRAVE", "HAPPY", "PROUD", "CALM",
  "PEACE", "GENTLE", "SMILE", "LAUGH", "HUG", "CARE", "WARM",

  // Actions
  "RUN", "JUMP", "HOP", "SKIP", "WALK", "PLAY", "DANCE", "SING",
  "READ", "DRAW", "PAINT", "WRITE", "BUILD", "BAKE", "MAKE", "FLY",
  "SWIM", "CLIMB", "FIND", "LOOK", "SEEK", "SHARE", "GIVE", "HELP",

  // Park objects
  "SWING", "SLIDE", "PARK", "BENCH", "PATH", "GATE", "FENCE", "BRIDGE",
  "STEP", "TRAIL", "FIELD", "MEADOW", "GARDEN", "TENT", "KITE", "BALL",
  "BIKE", "BOAT", "WAGON", "DRUM",

  // Food (kid-positive)
  "APPLE", "BREAD", "MILK", "EGG", "JUICE", "WATER", "CAKE", "HONEY",
  "BERRY", "GRAPE", "PEACH", "PEAR", "LEMON", "MANGO", "PIZZA",

  // Magic / Ms. Feather Pop voice
  "FEATHER", "WING", "NEST", "EGG", "GLOW", "SHINE", "SPARK", "SPARKLE",
  "MAGIC", "DREAM", "WISH", "STARDUST", "QUEST", "STORY", "SECRET",
  "TREASURE", "JEWEL", "CROWN", "WAND", "POTION", "RIDDLE",

  // Colors
  "RED", "BLUE", "GREEN", "GOLD", "PINK", "PURPLE", "ORANGE", "YELLOW",
  "WHITE", "BLACK", "BROWN", "SILVER",

  // Numbers (word form)
  "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT",
  "NINE", "TEN",

  // Times & celebrations
  "DAY", "NIGHT", "MORNING", "NOON", "EVENING", "TODAY", "PARTY",
  "BIRTHDAY", "PICNIC", "VISIT", "TRIP", "ADVENTURE",

  // Storybook things
  "FAIRY", "PIXIE", "DRAGON", "PHOENIX", "PEGASUS", "UNICORN", "KING",
  "QUEEN", "PRINCE", "KNIGHT", "MAP", "CASTLE", "TOWER", "FOREST",
  "CAVE", "VALLEY", "MOUNTAIN", "ISLAND",

  // Sounds & music
  "SONG", "TUNE", "BEAT", "NOTE", "DRUM", "BELL", "WHISTLE", "CHIRP",
  "HUM", "TWEET", "ROAR", "GIGGLE",

  // Misc kid-vocabulary
  "BOOK", "WORD", "LETTER", "SCHOOL", "TEACHER", "BUDDY", "CLUB",
  "HOUSE", "ROOM", "WINDOW", "DOOR", "ROOF", "CHAIR", "TABLE", "BED",
  "CUP", "PLATE", "SPOON", "FORK", "BOWL", "BOTTLE",

  // Heroic
  "HERO", "CHAMPION", "WINNER", "EXPLORER", "READER", "ARTIST",
  "BUILDER", "HELPER", "LEADER", "DREAMER", "STAR",
];

// De-dupe (some categories overlap) and uppercase.
const SET = new Set<string>();
for (const w of PARK_HUNT_WORDS) SET.add(w.toUpperCase());
export const PARK_HUNT_BANK: string[] = Array.from(SET);

export function bankSize(): number {
  return PARK_HUNT_BANK.length;
}
