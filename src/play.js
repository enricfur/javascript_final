function play(players) {
  const maxRounds = 1000;
  let round = 0;

  console.log('=== КОРОЛЕВСКАЯ БИТВА НАЧИНАЕТСЯ ===');

  while (round < maxRounds) {
    const alive = players.filter(function (player) {
      return !player.isDead();
    });

    if (alive.length <= 1) {
      break;
    }

    for (let i = 0; i < alive.length; ++i) {
      if (!alive[i].isDead()) {
        alive[i].turn(alive);
      }
    }

    round += 1;
  }

  const survivors = players.filter(function (player) {
    return !player.isDead();
  });

  if (survivors.length === 1) {
    console.log(`Победитель: ${survivors[0].description} ${survivors[0].name}!`);
    return survivors[0];
  }

  if (survivors.length === 0) {
    console.log('Все погибли. Ничья!');
    return null;
  }

  console.log('Битва завершена по лимиту раундов.');
  return null;
}

module.exports = {
  play
};
