var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-example',
        width: 1280,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 10 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            matar: matar,
            matar2: matar2,
            contacto: contacto,
            choque: choque,
        }
    }
};

var balas;
var nave;
var speed;
var Fired = 0;
var punto = 0;
var vida = 100;

var game = new Phaser.Game(config);

var puntos;
var firma;
var titulo;
var gameOver;
var restart;
var restartButton; // Nueva variable para el botón de reinicio

function preload() {
    this.load.audio('tone', 'song/Titanium.mp3');
    this.load.image('fondo', 'img/fondo.jpeg');
    this.load.image('suelo', 'img/suelo.svg');
    this.load.image('nave', 'img/nave.png');
    this.load.image('bala', 'img/bala.png');
    this.load.image('virus', 'img/1.png');
    this.load.image('gameover', 'img/gameover.png');
    this.load.image('restartButton', 'img/restart.png');
    this.load.spritesheet('enemys', 'img/enemys.png', { frameWidth: 50, frameHeight: 50 });
    this.load.bitmapFont('pressStart2P','fuente/PressStart2P-Regular.png','fuente/PressStart2P-Regular.xml');
}

function create() {
    punto = 0;
    this.add.image(640, 360, 'fondo');

    var jungle = this.sound.add('tone');
    jungle.play({
        loop: true
    });                

    puntos = this.add.bitmapText(10, 10, 'pressStart2P', 'PUNTOS: 0', 20);
    firma = this.add.text(10, 665, '', { font: '40px Courier', fill: '#008f39' });
    this.add.text(497, 13, '', { font: '40px Cooper Black', fill: '#000000' });
    titulo = this.add.text(500, 10, '', { font: '40px Cooper Black', fill: '#FFFFFF' });

    gameOver = this.add.image(650, 300, 'gameover');
    gameOver.setVisible(false);
    gameOver.setScale(0.4);

    restartButton = this.add.sprite(650, 400, 'restartButton').setInteractive();
    restartButton.setScale(0.5);
    restartButton.setVisible(false);

    restartButton.on('pointerdown', () => {
        if (jungle) {
            jungle.stop();
            jungle.destroy();
        }
    
        this.scene.start(); 
    });

    //CARGAMOS EL ENEMIGO Y LO REPLICAMOS
    var Enemy = this.physics.add.group({ key: 'enemys', frame: Phaser.Math.Between(0,4),repeat: 8, setXY: { x: 50, y: 0, stepX: 100 } });
        Phaser.Actions.IncX(Enemy.getChildren(), 100);

    var Enemy2 = this.physics.add.group({ key: 'enemys', frame: Phaser.Math.Between(0,4),repeat: 8, setXY: { x: 250, y: 60, stepX: 100 } });
        Phaser.Actions.IncX(Enemy.getChildren(), 100);
    

    nave = this.physics.add.image(640, 660, 'nave');
    nave.setCollideWorldBounds(true);
    nave.body.allowGravity = false;

    suelo = this.physics.add.image(640, 720, 'suelo');
    suelo.body.allowGravity = false;

    var Bala = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize:

            function Bullet(scene) {
                Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bala');
                this.speed = Phaser.Math.GetSpeed(500, 1);
            },

        fire: function (x, y) {
            this.setPosition(x, y - 50);
            this.setActive(true);
            this.setVisible(true);
        },
        update: function (time, delta) {
            this.y -= this.speed * delta;

            if (this.y < -50) {
                this.setActive(false);
                this.setVisible(false);
            }
        },
    });

    balas = this.physics.add.group({
        classType: Bala,
        maxSize: 20,
        runChildUpdate: true,
    });

    this.physics.add.overlap(balas, Enemy, matar);
    this.physics.add.overlap(balas, Enemy2, matar2);

    this.physics.add.collider(Enemy, Enemy, choque);
    this.physics.add.collider(Enemy2, Enemy2, choque);
    this.physics.add.collider(Enemy, Enemy2, choque);
    this.physics.add.collider(nave, Enemy, contacto, null, this);

    this.physics.add.collider(nave, Enemy && Enemy2, contacto2, null, this);

    cursors = this.input.keyboard.createCursorKeys();
    speed = Phaser.Math.GetSpeed(900, 1);
}

function update(time, delta) {
    if (cursors.left.isDown) {
        nave.x -= speed * delta;
    } else if (cursors.right.isDown) {
        nave.x += speed * delta;
    }

    if (cursors.space.isDown && time > Fired) {
        var bullet = balas.get();
        if (bullet) {
            bullet.fire(nave.x, nave.y);
            bullet.body.allowGravity = false;
            Fired = time + 100;
        }
    }
}

function matar(balas, Enemy) {
    balas.setVisible(false);
    Enemy.setVisible(false);
    Enemy.setPosition(Phaser.Math.Between(100, 1180), -20);
    Enemy.setVisible(true);
    punto += 200;
    puntos.setText('PUNTOS: ' + punto);
}

function matar2(balas, Enemy2) {
    balas.setVisible(false);
    Enemy2.setVisible(false);
    Enemy2.setPosition(Phaser.Math.Between(100, 1180), -50);
    Enemy2.setVisible(true);
    punto += 200;
    puntos.setText('PUNTOS: ' + punto);
}

function choque(Enemy, Enemy2) {
    Enemy.setVisible(false);
    Enemy.setPosition(Phaser.Math.Between(100, 1180), -100);
    Enemy2.setVisible(false);
    Enemy2.setPosition(Phaser.Math.Between(100, 1180), -100);
}

function contacto(nave) {
    nave.setTint(0xff0000);
    this.physics.pause();
    gameOver.setVisible(true);
    restartButton.setPosition(650, 450);
    restartButton.setVisible(true);
}

function contacto2() {
    nave.setTint(0xff0000);
    this.physics.pause();
    gameOver.setVisible(true);
    restartButton.setPosition(650, 450);
    restartButton.setVisible(true);
}
