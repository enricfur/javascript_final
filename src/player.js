const {
  Arm,
  Bow,
  Sword,
  Knife,
  Staff,
  LongBow,
  Axe,
  StormStaff
} = require('./weapon');

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
    this.attackLuck = null;
  }

  getLuck() {
    return (Math.random() * 100 + this.luck) / 100;
  }

  getDamage(distance) {
    if (distance > this.weapon.range) {
      return 0;
    }

    const luck = this.attackLuck === null ? this.getLuck() : this.attackLuck;

    return (this.attack + this.weapon.getDamage()) * luck / distance;
  }

  takeDamage(damage) {
    this.life -= damage;

    if (this.life < 0) {
      this.life = 0;
    }
  }

  isDead() {
    return this.life === 0;
  }

  moveLeft(distance) {
    const step = Math.min(Math.abs(distance), this.speed);
    this.position -= step;
  }

  moveRight(distance) {
    const step = Math.min(distance, this.speed);
    this.position += step;
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
      return;
    }

    if (this.dodged()) {
      return;
    }

    this.takeDamage(damage);
  }

  getNextWeapon() {
    return new Arm();
  }

  checkWeapon() {
    if (!this.weapon.isBroken()) {
      return;
    }

    this.weapon = this.getNextWeapon();
    console.log(`${this.name} сменил оружие на ${this.weapon.name}`);
  }

  tryAttack(enemy) {
    const distance = Math.abs(this.position - enemy.position);

    if (distance > this.weapon.range) {
      return;
    }

    this.attackLuck = this.getLuck();
    this.weapon.takeDamage(10 * this.attackLuck);

    if (this.position === enemy.position) {
      enemy.position += 1;
      enemy.takeAttack(this.getDamage(1) * 2);
      this.checkWeapon();
      this.attackLuck = null;
      return;
    }

    enemy.takeAttack(this.getDamage(distance));
    this.checkWeapon();
    this.attackLuck = null;
  }

  chooseEnemy(players) {
    let target = null;
    let minLife = Infinity;

    for (let i = 0; i < players.length; ++i) {
      const player = players[i];

      if (player === this || player.isDead()) {
        continue;
      }

      if (player.life < minLife) {
        minLife = player.life;
        target = player;
      }
    }

    return target;
  }

  moveToEnemy(enemy) {
    this.move(enemy.position - this.position);
  }

  turn(players) {
    const enemy = this.chooseEnemy(players);

    if (!enemy) {
      return;
    }

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

  getNextWeapon() {
    if (this.weapon instanceof Sword) {
      return new Knife();
    }

    return new Arm();
  }

  takeDamage(damage) {
    if (this.life < 60 && this.getLuck() > 0.8 && this.magic > 0) {
      this.magic -= damage;

      if (this.magic < 0) {
        const overflow = Math.abs(this.magic);
        this.magic = 0;
        super.takeDamage(overflow);
      }

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

  getNextWeapon() {
    if (this.weapon instanceof Bow) {
      return new Knife();
    }

    return new Arm();
  }

  getDamage(distance) {
    if (distance > this.weapon.range) {
      return 0;
    }

    const luck = this.attackLuck === null ? this.getLuck() : this.attackLuck;

    return (this.attack + this.weapon.getDamage()) *
      luck * distance / this.weapon.range;
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

  getNextWeapon() {
    if (this.weapon instanceof Staff) {
      return new Knife();
    }

    return new Arm();
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
    this.hitCount = 0;
  }

  getNextWeapon() {
    if (this.weapon instanceof Axe) {
      return new Knife();
    }

    return new Arm();
  }

  takeDamage(damage) {
    this.hitCount += 1;

    if (this.hitCount % 6 === 0 && this.getLuck() > 0.5) {
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

  getNextWeapon() {
    if (this.weapon instanceof LongBow) {
      return new Knife();
    }

    return new Arm();
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

  getNextWeapon() {
    if (this.weapon instanceof StormStaff) {
      return new Knife();
    }

    return new Arm();
  }

  getDamage(distance) {
    if (distance > this.weapon.range) {
      return 0;
    }

    const luck = this.attackLuck === null ? this.getLuck() : this.attackLuck;
    const base = (this.attack + this.weapon.getDamage()) * luck / distance;

    if (this.magic > 0 && luck > 0.6) {
      return base * 1.5;
    }

    return base;
  }
}

module.exports = {
  Player,
  Warrior,
  Archer,
  Mage,
  Dwarf,
  Crossbowman,
  Demiurge
};
