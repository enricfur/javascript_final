const {
  Weapon,
  Arm,
  Bow,
  Sword,
  LongBow,
  Axe,
  StormStaff
} = require('../src/weapon');

describe('Weapon', () => {
  test('создаётся с правильными свойствами', () => {
    const weapon = new Weapon('Меч', 20, 100, 1);

    expect(weapon.name).toBe('Меч');
    expect(weapon.attack).toBe(20);
    expect(weapon.durability).toBe(100);
    expect(weapon.initDurability).toBe(100);
    expect(weapon.range).toBe(1);
  });

  test('takeDamage уменьшает durability, не ниже 0', () => {
    const weapon = new Weapon('Test', 20, 10, 1);

    weapon.takeDamage(5);
    expect(weapon.durability).toBe(5);

    weapon.takeDamage(50);
    expect(weapon.durability).toBe(0);
  });

  test('Arm не ломается', () => {
    const arm = new Arm();

    arm.takeDamage(1000);
    expect(arm.durability).toBe(Infinity);
    expect(arm.isBroken()).toBe(false);
  });

  test('getDamage: полный, половинный, нулевой урон', () => {
    const bow = new Bow();

    expect(bow.getDamage()).toBe(10);

    bow.takeDamage(150);
    expect(bow.getDamage()).toBe(5);

    bow.takeDamage(1000);
    expect(bow.getDamage()).toBe(0);
  });

  test('getDamage: ровно 30% durability — полный урон', () => {
    const weapon = new Weapon('Test', 20, 100, 1);

    weapon.takeDamage(70);
    expect(weapon.getDamage()).toBe(20);
  });

  test('isBroken работает корректно', () => {
    const sword = new Sword();

    expect(sword.isBroken()).toBe(false);

    sword.takeDamage(500);
    expect(sword.isBroken()).toBe(true);
  });

  test('улучшенные оружия имеют корректные свойства', () => {
    const longBow = new LongBow();
    const axe = new Axe();
    const stormStaff = new StormStaff();

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
