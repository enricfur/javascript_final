const {
  Warrior,
  Archer,
  Mage,
  Dwarf,
  Crossbowman,
  Demiurge
} = require('./src/player');

const { play } = require('./src/play');

const players = [
  new Warrior(0, 'Алёша Попович'),
  new Archer(3, 'Леголас'),
  new Mage(5, 'Гендальф'),
  new Dwarf(7, 'Гимли'),
  new Crossbowman(10, 'Вильгельм'),
  new Demiurge(12, 'Заратос')
];

play(players);
