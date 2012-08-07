var Magnetic = new(function () {
  function z(a) {
    var b = new Magnet;
    b.position.x = a.x;
    b.position.y = a.y;
    f.push(b);
    a = b.position;
    for (b = 0; b < F; b++) {
      var c = new Particle;
      c.position.x = a.x;
      c.position.y = a.y;
      c.shift.x = a.x;
      c.shift.y = a.y;
      c.color = k[g].particleFill;
      q.push(c)
    }
  }

  function G(a) {
    n = a.clientX - (window.innerWidth - i) * 0.5;
    o = a.clientY - (window.innerHeight - j) * 0.5
  }

  function H(a) {
    a.preventDefault();
    A()
  }

  function A() {
    w = true;
    if ((new Date).getTime() - x < 300) {
      z({
        x: n,
        y: o
      });
      x = 0
    }
    x = (new Date).getTime();
    for (var a = 0, b = f.length; a < b; a++) {
      magnet = f[a];
      if (B(magnet.position, {
        x: n,
        y: o
      }) < magnet.orbit * 0.5) {
        magnet.dragging = true;
        break
      }
    }
  }

  function I() {
    w = false;
    for (var a = 0, b = f.length; a < b; a++) {
      magnet = f[a];
      magnet.dragging = false
    }
  }

  function J(a) {
    if (a.keyCode == 37) s(-1);
    else a.keyCode == 39 && s(1)
  }

  function K(a) {
    if (a.touches.length == 1) {
      a.preventDefault();
      n = a.touches[0].pageX - (window.innerWidth - i) * 0.5;
      o = a.touches[0].pageY - (window.innerHeight - j) * 0.5;
      A()
    }
  }

  function L(a) {
    if (a.touches.length == 1) {
      a.preventDefault();
      n = a.touches[0].pageX - (window.innerWidth - i) * 0.5;
      o = a.touches[0].pageY - (window.innerHeight - j) * 0.5
    }
  }

  function M() {
    w = false;
    for (var a = 0, b = f.length; a < b; a++) {
      magnet = f[a];
      magnet.dragging = false
    }
  }

  function N(a) {
    a.preventDefault();
    s(-1)
  }

  function O(a) {
    a.preventDefault();
    s(1)
  }

  function s(a) {
    g += a;
    g = g < 0 ? k.length - 1 : g;
    g = g > k.length - 1 ? 0 : g;
    a = 0;
    for (var b = q.length; a < b; a++) q[a].color = k[g].particleFill
  }

  function C() {
    i = r ? window.innerWidth : 800;
    j = r ? window.innerHeight : 550;
    e.width = i;
    e.height = j;
    var a = (window.innerWidth - i) * 0.5,
      b = (window.innerHeight - j) * 0.5;
    e.style.position = "absolute";
    e.style.left = a + "px";
    e.style.top = b + "px";
    t.style.position = "absolute";
    t.style.left = a + "px";
    t.style.top = b - 20 + "px"
  }

  function P() {
    if (k[g].useFade) {
      d.fillStyle = k[g].fadeFill;
      d.fillRect(0, 0, d.canvas.width, d.canvas.height)
    } else d.clearRect(0, 0, e.width, e.height);
    var a, b, c, h, D, u;
    a = -1;
    h = 0;
    for (u = f.length; h < u; h++) {
      b = f[h];
      if (b.dragging) {
        b.position.x += (n - b.position.x) * 0.2;
        b.position.y += (o - b.position.y) * 0.2
      } else if (b.position.x < 0 || b.position.y < 0 || b.position.x > i || b.position.y > j) a = h;
      b.size += (b.connections / 3 - b.size) * 0.05;
      b.size = Math.max(b.size, 2);
      c = d.createRadialGradient(b.position.x, b.position.y, 0, b.position.x, b.position.y, b.size * 10);
      c.addColorStop(0, k[g].glowA);
      c.addColorStop(1, k[g].glowB);
      d.beginPath();
      d.fillStyle = c;
      d.arc(b.position.x, b.position.y, b.size * 10, 0, Math.PI * 2, true);
      d.fill();
      d.beginPath();
      d.fillStyle = c;
      d.arc(b.position.x, b.position.y, b.size, 0, Math.PI * 2, true);
      d.fill();
      b.connections = 0
    }
    a != -1 && f.length > 1 && f.splice(a, 1);
    c = 0;
    for (D = q.length; c < D; c++) {
      a = q[c];
      var y = -1,
        E = -1,
        l = null,
        v = {
          x: 0,
          y: 0
        };
      h = 0;
      for (u = f.length; h < u; h++) {
        b = f[h];
        y = B(a.position, b.position) - b.orbit * 0.5;
        if (a.magnet != b) {
          var m = b.position.x - a.position.x;
          if (m > -p && m < p) v.x += m / p;
          m = b.position.y - a.position.y;
          if (m > -p && m < p) v.y += m / p
        }
        if (l == null || y < E) {
          E = y;
          l = b
        }
      }
      if (a.magnet == null || a.magnet != l) a.magnet = l;
      l.connections += 1;
      a.angle += a.speed;
      a.shift.x += (l.position.x + v.x * 6 - a.shift.x) * a.speed;
      a.shift.y += (l.position.y + v.y * 6 - a.shift.y) * a.speed;
      a.position.x = a.shift.x + Math.cos(c + a.angle) * a.orbit * a.force;
      a.position.y = a.shift.y + Math.sin(c + a.angle) * a.orbit * a.force;
      a.position.x = Math.max(Math.min(a.position.x, i - a.size / 2), a.size / 2);
      a.position.y = Math.max(Math.min(a.position.y, j - a.size / 2), a.size / 2);
      a.orbit += (l.orbit - a.orbit) * 0.1;
      d.beginPath();
      d.fillStyle = a.color;
      d.arc(a.position.x, a.position.y, a.size / 2, 0, Math.PI * 2, true);
      d.fill()
    }
  }

  function B(a, b) {
    var c = b.x - a.x,
      h = b.y - a.y;
    return Math.sqrt(c * c + h * h)
  }
  var r = navigator.userAgent.toLowerCase().indexOf("android") != -1 || navigator.userAgent.toLowerCase().indexOf("iphone") != -1 || navigator.userAgent.toLowerCase().indexOf("ipad") != -1,
    i = r ? window.innerWidth : 800,
    j = r ? window.innerHeight : 550,
    F = 20,
    p = 300,
    e, d, t, q = [],
    f = [],
    n = window.innerWidth - i,
    o = window.innerHeight - j,
    w = false,
    x = 0,
    g = 0,
    k = [{
      glowA: "rgba(233,143,154,0.3)",
      glowB: "rgba(0,143,154,0.0)",
      particleFill: "#ffffff",
      fadeFill: "rgba(22,22,22,.6)",
      useFade: false
    }, {
      glowA: "rgba(0,200,250,0.3)",
      glowB: "rgba(0,200,250,0.0)",
      particleFill: "#ffffff",
      fadeFill: "rgba(22,22,22,.6)",
      useFade: true
    }, {
      glowA: "rgba(230,0,0,0.3)",
      glowB: "rgba(230,0,0,0.0)",
      particleFill: "#ffffff",
      fadeFill: "rgba(11,11,11,.6)",
      useFade: true
    }, {
      glowA: "rgba(0,230,0,0.3)",
      glowB: "rgba(0,230,0,0.0)",
      particleFill: "rgba(0,230,0,0.7)",
      fadeFill: "rgba(22,22,22,.6)",
      useFade: true
    }, {
      glowA: "rgba(0,0,0,0.3)",
      glowB: "rgba(0,0,0,0.0)",
      particleFill: "#333333",
      fadeFill: "rgba(255,255,255,.6)",
      useFade: true
    }, {
      glowA: "rgba(0,0,0,0.0)",
      glowB: "rgba(0,0,0,0.0)",
      particleFill: "#333333",
      fadeFill: "rgba(255,255,255,.2)",
      useFade: true
    }, {
      glowA: "rgba(230,230,230,0)",
      glowB: "rgba(230,230,230,0.0)",
      particleFill: "#ffffff",
      fadeFill: "",
      useFade: false
    }];
  this.init = function () {
    e = document.getElementById("world");
    t = document.getElementById("seeMore");
    if (e && e.getContext) {
      d = e.getContext("2d");
      if (r) e.style.border = "none";
      document.addEventListener("mousemove", G, false);
      e.addEventListener("mousedown", H, false);
      document.addEventListener("mouseup", I, false);
      document.addEventListener("keydown", J, false);
      window.addEventListener("resize", C, false);
      e.addEventListener("touchstart", K, false);
      document.addEventListener("touchmove", L, false);
      document.addEventListener("touchend", M, false);
      document.getElementById("keyboardLeft").addEventListener("click", N, false);
      document.getElementById("keyboardRight").addEventListener("click", O, false);
      for (var a = 0; a < 4; a++) z({
        x: (i - 300) * 0.5 + Math.random() * 300,
        y: (j - 300) * 0.5 + Math.random() * 300
      });
      C();
      setInterval(P, 1E3 / 30)
    }
  }
});

function Particle() {
  this.size = 0.5 + Math.random() * 3.5;
  this.position = {
    x: 0,
    y: 0
  };
  this.shift = {
    x: 0,
    y: 0
  };
  this.angle = 0;
  this.speed = 0.01 + this.size / 4 * 0.03;
  this.force = 1 - Math.random() * 0.11;
  this.color = "#ffffff";
  this.orbit = 1;
  this.magnet = null
}

function Magnet() {
  this.orbit = 100;
  this.position = {
    x: 0,
    y: 0
  };
  this.dragging = false;
  this.connections = 0;
  this.size = 1
}
Magnetic.init();