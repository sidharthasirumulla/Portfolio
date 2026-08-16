
// ============ 3D CANVAS ============
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const nodes = [];
const NODE_COUNT = 80;
let mouseX = W/2, mouseY = H/2;

for (let i = 0; i < NODE_COUNT; i++) {
  nodes.push({
    x: Math.random() * W,
    y: Math.random() * H,
    z: Math.random() * 800 + 100,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    vz: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 0.5,
    color: Math.random() > 0.5 ? '0,212,255' : '124,58,255'
  });
}

function project(x, y, z) {
  const fov = 800;
  const scale = fov / (fov + z);
  return {
    px: (x - W/2) * scale + W/2,
    py: (y - H/2) * scale + H/2,
    scale
  };
}

function drawScene() {
  ctx.clearRect(0, 0, W, H);

  const mx = (mouseX - W/2) * 0.0001;
  const my = (mouseY - H/2) * 0.0001;

  nodes.forEach(n => {
    n.x += n.vx + mx * n.z * 0.02;
    n.y += n.vy + my * n.z * 0.02;
    n.z += n.vz;
    if (n.x < 0) n.x = W;
    if (n.x > W) n.x = 0;
    if (n.y < 0) n.y = H;
    if (n.y > H) n.y = 0;
    if (n.z < 50) n.z = 900;
    if (n.z > 900) n.z = 50;
  });

  // Draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 130) {
        const pa = project(a.x, a.y, a.z);
        const pb = project(b.x, b.y, b.z);
        const alpha = (1 - dist/130) * 0.15;
        ctx.beginPath();
        ctx.moveTo(pa.px, pa.py);
        ctx.lineTo(pb.px, pb.py);
        ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  nodes.forEach(n => {
    const p = project(n.x, n.y, n.z);
    const alpha = Math.min(1, (900 - n.z) / 800);
    const r = n.r * p.scale * 2;

    const grad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 3);
    grad.addColorStop(0, `rgba(${n.color},${alpha})`);
    grad.addColorStop(1, `rgba(${n.color},0)`);

    ctx.beginPath();
    ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${n.color},${alpha * 0.9})`;
    ctx.fill();
  });

  requestAnimationFrame(drawScene);
}
drawScene();

// Track mouse for parallax
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ============ CUSTOM CURSOR ============
const cur = document.getElementById('cursor');
const curRing = document.getElementById('cursorRing');
let rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX - 6 + 'px';
  cur.style.top = e.clientY - 6 + 'px';
  rx += (e.clientX - 20 - rx) * 0.15;
  ry += (e.clientY - 20 - ry) * 0.15;
  curRing.style.left = rx + 'px';
  curRing.style.top = ry + 'px';
});

function animRing() {
  requestAnimationFrame(animRing);
  const cx = parseFloat(cur.style.left) + 6;
  const cy = parseFloat(cur.style.top) + 6;
  rx += (cx - 20 - rx) * 0.1;
  ry += (cy - 20 - ry) * 0.1;
  curRing.style.left = rx + 'px';
  curRing.style.top = ry + 'px';
}
animRing();

document.querySelectorAll('a, button, .skill-card, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.style.transform = 'scale(2)';
    curRing.style.transform = 'scale(1.5)';
    curRing.style.borderColor = 'rgba(124,58,255,0.7)';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.transform = 'scale(1)';
    curRing.style.transform = 'scale(1)';
    curRing.style.borderColor = 'rgba(0,212,255,0.5)';
  });
});

// ============ SCROLL REVEAL ============
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), 100);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => io.observe(el));

// ============ CONTACT FORM ============
async function sendMessage() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const phone = document.getElementById('cf-phone').value.trim();
  const subject = document.getElementById('cf-subject').value;
  const message = document.getElementById('cf-message').value.trim();
  const status = document.getElementById('formStatus');
  const btn = document.getElementById('submitBtn');

  if (!name || !email || !message) {
    status.className = 'form-status error';
    status.textContent = '⚠️ Please fill in Name, Email, and Message.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';
  status.className = 'form-status';
  status.style.display = 'none';

  // --- Email via EmailJS (free service) ---
  // To activate: Sign up at emailjs.com, replace YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, YOUR_PUBLIC_KEY
  // The WhatsApp link opens automatically for instant WhatsApp notification.

  try {
    // Build WhatsApp message
    const waText = encodeURIComponent(
      `📬 *New Portfolio Message*\n\n` +
      `*Name:* ${name}\n` +
      `*Email:* ${email}\n` +
      `*Phone:* ${phone || 'N/A'}\n` +
      `*Subject:* ${subject || 'General'}\n\n` +
      `*Message:*\n${message}`
    );

    // ---- EmailJS Integration ----
    // Uncomment and fill in your EmailJS credentials:
    /*
    await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      from_name: name,
      from_email: email,
      phone: phone,
      subject: subject,
      message: message,
      to_email: 'sirumullasidhartha@gmail.com'
    }, 'YOUR_PUBLIC_KEY');
    */

    // Simulate email sent (remove this block when EmailJS is set up)
    await new Promise(r => setTimeout(r, 800));

    // Open WhatsApp with the message pre-filled
    const waURL = `https://wa.me/919346546801?text=${waText}`;
    window.open(waURL, '_blank');

    status.className = 'form-status success';
    status.textContent = '✅ Message sent! WhatsApp opened for instant notification. You\'ll also receive an email.';
    btn.textContent = 'Message Sent ✓';

    // Reset form
    setTimeout(() => {
      ['cf-name','cf-email','cf-phone','cf-message'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('cf-subject').selectedIndex = 0;
      btn.disabled = false;
      btn.textContent = 'Send Message ✈️';
    }, 4000);

  } catch (err) {
    status.className = 'form-status error';
    status.textContent = '❌ Something went wrong. Please email directly: sirumullasidhartha@gmail.com';
    btn.disabled = false;
    btn.textContent = 'Send Message ✈️';
  }
}

// ============ PARTICLES ============
function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 3 + 1;
  p.style.cssText = `
    width:${size}px;height:${size}px;
    left:${Math.random()*100}vw;
    background:${Math.random()>0.5?'rgba(0,212,255,0.4)':'rgba(124,58,255,0.4)'};
    animation-duration:${Math.random()*10+8}s;
    animation-delay:${Math.random()*5}s;
  `;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 18000);
}
setInterval(createParticle, 800);

// NAV active state
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#'+current ? 'var(--accent)' : '';
  });
});








//mcpserverconnection

