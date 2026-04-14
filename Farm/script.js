const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#7cfc00', // Зеленое поле
    physics: { default: 'arcade' },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

let money = 100;
let water = 5;
let moneyText, waterText;

function preload() {
    // В реальном проекте замените ссылки на свои спрайты
    this.load.image('grass', 'https://phaser.io');
    this.load.image('goose', 'https://phaser.io');
    this.load.image('egg', 'https://phaser.io');
}

function create() {
    // Интерфейс
    moneyText = this.add.text(16, 16, 'Монеты: ' + money, { fontSize: '24px', fill: '#000' });
    waterText = this.add.text(16, 50, 'Вода: ' + water, { fontSize: '24px', fill: '#000' });

    // Группы объектов
    this.grassGroup = this.physics.add.staticGroup();
    this.animals = this.add.group();
    this.products = this.physics.add.group();

    // Клик по полю — посадка травы
    this.input.on('pointerdown', (pointer) => {
        if (water > 0 && pointer.y > 100) {
            water--;
            this.grassGroup.create(pointer.x, pointer.y, 'grass').setScale(2);
            updateUI();
        } else if (water === 0) {
            alert("Нужно купить воду в колодце!");
        }
    });

    // Создаем стартовое животное
    spawnAnimal(this, 400, 300);

    // Логика колодца (кнопка покупки воды)
    const wellButton = this.add.text(600, 16, '[ Наполнить колодец - 15$ ]', { fill: '#00f' })
        .setInteractive().on('pointerdown', () => {
            if (money >= 15) {
                money -= 15;
                water = 5;
                updateUI();
            }
        });
}

function update() {
    this.animals.children.iterate((animal) => {
        // Простая логика поиска травы
        let closestGrass = this.physics.closest(animal, this.grassGroup.getChildren());
        
        if (closestGrass) {
            this.physics.moveToObject(animal, closestGrass, 50);
            
            // Если животное дошло до травы
            if (Phaser.Math.Distance.Between(animal.x, animal.y, closestGrass.x, closestGrass.y) < 10) {
                closestGrass.destroy();
                animal.hunger += 20;
                // Шанс снести яйцо после еды
                if (Math.random() > 0.5) spawnProduct(this, animal.x, animal.y);
            }
        } else {
            animal.body.setVelocity(0); // Стоит, если нет травы
        }
    });
}

function spawnAnimal(scene, x, y) {
    let animal = scene.physics.add.sprite(x, y, 'goose');
    animal.hunger = 100;
    scene.animals.add(animal);
}

function spawnProduct(scene, x, y) {
    let egg = scene.products.create(x, y, 'egg').setInteractive();
    egg.on('pointerdown', () => {
        egg.destroy();
        money += 10; // Продажа сразу (упрощенно)
        updateUI();
    });
}

function updateUI() {
    moneyText.setText('Монеты: ' + money);
    waterText.setText('Вода: ' + water);
}
