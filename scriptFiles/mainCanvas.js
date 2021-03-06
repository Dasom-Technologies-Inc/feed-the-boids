define(["Boid", "Star", "sketch", "../libraries/p5", "./p5.dom"],
	function(Boid, Star, sketch, p5) {
		"use strict";

		new p5(function(p) {
			var boids = [];
			var food = [];
			var poison = [];
			var bestBoid = -1;
			var oldestBoid = -1;
			var foodCol, poisonCol;
			var margin = sketch.margin;

			p.setup = function() {
				var p = sketch.p;

				var canvas = p.createCanvas(window.innerWidth - 360, 600);
				canvas.position(325, 110);

				for (var i = 0; i < 10; ++i) {
					boids[i] = new Boid(p.random(p.width), p.random(p.height));
				}

				for (var i = 0; i < 20; ++i) {
					var x = p.random(margin, p.width - margin);
					var y = p.random(margin, p.height - margin);
					food.push(p.createVector(x, y));
				}

				for (var i = 0; i < 10; ++i) {
					x = p.random(margin, p.width - margin);
					y = p.random(margin, p.height - margin);
					poison.push(new Star(x, y, 1.5, 9, 3));
				}

				foodCol = p.color(0, 255, 0);
				poisonCol = p.color(250, 65, 65);
			};

			p.draw = function() {
				var p = sketch.p;

				p.background(70);
				p.fill(255);
				p.noStroke();

				if (p.random(1) < 0.1) {
					x = p.random(margin, p.width - margin);
					y = p.random(margin, p.height - margin);
					food.push(p.createVector(x, y));
				}

				if (p.random(1) < 0.01) {
					var x = p.random(margin, p.width - margin);
					var y = p.random(margin, p.height - margin);
					poison.push(new Star(x, y, 1.5, 9, 3));
				}

				for (var i = 0; i < food.length; ++i) {
					p.fill(foodCol);
					p.noStroke();
					p.ellipse(food[i].x, food[i].y, 5, 5);
				}

				for (var i = 0; i < poison.length; ++i) {
					p.fill(poisonCol);
					p.noStroke();
					poison[i].show();
				}

				// Call the appropriate steering behaviours for our agents
				for (var i = boids.length-1; i >= 0; --i) {
					boids[i].boundaries();
					boids[i].behaviours(food, poison);
					boids[i].update();
					if (bestBoid === i) {
						boids[i].display(true);
					} else {
						boids[i].display(false);
					}

					var newBoid = boids[i].clone();
					if (newBoid !== null) {
						boids.push(newBoid);
					}

					if (boids[i].dead()) {
						food.push(p.createVector(boids[i].position.x, boids[i].position.y));
						boids.splice(i, 1);
					}
				}

				var bestHealth = 0;
				for (var i = 0; i < boids.length; ++i) {
					if (boids[i].health > bestHealth) {
						bestHealth = boids[i].health;
						bestBoid = i;
					}
				}

				var longestMills = 0;
				var currentMillis = (new Date).getTime();
				for (var i = 0; i < boids.length; ++i) {
					var millis = currentMillis - boids[i].millis;
					if (millis > longestMills) {
						longestMills = millis;
						oldestBoid = i;
					}
				}

				sketch.healthValue = bestHealth.toFixed(3);
				sketch.numFood = food.length;
				sketch.numPoison = poison.length;
				sketch.numBoids = boids.length;

				if (sketch.numBoids === 0) {
					p.background(70);
					p.textFont("Courier");
					p.textSize(25);
					p.fill(255, 200);
					p.text("Game over!", p.width/2.43, p.height * 0.5 - 10);
					sketch.gameOver = true;
					p.noLoop();
				}
			};

			p.mousePressed = function() {
				// Need to transpose the mouseX value to sit correctly relative to the screen
				food.push(p.createVector(p.mouseX - 280, p.mouseY));
			};

			p.keyReleased = function() {
				if (p.keyCode === p.ENTER) {
					sketch.debug = !sketch.debug;
				}
			};

		}, null);

	});