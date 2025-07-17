// Enhanced particle system with connections
function initParticles() {
  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  const particles = [];
  const particleCount = Math.floor((width * height) / 15000);
  const connectionDistance = 150;
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 * (1 - distance / connectionDistance)})`;
          ctx.stroke();
        }
      }
    }
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
}

// Enhanced typewriter effect
const messages = [
  "Your imagination. Amplified.",
  "Privacy-first AI assistant.",
  "Where ideas come to life.",
  "Think bigger. Create faster.",
  "Your creative companion."
];

let msgIndex = 0;
let charIndex = 0;
let isDeleting = false;
let pauseEnd = 0;

const typewriter = document.querySelector('.typewriter');

function type() {
  if (!typewriter) return;
  
  const currentMessage = messages[msgIndex];
  
  if (pauseEnd > Date.now()) {
    setTimeout(type, 50);
    return;
  }
  
  if (!isDeleting) {
    charIndex++;
    typewriter.textContent = currentMessage.slice(0, charIndex) + '|';
    
    if (charIndex === currentMessage.length) {
      pauseEnd = Date.now() + 2000;
      isDeleting = true;
    }
  } else {
    charIndex--;
    typewriter.textContent = currentMessage.slice(0, charIndex) + '|';
    
    if (charIndex === 0) {
      isDeleting = false;
      msgIndex = (msgIndex + 1) % messages.length;
      pauseEnd = Date.now() + 500;
    }
  }
  
  const typingSpeed = isDeleting ? 30 : 70;
  setTimeout(type, typingSpeed);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  type();
  
  // Add form submission handling
  const form = document.querySelector('.card');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'chat.html';
    });
  }
});
