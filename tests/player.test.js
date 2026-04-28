const {
  Player,
  Warrior,
  Archer,
  Mage,
  Dwarf,
  Crossbowman,
  Demiurge
} = require('../src/player');

const {
  Arm,
  Knife,
  Sword,
  Bow,
  Staff,
  Axe,
  LongBow,
  StormStaff
} = require('../src/weapon');

const { play } = require('../src/play');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Player', () => {
  test('создаётся с правильными начальными значениями', () => {
    const player = new Player(10, 'Тест');

    expect(player.life).toBe(100);
    expect(player.magic).toBe(20);
    expect(player.speed).toBe(1);
    expect(player.attack).toBe(10);
    expect(player.agility).toBe(5);
    expect(player.luck).toBe(10);
    expect(player.position).toBe(10);
    expect(player.name).toBe('Тест');
    expect(player.weapon).toBeInstanceOf(Arm);
  });

  test('getLuck возвращает значение по формуле', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(player.getLuck()).toBe(0.6);
  });

  test('takeDamage уменьшает life, не ниже 0', () => {
    const player = new Player(0, 'Тест');

    player.takeDamage(40);
    expect(player.life).toBe(60);

    player.takeDamage(1000);
    expect(player.life).toBe(0);
  });

  test('isDead работает корректно', () => {
    const player = new Player(0, 'Тест');

    expect(player.isDead()).toBe(false);

    player.takeDamage(100);
    expect(player.isDead()).toBe(true);
  });

  test('getDamage возвращает 0 при дистанции > range', () => {
    const player = new Player(0, 'Тест');

    expect(player.getDamage(2)).toBe(0);
  });

  test('moveLeft и moveRight — пример из ТЗ', () => {
    const warrior = new Warrior(6, 'Тест');

    warrior.moveLeft(5);
    expect(warrior.position).toBe(4);

    warrior.moveRight(2);
    expect(warrior.position).toBe(6);

    warrior.moveRight(1);
    expect(warrior.position).toBe(7);
  });

  test('isAttackBlocked: true при высокой удаче', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(1.5);

    expect(player.isAttackBlocked()).toBe(true);
  });

  test('isAttackBlocked: false при низкой удаче', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(0.1);

    expect(player.isAttackBlocked()).toBe(false);
  });

  test('dodged: true при высокой удаче', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(1.5);

    expect(player.dodged()).toBe(true);
  });

  test('dodged: false при низкой удаче', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(player, 'getLuck').mockReturnValue(0.1);

    expect(player.dodged()).toBe(false);
  });

  test('takeAttack: блок — урон в оружие', () => {
    const warrior = new Warrior(0, 'Тест');

    jest.spyOn(warrior, 'isAttackBlocked').mockReturnValue(true);

    warrior.takeAttack(20);

    expect(warrior.life).toBe(120);
    expect(warrior.weapon.durability).toBe(480);
  });

  test('takeAttack: уклонение — урон не засчитывается', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(player, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(player, 'dodged').mockReturnValue(true);

    player.takeAttack(20);

    expect(player.life).toBe(100);
  });

  test('takeAttack: обычный урон', () => {
    const player = new Player(0, 'Тест');

    jest.spyOn(player, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(player, 'dodged').mockReturnValue(false);

    player.takeAttack(20);

    expect(player.life).toBe(80);
  });

  test('chooseEnemy выбирает игрока с минимальным HP', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(5, 'B');
    const mage = new Mage(10, 'C');

    archer.life = 30;
    mage.life = 50;

    expect(warrior.chooseEnemy([warrior, archer, mage])).toBe(archer);
  });

  test('chooseEnemy возвращает null если нет живых врагов', () => {
    const player = new Player(0, 'Тест');

    expect(player.chooseEnemy([player])).toBeNull();
  });

  test('tryAttack: один luck на атаку — износ и урон используют одно значение', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(1, 'B');

    jest.spyOn(warrior, 'getLuck').mockReturnValue(1);
    jest.spyOn(archer, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(archer, 'dodged').mockReturnValue(false);

    warrior.tryAttack(archer);

    expect(warrior.weapon.durability).toBe(490);
    expect(archer.life).toBeLessThan(80);
  });

  test('tryAttack: враг вне досягаемости — атаки нет', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(5, 'B');

    jest.spyOn(archer, 'takeAttack');

    warrior.tryAttack(archer);

    expect(archer.takeAttack).not.toHaveBeenCalled();
  });

  test('tryAttack: вплотную — враг отлетает, урон удвоен', () => {
    const warrior = new Warrior(5, 'A');
    const archer = new Archer(5, 'B');

    jest.spyOn(warrior, 'getLuck').mockReturnValue(1);
    jest.spyOn(archer, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(archer, 'dodged').mockReturnValue(false);

    warrior.tryAttack(archer);

    expect(archer.position).toBe(6);
    expect(archer.life).toBeLessThan(80);
  });

  test('turn двигается к врагу и атакует', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(10, 'B');

    jest.spyOn(warrior, 'tryAttack');

    warrior.turn([warrior, archer]);

    expect(warrior.tryAttack).toHaveBeenCalledWith(archer);
  });
});

describe('checkWeapon — цепочки замены', () => {
  test('Warrior: Sword -> Knife -> Arm', () => {
    const warrior = new Warrior(0, 'Тест');

    warrior.weapon.durability = 0;
    warrior.checkWeapon();
    expect(warrior.weapon).toBeInstanceOf(Knife);

    warrior.weapon.durability = 0;
    warrior.checkWeapon();
    expect(warrior.weapon).toBeInstanceOf(Arm);
  });

  test('Archer: Bow -> Knife -> Arm', () => {
    const archer = new Archer(0, 'Тест');

    archer.weapon.durability = 0;
    archer.checkWeapon();
    expect(archer.weapon).toBeInstanceOf(Knife);

    archer.weapon.durability = 0;
    archer.checkWeapon();
    expect(archer.weapon).toBeInstanceOf(Arm);
  });

  test('Mage: Staff -> Knife -> Arm', () => {
    const mage = new Mage(0, 'Тест');

    mage.weapon.durability = 0;
    mage.checkWeapon();
    expect(mage.weapon).toBeInstanceOf(Knife);

    mage.weapon.durability = 0;
    mage.checkWeapon();
    expect(mage.weapon).toBeInstanceOf(Arm);
  });

  test('Dwarf: Axe -> Knife -> Arm', () => {
    const dwarf = new Dwarf(0, 'Тест');

    dwarf.weapon.durability = 0;
    dwarf.checkWeapon();
    expect(dwarf.weapon).toBeInstanceOf(Knife);

    dwarf.weapon.durability = 0;
    dwarf.checkWeapon();
    expect(dwarf.weapon).toBeInstanceOf(Arm);
  });

  test('Crossbowman: LongBow -> Knife -> Arm', () => {
    const crossbowman = new Crossbowman(0, 'Тест');

    crossbowman.weapon.durability = 0;
    crossbowman.checkWeapon();
    expect(crossbowman.weapon).toBeInstanceOf(Knife);

    crossbowman.weapon.durability = 0;
    crossbowman.checkWeapon();
    expect(crossbowman.weapon).toBeInstanceOf(Arm);
  });

  test('Demiurge: StormStaff -> Knife -> Arm', () => {
    const demiurge = new Demiurge(0, 'Тест');

    demiurge.weapon.durability = 0;
    demiurge.checkWeapon();
    expect(demiurge.weapon).toBeInstanceOf(Knife);

    demiurge.weapon.durability = 0;
    demiurge.checkWeapon();
    expect(demiurge.weapon).toBeInstanceOf(Arm);
  });
});

describe('Warrior', () => {
  test('создаётся с правильными свойствами', () => {
    const warrior = new Warrior(0, 'Тест');

    expect(warrior.life).toBe(120);
    expect(warrior.speed).toBe(2);
    expect(warrior.weapon).toBeInstanceOf(Sword);
  });

  test('takeDamage: обычный урон при HP >= 60', () => {
    const warrior = new Warrior(0, 'Тест');

    warrior.takeDamage(50);

    expect(warrior.life).toBe(70);
    expect(warrior.magic).toBe(20);
  });

  test('takeDamage: урон в ману при HP < 60 и getLuck > 0.8', () => {
    const warrior = new Warrior(0, 'Тест');

    warrior.life = 50;
    jest.spyOn(warrior, 'getLuck').mockReturnValue(0.9);

    warrior.takeDamage(5);

    expect(warrior.life).toBe(50);
    expect(warrior.magic).toBe(15);
  });

  test('takeDamage: переполнение маны — остаток в HP', () => {
    const warrior = new Warrior(0, 'Тест');

    warrior.life = 50;
    warrior.magic = 5;
    jest.spyOn(warrior, 'getLuck').mockReturnValue(0.9);

    warrior.takeDamage(15);

    expect(warrior.magic).toBe(0);
    expect(warrior.life).toBe(40);
  });
});

describe('Archer', () => {
  test('создаётся с правильными свойствами', () => {
    const archer = new Archer(0, 'Тест');

    expect(archer.life).toBe(80);
    expect(archer.magic).toBe(35);
    expect(archer.agility).toBe(10);
    expect(archer.weapon).toBeInstanceOf(Bow);
  });

  test('getDamage: урон растёт с дистанцией', () => {
    const archer = new Archer(0, 'Тест');

    jest.spyOn(archer, 'getLuck').mockReturnValue(1);

    expect(archer.getDamage(3)).toBeGreaterThan(archer.getDamage(1));
  });
});

describe('Mage', () => {
  test('создаётся с правильными свойствами', () => {
    const mage = new Mage(0, 'Тест');

    expect(mage.life).toBe(70);
    expect(mage.magic).toBe(100);
    expect(mage.weapon).toBeInstanceOf(Staff);
  });

  test('takeDamage: полная цепочка из ТЗ', () => {
    const mage = new Mage(0, 'Гендальф');

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

describe('Dwarf', () => {
  test('создаётся с правильными свойствами', () => {
    const dwarf = new Dwarf(0, 'Тест');

    expect(dwarf.life).toBe(130);
    expect(dwarf.attack).toBe(15);
    expect(dwarf.luck).toBe(20);
    expect(dwarf.weapon).toBeInstanceOf(Axe);
  });

  test('каждый 6-й удар вдвое слабее при getLuck > 0.5', () => {
    const dwarf = new Dwarf(0, 'Тест');

    jest.spyOn(dwarf, 'getLuck').mockReturnValue(0.9);

    for (let i = 0; i < 5; ++i) {
      dwarf.takeDamage(10);
    }

    const lifeBefore = dwarf.life;
    dwarf.takeDamage(10);

    expect(dwarf.life).toBe(lifeBefore - 5);
  });
});

describe('Crossbowman', () => {
  test('создаётся с правильными свойствами', () => {
    const crossbowman = new Crossbowman(0, 'Тест');

    expect(crossbowman.life).toBe(85);
    expect(crossbowman.agility).toBe(20);
    expect(crossbowman.luck).toBe(15);
    expect(crossbowman.weapon).toBeInstanceOf(LongBow);
  });
});

describe('Demiurge', () => {
  test('создаётся с правильными свойствами', () => {
    const demiurge = new Demiurge(0, 'Тест');

    expect(demiurge.life).toBe(80);
    expect(demiurge.magic).toBe(120);
    expect(demiurge.luck).toBe(12);
    expect(demiurge.weapon).toBeInstanceOf(StormStaff);
  });

  test('getDamage: x1.5 при getLuck > 0.6 и magic > 0', () => {
    const demiurge = new Demiurge(0, 'Тест');

    jest.spyOn(demiurge, 'getLuck').mockReturnValue(0.9);

    const base = (demiurge.attack + demiurge.weapon.getDamage()) * 0.9;

    expect(demiurge.getDamage(1)).toBeCloseTo(base * 1.5, 1);
  });

  test('getDamage: без усиления при magic = 0', () => {
    const demiurge = new Demiurge(0, 'Тест');

    demiurge.magic = 0;
    jest.spyOn(demiurge, 'getLuck').mockReturnValue(0.9);

    const base = (demiurge.attack + demiurge.weapon.getDamage()) * 0.9;

    expect(demiurge.getDamage(1)).toBeCloseTo(base, 1);
  });
});

describe('play', () => {
  test('возвращает единственного выжившего', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(1, 'B');

    jest.spyOn(warrior, 'getLuck').mockReturnValue(1);
    jest.spyOn(archer, 'isAttackBlocked').mockReturnValue(false);
    jest.spyOn(archer, 'dodged').mockReturnValue(false);

    archer.life = 1;

    expect(play([warrior, archer])).toBe(warrior);
  });

  test('возвращает null если все мертвы', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(1, 'B');

    warrior.life = 0;
    archer.life = 0;

    expect(play([warrior, archer])).toBeNull();
  });

  test('завершает бой по лимиту раундов и возвращает null', () => {
    const warrior = new Warrior(0, 'A');
    const archer = new Archer(1, 'B');

    jest.spyOn(warrior, 'turn').mockImplementation(function () {});
    jest.spyOn(archer, 'turn').mockImplementation(function () {});

    expect(play([warrior, archer])).toBeNull();
  });
});
