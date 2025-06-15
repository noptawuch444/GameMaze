document.addEventListener('DOMContentLoaded', function() {
    // สร้างดาวทั่วไป
    for (let i = 0; i < 100; i++) {
      createStar();
    }
    
    // สร้างดาวตกทุกๆ 2 วินาที
    setInterval(createShootingStar, 2000);
  });
  
  function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    document.body.appendChild(star);
  }
  
  function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = `${Math.random() * 50}vw`;
    shootingStar.style.top = `${Math.random() * 50}vh`;
    shootingStar.style.animationDuration = `${2 + Math.random() * 3}s`;
    document.body.appendChild(shootingStar);
    
    // ลบออกหลังจาก animation เสร็จ
    setTimeout(() => {
      shootingStar.remove();
    }, 5000);
  }