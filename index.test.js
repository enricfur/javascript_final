const {
  Weapon,
  Arm,
  Bow,
  Sword,
  Knife,
  Staff,
  LongBow,
  Axe,
  StormStaff,
  Player,
  Warrior,
  Archer,
  Mage,
  Dwarf,
  Crossbowman,
  Demiurge,
  play,
  getAlivePlayers
} = require('./index');

afterEach(function () {
  jest.restoreAllMocks();
});

describe('Weapon', function () {
  test('создаётся с правильными свойствами', function () {
    let weapon = new Weapon('Старый меч', 20, 10, 1);

    expect(weapon.name).toBe('Старый меч');
    expect(weapon.attack).toBe(20);
    expect(weapon.durability).toBe(10);
    expect(weapon.initDurability).toBe(10);
    expect(weapon.range).toBe(1);
  });

  test('takeDamage уменьшает durability, не ниже 0', function () {
    let weapon = new Weapon('Старый меч', 20, 10, 1);

    weapon.takeDamage(5);
    expect(weapon.durability).toBe(5);

    weapon.takeDamage(50);
    expect(weapon.durability).toBe(0);
  });

  test('Arm не ломается', function () {
    let arm = new Arm();

    arm.takeDamage(1000);
    expect(arm.durability).toBe(Infinity);
    expect(arm.isBroken()).toBe(false);
  });

  test('getDamage: полный, половинный, нулевой урон', function () {
    let bow = new Bow();

    expect(bow.getDamage()).toBe(10);

    bow.takeDamage(100);
    expect(bow.getDamage()).toBe(10);

    bow.takeDamage(50);
    expect(bow.getDamage()).toBe(5);

    bow.takeDamage(150);
    expect(bow.getDamage()).toBe(0);
  });

  test('getDamage: ровно 30% durability — полный урон', function () {
    let weapon = new Weapon('Test', 20, 100, 1);

    weapon.takeDamage(70);
    expect(weapon.getDamage()).toBe(20);
  });

  test('isBroken работает корректно', function () {
    let sword = new Sword();

    expect(sword.isBroken()).toBe(false);

    sword.takeDamage(500);
    expect(sword.isBroken()).toBe(true);
  });

  test('создаются все классы оружия', function () {
    expect(new Bow().name).toBe('Лук');
    expect(new Sword().name).toBe('Меч');
    expect(new Knife().name).toBe('Нож');
    expect(new Staff().name).toBe('Посох');
  });

  test('улучшенные оружия имеют корректные свойства', function () {
    let longBow = new LongBow();
    let axe = new Axe();
    let stormStaff = new StormStaff();

    expect(longBow.name).toBe('Длинный лук');
    expect(longBow.attack).toBe(15);
    expect(longBow.range).toBe(4);
    expect(longBow.durability).toBe(200);

    expect(axe.name).toBe('Секира');
    expect(axe.attack).toBe(27);
    expect(axe.durability).toBe(800);

    expect(stormStaff.name).toBe('Посох Бури');
    expect(stormStaff.attack).toBe(10);
    expect(stormStaff.range).toBe(3);
  });
});

describe('Player', function () {
  test('создаётся с правильными начальными значениями', function () {
    let player = new Player(10, 'Бэтмен');

    expect(player.life).toBe(100);
    expect(player.magic).toBe(20);
    expect(player.speed).toBe(1);
    expect(player.attack).toBe(10);
    expect(player.agility).toBe(5);
    expect(player.luck).toBe(10);
    expect(player.description).toBe('Игрок');
    expect(player.weapon instanceof Arm).toBe(true);
    expect(player.position).toBe(10);
    expect(player.name).toBe('Бэтмен');
  });

  test('getLuck возвращает значение по формуле', function () {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    let player = new Player(10, 'Бэтмен');

    expect(player.getLuck()).toBe(0.6);
  });

  test('getDamage: формула и проверка range', function () {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    let player = new Player(10, 'Человек паук');

    expect(player.getDamage(1)).toBe(6.6);
    expect(player.getDamage(2)).toBe(0);
  });

  test('takeDamage уменьшает life, не ниже 0', function () {
    let player = new Player(10, 'Хоббит');

    player.takeDamage(10);
    expect(player.life).toBe(90);

    player.takeDamage(200);
    expect(player.life).toBe(0);
  });

  test('isDead работает корректно', function () {
    let player = new Player(0, 'Тест');

    expect(player.isDead()).toBe(false);

    player.takeDamage(100);
    expect(player.isDead()).toBe(true);
  });

  test('moveLeft и moveRight — пример из ТЗ', function () {
    let warrior = new Warrior(6, 'Алёша Попович');

    warrior.moveLeft(5);
    expect(warrior.position).toBe(4);

    warrior.moveRight(2);
    expect(warrior.position).toBe(6);

    warrior.moveRight(1);
    expect(warrior.position).toBe(7);
  });

  test('move вызывает moveLeft при отрицательном distance', function () {
    let player = new Player(5, 'Тест');

    player.move(-10);
    expect(player.position).toBe(4);
  });

  test('isAttackBlocked: true при высокой удаче', function () {
    let player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(1.5);
    expect(player.isAttackBlocked()).toBe(true);
  });

  test('isAttackBlocked: false при низкой удаче', function () {
    let player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(0.1);
    expect(player.isAttackBlocked()).toBe(false);
  });

  test('dodged: true при высокой удаче', function () {
    let player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(1.5);
    expect(player.dodged()).toBe(true);
  });

  test('dodged: false при низкой удаче', function () {
    let player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(0.1);
    expect(player.dodged()).toBe(false);
  });

  test('takeAttack: блок — урон в оружие, оружие меняется если сломалось', function () {
    let warrior = new Warrior(0, 'Тест');

    jest.spyOn(warrior, 'isAttackBlocked').mockReturnValue(true);
    warrior.weapon.durability = 10;
    warrior.takeAttack(20);

    expect(warrior.life).toBe(120);
    expect(warrior.weapon instanceof Knife).toBe(true);
  });

  test('takeAttack: уклонение — урон не засчитывается', function () {
    let player = new Player(0, 'Тест');

    jest.spyOn(player, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(player, 'dodged').mockReturnValue(true);
    player.takeAttack(20);

    expect(player.life).toBe(100);
  });

  test('takeAttack: обычный урон', function () {
    let player = new Player(0, 'Тест');

    jest.spyOn(player, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(player, 'dodged').mockReturnValue(false);
    player.takeAttack(20);

    expect(player.life).toBe(80);
  });

  test('chooseEnemy выбирает игрока с минимальным life', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(5, 'Лучник');
    let mage = new Mage(10, 'Маг');

    mage.life = 10;

    expect(warrior.chooseEnemy([warrior, archer, mage])).toBe(mage);
  });

  test('chooseEnemy возвращает null если нет живых врагов', function () {
    let player = new Player(0, 'Тест');

    expect(player.chooseEnemy([player])).toBeNull();
  });

  test('tryAttack изнашивает оружие и наносит урон', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(1, 'Лучник');

    jest.spyOn(warrior, 'getLuck').mockReturnValue(1);
    jest.spyOn(archer, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(archer, 'dodged').mockReturnValue(false);

    warrior.tryAttack(archer);

    expect(warrior.weapon.durability).toBe(490);
    expect(archer.life).toBeLessThan(80);
  });

  test('tryAttack: враг вне досягаемости — атаки нет', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(5, 'Лучник');

    jest.spyOn(archer, 'takeAttack');
    warrior.tryAttack(archer);

    expect(archer.takeAttack).not.toHaveBeenCalled();
  });

  test('tryAttack: вплотную — враг отлетает, урон удвоен', function () {
    let warrior = new Warrior(5, 'Воин');
    let archer = new Archer(5, 'Лучник');

    jest.spyOn(warrior, 'getLuck').mockReturnValue(1);
    jest.spyOn(archer, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(archer, 'dodged').mockReturnValue(false);

    warrior.tryAttack(archer);

    expect(archer.position).toBe(6);
    expect(archer.life).toBeLessThan(80);
  });

  test('turn двигается к врагу и атакует', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(10, 'Лучник');

    jest.spyOn(warrior, 'tryAttack');
    warrior.turn([warrior, archer]);

    expect(warrior.tryAttack).toHaveBeenCalledWith(archer);
  });

  test('moveToEnemy двигает к врагу', function () {
    let warrior = new Warrior(0, 'Воин');
    let enemy = new Archer(10, 'Лучник');

    warrior.moveToEnemy(enemy);

    expect(warrior.position).toBe(2);
  });
});

describe('checkWeapon — цепочки замены', function () {
  test('Warrior: Sword -> Knife -> Arm', function () {
    let warrior = new Warrior(0, 'Тест');

    warrior.weapon.durability = 0;
    warrior.checkWeapon();
    expect(warrior.weapon instanceof Knife).toBe(true);

    warrior.weapon.durability = 0;
    warrior.checkWeapon();
    expect(warrior.weapon instanceof Arm).toBe(true);
  });

  test('Archer: Bow -> Knife -> Arm', function () {
    let archer = new Archer(0, 'Тест');

    archer.weapon.durability = 0;
    archer.checkWeapon();
    expect(archer.weapon instanceof Knife).toBe(true);

    archer.weapon.durability = 0;
    archer.checkWeapon();
    expect(archer.weapon instanceof Arm).toBe(true);
  });

  test('Mage: Staff -> Knife -> Arm', function () {
    let mage = new Mage(0, 'Тест');

    mage.weapon.durability = 0;
    mage.checkWeapon();
    expect(mage.weapon instanceof Knife).toBe(true);

    mage.weapon.durability = 0;
    mage.checkWeapon();
    expect(mage.weapon instanceof Arm).toBe(true);
  });

  test('Dwarf: Axe -> Knife -> Arm', function () {
    let dwarf = new Dwarf(0, 'Тест');

    dwarf.weapon.durability = 0;
    dwarf.checkWeapon();
    expect(dwarf.weapon instanceof Knife).toBe(true);

    dwarf.weapon.durability = 0;
    dwarf.checkWeapon();
    expect(dwarf.weapon instanceof Arm).toBe(true);
  });

  test('Crossbowman: LongBow -> Knife -> Arm', function () {
    let crossbowman = new Crossbowman(0, 'Тест');

    crossbowman.weapon.durability = 0;
    crossbowman.checkWeapon();
    expect(crossbowman.weapon instanceof Knife).toBe(true);

    crossbowman.weapon.durability = 0;
    crossbowman.checkWeapon();
    expect(crossbowman.weapon instanceof Arm).toBe(true);
  });

  test('Demiurge: StormStaff -> Knife -> Arm', function () {
    let demiurge = new Demiurge(0, 'Тест');

    demiurge.weapon.durability = 0;
    demiurge.checkWeapon();
    expect(demiurge.weapon instanceof Knife).toBe(true);

    demiurge.weapon.durability = 0;
    demiurge.checkWeapon();
    expect(demiurge.weapon instanceof Arm).toBe(true);
  });
});

describe('Warrior', function () {
  test('создаётся с правильными свойствами', function () {
    let warrior = new Warrior(0, 'Тест');

    expect(warrior.life).toBe(120);
    expect(warrior.speed).toBe(2);
    expect(warrior.weapon instanceof Sword).toBe(true);
  });

  test('takeDamage: обычный урон при life >= 60', function () {
    let warrior = new Warrior(0, 'Тест');

    warrior.takeDamage(50);
    expect(warrior.life).toBe(70);
    expect(warrior.magic).toBe(20);
  });

  test('takeDamage: урон в ману при life < 60 и getLuck > 0.8', function () {
    let warrior = new Warrior(0, 'Тест');

    warrior.life = 50;
    jest.spyOn(warrior, 'getLuck').mockReturnValue(0.9);

    warrior.takeDamage(5);
    expect(warrior.life).toBe(50);
    expect(warrior.magic).toBe(15);
  });

  test('takeDamage: переполнение маны — остаток в life', function () {
    let warrior = new Warrior(0, 'Тест');

    warrior.life = 50;
    warrior.magic = 5;
    jest.spyOn(warrior, 'getLuck').mockReturnValue(0.9);

    warrior.takeDamage(15);
    expect(warrior.magic).toBe(0);
    expect(warrior.life).toBe(40);
  });
});

describe('Archer', function () {
  test('создаётся с правильными свойствами', function () {
    let archer = new Archer(0, 'Тест');

    expect(archer.life).toBe(80);
    expect(archer.magic).toBe(35);
    expect(archer.agility).toBe(10);
    expect(archer.weapon instanceof Bow).toBe(true);
  });

  test('getDamage: урон растёт с дистанцией', function () {
    let archer = new Archer(0, 'Тест');

    jest.spyOn(archer, 'getLuck').mockReturnValue(1);
    expect(archer.getDamage(3)).toBeGreaterThan(archer.getDamage(1));
  });

  test('getDamage: формула из ТЗ', function () {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    let archer = new Archer(0, 'Леголас');

    expect(archer.getDamage(3)).toBe(9);
  });
});

describe('Mage', function () {
  test('создаётся с правильными свойствами', function () {
    let mage = new Mage(0, 'Тест');

    expect(mage.life).toBe(70);
    expect(mage.magic).toBe(100);
    expect(mage.weapon instanceof Staff).toBe(true);
  });

  test('takeDamage: полная цепочка из ТЗ', function () {
    let mage = new Mage(10, 'Гендальф');

    mage.takeDamage(50);
    expect(mage.life).toBe(45);
    expect(mage.magic).toBe(88);

    mage.takeDamage(20);
    expect(mage.life).toBe(35);
    expect(mage.magic).toBe(76);

    mage.takeDamage(10);
    expect(mage.life).toBe(30);
    expect(mage.magic).toBe(64);

    mage.takeDamage(20);
    expect(mage.life).toBe(20);
    expect(mage.magic).toBe(52);

    mage.takeDamage(20);
    expect(mage.life).toBe(10);
    expect(mage.magic).toBe(40);

    mage.takeDamage(10);
    expect(mage.life).toBe(0);
  });
});

describe('Dwarf', function () {
  test('создаётся с правильными свойствами', function () {
    let dwarf = new Dwarf(0, 'Тест');

    expect(dwarf.life).toBe(130);
    expect(dwarf.attack).toBe(15);
    expect(dwarf.luck).toBe(20);
    expect(dwarf.weapon instanceof Axe).toBe(true);
  });

  test('каждый шестой удар вдвое слабее при getLuck > 0.5', function () {
    let dwarf = new Dwarf(0, 'Тест');

    jest.spyOn(dwarf, 'getLuck').mockReturnValue(0.9);

    for (let i = 0; i < 5; ++i) {
      dwarf.takeDamage(10);
    }

    let lifeBefore = dwarf.life;
    dwarf.takeDamage(10);

    expect(dwarf.life).toBe(lifeBefore - 5);
  });
});

describe('Crossbowman', function () {
  test('создаётся с правильными свойствами', function () {
    let crossbowman = new Crossbowman(0, 'Тест');

    expect(crossbowman.life).toBe(85);
    expect(crossbowman.agility).toBe(20);
    expect(crossbowman.luck).toBe(15);
    expect(crossbowman.weapon instanceof LongBow).toBe(true);
  });
});

describe('Demiurge', function () {
  test('создаётся с правильными свойствами', function () {
    let demiurge = new Demiurge(0, 'Тест');

    expect(demiurge.life).toBe(80);
    expect(demiurge.magic).toBe(120);
    expect(demiurge.luck).toBe(12);
    expect(demiurge.weapon instanceof StormStaff).toBe(true);
  });

  test('getDamage: x1.5 при magic > 0 и luck > 0.6', function () {
    let demiurge = new Demiurge(0, 'Тест');
    let luck = 0.9;
    let base = (demiurge.attack + demiurge.weapon.getDamage()) * luck / 1;

    jest.spyOn(demiurge, 'getLuck').mockReturnValue(luck);
    expect(demiurge.getDamage(1)).toBeCloseTo(base * 1.5, 1);
  });

  test('getDamage: без усиления при magic = 0', function () {
    let demiurge = new Demiurge(0, 'Тест');
    let luck = 0.9;
    let base = (demiurge.attack + demiurge.weapon.getDamage()) * luck / 1;

    demiurge.magic = 0;
    jest.spyOn(demiurge, 'getLuck').mockReturnValue(luck);
    expect(demiurge.getDamage(1)).toBeCloseTo(base, 1);
  });
});

describe('getAlivePlayers', function () {
  test('возвращает только живых игроков', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(1, 'Лучник');

    archer.life = 0;
    expect(getAlivePlayers([warrior, archer])).toEqual([warrior]);
  });
});

describe('play', function () {
  test('возвращает единственного выжившего', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(1, 'Лучник');

    jest.spyOn(warrior, 'getLuck').mockReturnValue(1);
    jest.spyOn(archer, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(archer, 'dodged').mockReturnValue(false);

    archer.life = 1;
    expect(play([warrior, archer])).toBe(warrior);
  });

  test('возвращает null если все мертвы', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(1, 'Лучник');

    warrior.life = 0;
    archer.life = 0;
    expect(play([warrior, archer])).toBeNull();
  });

  test('завершает бой по лимиту раундов', function () {
    let warrior = new Warrior(0, 'Воин');
    let archer = new Archer(1, 'Лучник');

    jest.spyOn(warrior, 'turn').mockImplementation(function () {});
    jest.spyOn(archer, 'turn').mockImplementation(function () {});

    expect(play([warrior, archer])).toBeNull();
  });
});
