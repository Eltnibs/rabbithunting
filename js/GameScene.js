let highScore = 0;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.speedMultiplier = 1;
        this.maxJumpHeight = 200; // Maximum height the player can jump
        this.coinSpawnRate = 5000; // Initial coin spawn 
        this.minCoinSpawnRate = 1000; // Minimum coin spawn rate 
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/background.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.spritesheet('player', 'assets/player_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('hunter', 'assets/hunter_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('coin', 'assets/coin_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('barrel', 'assets/barrel.png');
        this.load.spritesheet('movingBarrel', 'assets/movingBarrel_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('bird', 'assets/bird_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.audio('winSound', 'assets/winSound.wav');
        this.load.audio('loseSound', 'assets/loseSound.wav');
        this.load.audio('coinSound', 'assets/coinSound.wav');
        this.load.audio('backgroundMusic', 'assets/backgroundMusic.wav');
    }

    create() {
        // Reset game state flags and variable
        this.gameOver = false;
        
        // Background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        // Play background music
        this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
        this.backgroundMusic.play();

        // Ground
        this.ground = this.add.tileSprite(400, 568, 800, 64, 'ground');
        this.physics.add.existing(this.ground, true);

        // Animations
        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'hunter_run',
            frames: this.anims.generateFrameNumbers('hunter', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'coin_spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'movingBarrel_roll',
            frames: this.anims.generateFrameNumbers('movingBarrel', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'bird_fly',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Player
        this.player = this.physics.add.sprite(150, 516, 'player').play('player_run'); // Starts on the ground
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(300);
        this.player.maxJumpHeight = this.player.y - this.maxJumpHeight;

        // Hunter
        this.hunter = this.physics.add.sprite(10, 516, 'hunter'); // Starts on the ground
        this.hunter.setCollideWorldBounds(true);
        this.hunter.setImmovable(true);

        // Groups for obstacles and birds
        this.obstacles = this.physics.add.group({ immovable: true, allowGravity: false });
        this.birds = this.physics.add.group({ immovable: true, allowGravity: false });

        // Score
        this.score = 0;
        this.scoreText = this.add.text(400, 50, 'Score: 0', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Timer
        this.timer = 60; // 5 minutes countdown
        this.timerText = this.add.text(50, 50, 'Time: 300', { fontSize: '32px', fill: '#000' });

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Speed Increment Event
        this.speedEvent = this.time.addEvent({
            delay: 60000,
            callback: this.increaseSpeed,
            callbackScope: this,
            loop: true
        });

        // Spawning Obstacles and Coins
        this.spawnBirdEvent = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 10000),
            callback: this.spawnBird,
            callbackScope: this,
            loop: true
        });

        this.spawnObstacleEvent = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000),
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        this.coinSpawnEvent = this.time.addEvent({
            delay: this.coinSpawnRate,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            s: Phaser.Input.Keyboard.KeyCodes.S
        });

        // Collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.hunter, this.ground);
        this.physics.add.collider(this.player, this.hunter, this.gameOverCallback, null, this);

        // Overlaps
        this.physics.add.overlap(this.player, this.obstacles, this.handleCollision, null, this);
        this.physics.add.overlap(this.player, this.birds, this.handleCollision, null, this);

        // Hunter and Player Collision
        this.physics.add.collider(this.player, this.hunter, this.gameOverCallback, null, this);
    }

    update() {
        if (!this.gameOver) {
            // Background and ground scrolling
            this.background.tilePositionX += 3 * this.speedMultiplier;
            this.ground.tilePositionX += 2 * this.speedMultiplier;

            // Player controls with jump limit
            if ((this.cursors.up.isDown || this.keys.w.isDown) && this.player.body.touching.down && this.player.y > this.player.maxJumpHeight) {
                this.player.setVelocityY(-300);
            }

            if (this.cursors.down.isDown || this.keys.s.isDown) {
                this.player.setVelocityY(300);
            }

            // Hunter movement within jump limits
            if (this.hunter.y > this.player.y) {
                this.hunter.setVelocityY(-200);
            } else if (this.hunter.y < this.player.y - 50) {
                this.hunter.setVelocityY(200);
            } else {
                this.hunter.setVelocityY(200);
            }
        }
    }

    updateTimer() {
        if (!this.gameOver) {
            this.timer--;
            this.timerText.setText('Time: ' + this.timer);
            if (this.timer <= 0) {
                this.winGame();
            }
        }
    }

    increaseSpeed() {
        this.speedMultiplier *= 1.05;

        // Gradually decrease coin spawn rate
        this.coinSpawnRate -= 100;
        if (this.coinSpawnRate < this.minCoinSpawnRate) {
            this.coinSpawnRate = this.minCoinSpawnRate;
        }

        // Reset coin spawn event with new rate
        this.coinSpawnEvent.reset({
            delay: this.coinSpawnRate,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });
    }

    spawnObstacle() {
        const x = 800;
        const y = 518;
        
        const type = Phaser.Math.Between(0, 1) ? 'barrel' : 'movingBarrel';

        let obstacle;

        if (type === 'barrel') {
            obstacle = this.physics.add.image(x, y, 'barrel');
            
        } else {
            obstacle = this.physics.add.sprite(x, y, 'movingBarrel').play('movingBarrel_roll');
        }

        //obstacle.body.setGravityY(-300); 

        this.physics.add.collider(this.ground, obstacle); 

        this.obstacles.add(obstacle);

        if (type === 'barrel') {
            obstacle.setVelocityX(-200 * this.speedMultiplier);
        } else {
            obstacle.setVelocityX(-Phaser.Math.Between(100, 400) * this.speedMultiplier);
        }

    }

    spawnCoin() {
        const x = 800;
        const y = Phaser.Math.Between(446, 518);
        const coin = this.physics.add.sprite(x, y, 'coin').play('coin_spin');
        coin.setVelocityX(-200 * this.speedMultiplier);
        coin.setGravityY(-300); // Ensure coin is not affected by gravity

        this.physics.add.overlap(this.player, coin, this.collectCoin, null, this);
    }

    spawnBird() {
        const x = 800;
        const y = 446
        const bird = this.physics.add.sprite(x, y, 'bird').play('bird_fly');

        this.birds.add(bird);
        bird.body.setVelocityX(-Phaser.Math.Between(100, 400) * this.speedMultiplier);
    }

    handleCollision(player, obstacle) {
        this.gameOverCallback();
    }

    collectCoin(player, coin) {
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        this.sound.play('coinSound');
    }

    gameOverCallback() {
        // Game over logic

        this.sound.play('loseSound');

        this.backgroundMusic.stop();

        this.physics.pause();
        this.timerEvent.paused = true;
        this.speedEvent.paused = true;
        this.coinSpawnEvent.paused = true;
        this.spawnObstacleEvent.paused = true;
        this.spawnBirdEvent.paused = true;
        this.gameOver = true;
        
        if (this.score > highScore) {
            highScore = this.score;
        }
        this.scene.start('GameOverScene');
    }

    winGame() {
        this
        // Win game logic
        this.sound.play('winSound');

        this.backgroundMusic.stop();

        this.physics.pause();
        this.timerEvent.paused = true;
        this.speedEvent.paused = true;
        this.coinSpawnEvent.paused = true;
        this.spawnObstacleEvent.paused = true;
        this.spawnBirdEvent.paused = true;
        this.gameOver = true;
        
        this.scene.start('WinScene', { score: this.score });
    }
}
