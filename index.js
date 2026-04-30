class Weapon {
  constructor(name, attack, durability, range) {
    this.name = name;
    this.attack = attack;
    this.durability = durability;
    this.initDurability = durability;
    this.range = range;
  }

  takeDamage(damage) {
    if (this.durability === Infinity) {
      return;
    }

    let weaponDamage = Math.max(0, damage);
    this.durability = Math.max(0, this.durability - weaponDamage);
  }

  getDamage() {
    if (this.durability === 0) {
      return 0;
    }

    if (this.durability >= this.initDurability * 0.3) {
      return this.attack;
    }

    return this.attack / 2;
  }

  isBroken() {
    return this.durability === 0;
  }
}

class Arm extends Weapon {
  constructor() {
    super('Рука', 1, Infinity, 1);
  }
}

class Bow extends Weapon {
  constructor() {
    super('Лук', 10, 200, 3);
  }
}

class Sword extends Weapon {
  constructor() {
    super('Меч', 25, 500, 1);
  }
}

class Knife extends Weapon {
  constructor() {
    super('Нож', 5, 300, 1);
  }
}

class Staff extends Weapon {
  constructor() {
    super('Посох', 8, 300, 2);
  }
}

class LongBow extends Bow {
  constructor() {
    super();

    this.name = 'Длинный лук';
    this.attack = 15;
    this.range = 4;
  }
}

class Axe extends Sword {
  constructor() {
    super();

    this.name = 'Секира';
    this.attack = 27;
    this.durability = 800;
    this.initDurability = 800;
  }
}

class StormStaff extends Staff {
  constructor() {
    super();

    this.name = 'Посох Бури';
    this.attack = 10;
    this.range = 3;
  }
}

let dwarfHits = new WeakMap();

class Player {
  constructor(position, name) {
    this.life = 100;
    this.magic = 20;
    this.speed = 1;
    this.attack = 10;
    this.agility = 5;
    this.luck = 10;
    this.description = 'Игрок';
    this.weapon = new Arm();
    this.position = position;
    this.name = name;
  }

  getLuck() {
    return (Math.random() * 100 + this.luck) / 100;
  }

  getDamage(distance, luckCoefficient) {
    let luck = luckCoefficient !== undefined ? luckCoefficient : this.getLuck();

    if (distance > this.weapon.range) {
      return 0;
    }

    return (this.attack + this.weapon.getDamage()) * luck / distance;
  }

  takeDamage(damage) {
    let playerDamage = Math.max(0, damage);
    this.life = Math.max(0, this.life - playerDamage);
  }

  isDead() {
    return this.life === 0;
  }

  moveLeft(distance) {
    let step = Math.min(Math.abs(distance), this.speed);
    this.position -= step;

    console.log(this.name + ' двигается влево на ' + step + '. Позиция: ' + this.position + '.');
  }

  moveRight(distance) {
    let step = Math.min(Math.abs(distance), this.speed);
    this.position += step;

    console.log(this.name + ' двигается вправо на ' + step + '. Позиция: ' + this.position + '.');
  }

  move(distance) {
    if (distance < 0) {
      this.moveLeft(distance);
      return;
    }

    this.moveRight(distance);
  }

  isAttackBlocked() {
    return this.getLuck() > (100 - this.luck) / 100;
  }

  dodged() {
    return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
  }

  takeAttack(damage) {
    if (this.isAttackBlocked()) {
      this.weapon.takeDamage(damage);
      this.checkWeapon();
      console.log(this.name + ' блокирует удар оружием ' + this.weapon.name + '.');
      return;
    }

    if (this.dodged()) {
      console.log(this.name + ' уклоняется от атаки.');
      return;
    }

    this.takeDamage(damage);
    console.log(this.name + ' получает ' + damage.toFixed(2) + ' урона. Жизнь: ' + this.life.toFixed(2) + '.');
  }

  checkWeapon() {
    let weaponChain = getWeaponChain(this);
    let currentIndex = weaponChain.findIndex(function (weaponClass) {
      return this.weapon.constructor === weaponClass;
    }, this);

    if (currentIndex === -1 || !this.weapon.isBroken()) {
      return;
    }

    let nextWeaponClass = weaponChain[currentIndex + 1];

    if (!nextWeaponClass) {
      return;
    }

    let oldName = this.weapon.name;
    this.weapon = new nextWeaponClass();

    console.log(this.name + ' теряет ' + oldName + ' и берёт ' + this.weapon.name + '.');
  }

  tryAttack(enemy) {
    if (this.isDead() || enemy.isDead()) {
      return;
    }

    let distance = Math.abs(this.position - enemy.position);

    if (distance > this.weapon.range) {
      console.log(this.name + ' не достаёт до ' + enemy.name + '.');
      return;
    }

    let luck = this.getLuck();

    this.weapon.takeDamage(10 * luck);

    if (distance === 0) {
      enemy.moveRight(1);
      enemy.takeAttack(this.getDamage(1, luck) * 2);
      this.checkWeapon();

      console.log(this.name + ' атакует ' + enemy.name + ' вплотную с удвоенным уроном.');
      return;
    }

    enemy.takeAttack(this.getDamage(distance, luck));
    this.checkWeapon();

    console.log(this.name + ' атакует ' + enemy.name + '.');
  }

  chooseEnemy(players) {
    let enemies = players.filter(function (player) {
      return player !== this && !player.isDead();
    }, this);

    if (enemies.length === 0) {
      return null;
    }

    return enemies.reduce(function (weakest, enemy) {
      if (enemy.life < weakest.life) {
        return enemy;
      }

      return weakest;
    });
  }

  moveToEnemy(enemy) {
    if (!enemy) {
      return;
    }

    this.move(enemy.position - this.position);
  }

  turn(players) {
    if (this.isDead()) {
      return;
    }

    let enemy = this.chooseEnemy(players);

    if (!enemy) {
      return;
    }

    console.log(this.name + ' выбирает целью ' + enemy.name + '.');

    this.moveToEnemy(enemy);
    this.tryAttack(enemy);
  }
}

class Warrior extends Player {
  constructor(position, name) {
    super(position, name);

    this.life = 120;
    this.speed = 2;
    this.attack = 10;
    this.description = 'Воин';
    this.weapon = new Sword();
  }

  takeDamage(damage) {
    if (this.life < 60 && this.magic > 0 && this.getLuck() > 0.8) {
      let magicDamage = Math.min(this.magic, damage);
      let lifeDamage = damage - magicDamage;

      this.magic -= magicDamage;

      if (lifeDamage > 0) {
        super.takeDamage(lifeDamage);
      }

      console.log(this.name + ' получает урон ' + magicDamage.toFixed(2) + ' из магии.');
      return;
    }

    super.takeDamage(damage);
  }
}

class Archer extends Player {
  constructor(position, name) {
    super(position, name);

    this.life = 80;
    this.magic = 35;
    this.attack = 5;
    this.agility = 10;
    this.description = 'Лучник';
    this.weapon = new Bow();
  }

  getDamage(distance, luckCoefficient) {
    let luck = luckCoefficient !== undefined ? luckCoefficient : this.getLuck();

    if (distance > this.weapon.range) {
      return 0;
    }

    return (this.attack + this.weapon.getDamage()) * luck * distance / this.weapon.range;
  }
}

class Mage extends Player {
  constructor(position, name) {
    super(position, name);

    this.life = 70;
    this.magic = 100;
    this.attack = 5;
    this.agility = 8;
    this.description = 'Маг';
    this.weapon = new Staff();
  }

  takeDamage(damage) {
    if (this.magic > 50) {
      this.magic -= 12;

      if (this.magic < 0) {
        this.magic = 0;
      }

      super.takeDamage(damage / 2);
      return;
    }

    super.takeDamage(damage);
  }
}

class Dwarf extends Warrior {
  constructor(position, name) {
    super(position, name);

    this.life = 130;
    this.attack = 15;
    this.luck = 20;
    this.description = 'Гном';
    this.weapon = new Axe();

    dwarfHits.set(this, 0);
  }

  takeDamage(damage) {
    let hitCount = dwarfHits.get(this) + 1;
    dwarfHits.set(this, hitCount);

    if (hitCount % 6 === 0 && this.getLuck() > 0.5) {
      super.takeDamage(damage / 2);
      return;
    }

    super.takeDamage(damage);
  }
}

class Crossbowman extends Archer {
  constructor(position, name) {
    super(position, name);

    this.life = 85;
    this.attack = 8;
    this.agility = 20;
    this.luck = 15;
    this.description = 'Арбалетчик';
    this.weapon = new LongBow();
  }
}

class Demiurge extends Mage {
  constructor(position, name) {
    super(position, name);

    this.life = 80;
    this.magic = 120;
    this.attack = 6;
    this.luck = 12;
    this.description = 'Демиург';
    this.weapon = new StormStaff();
  }

  getDamage(distance, luckCoefficient) {
    let luck = luckCoefficient !== undefined ? luckCoefficient : this.getLuck();

    if (distance > this.weapon.range) {
      return 0;
    }

    let damage = (this.attack + this.weapon.getDamage()) * luck / distance;

    if (this.magic > 0 && luck > 0.6) {
      return damage * 1.5;
    }

    return damage;
  }
}

function getWeaponChain(player) {
  if (player instanceof Dwarf) {
    return [Axe, Knife, Arm];
  }

  if (player instanceof Crossbowman) {
    return [LongBow, Knife, Arm];
  }

  if (player instanceof Demiurge) {
    return [StormStaff, Knife, Arm];
  }

  if (player instanceof Warrior) {
    return [Sword, Knife, Arm];
  }

  if (player instanceof Archer) {
    return [Bow, Knife, Arm];
  }

  if (player instanceof Mage) {
    return [Staff, Knife, Arm];
  }

  return [Arm];
}

function getAlivePlayers(players) {
  return players.filter(function (player) {
    return !player.isDead();
  });
}

function play(players) {
  let round = 1;
  let roundLimit = 1000;

  console.log('=== Королевская битва начинается! ===');

  while (getAlivePlayers(players).length > 1 && round <= roundLimit) {
    console.log('--- Раунд ' + round + ' ---');

    let alivePlayers = getAlivePlayers(players);

    for (let i = 0, iMax = alivePlayers.length; i < iMax; ++i) {
      if (getAlivePlayers(players).length <= 1) {
        break;
      }

      alivePlayers[i].turn(getAlivePlayers(players));
    }

    round += 1;
  }

  let winners = getAlivePlayers(players);

  if (winners.length === 1) {
    console.log('Победитель: ' + winners[0].description + ' ' + winners[0].name + '!');
    return winners[0];
  }

  console.log('Победитель не определён.');
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = {
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
  };
}
