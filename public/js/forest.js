window.addEventListener('load', () => {
  const canvas = document.getElementById('forestCanvas');
  const ctx = canvas.getContext('2d');
  let leaves = [];

  // Resize canvas to fill the window
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Leaf constructor
  class Leaf {
    constructor() {
      this.reset();
    }
    reset() {
      // start above the top at random x
      this.x = Math.random() * canvas.width;
      this.y = -20 - Math.random() * 100;
      // drift speed and direction
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = 1 + Math.random() * 1.5;
      // rotation and spin
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
      // leaf size and color
      this.size = 8 + Math.random() * 8;
      // green hues between 90° and 150°
      const hue = 90 + Math.random() * 60;
      this.color = `hsl(${hue}, 70%, 45%)`;
      // opacity for gentle fade
      this.opacity = 0.6 + Math.random() * 0.4;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;
      // recycle when off bottom or side
      if (this.y > canvas.height + this.size ||
          this.x < -this.size ||
          this.x > canvas.width + this.size) {
        this.reset();
        this.y = -this.size;
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      // simple leaf shape: rotated ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Spawn initial leaves
  for (let i = 0; i < 50; i++) {
    leaves.push(new Leaf());
  }

  // Optionally spawn more leaves over time
  setInterval(() => {
    if (leaves.length < 200) {
      leaves.push(new Leaf());
    }
  }, 500);

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
});

