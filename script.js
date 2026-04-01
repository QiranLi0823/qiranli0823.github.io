// 导航栏交互
document.addEventListener('DOMContentLoaded', function() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section, header[id]');
  const sideNav = document.querySelector('.side-nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const backToTop = document.querySelector('.back-to-top');

  // 鼠标状态跟踪
  let isMouseInSection = false;
  let currentMouseSectionId = null;

  // 平滑滚动 - 侧边导航栏
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const targetId = this.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        let scrollTop;
        if (targetId === 'top') {
          scrollTop = 0;
        } else {
          const elementTop = targetElement.offsetTop;
          const elementHeight = targetElement.offsetHeight;
          const windowHeight = window.innerHeight;
          scrollTop = elementTop + (elementHeight / 2) - (windowHeight / 2);
          const maxScroll = document.documentElement.scrollHeight - windowHeight;
          scrollTop = Math.max(0, Math.min(scrollTop, maxScroll));
        }

        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });

        // 更新活动状态
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        isMouseInSection = false;
        currentMouseSectionId = targetId;
      }
    });
  });

  // 平滑滚动 - 移动端菜单
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          window.scrollTo({
            top: targetId === 'top' ? 0 : targetElement.offsetTop - 20,
            behavior: 'smooth'
          });
          // 关闭移动端菜单
          if (hamburger) hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
        }
      });
    });
  }

  // 滚动时更新活动状态
  function updateActiveNav() {
    if (isMouseInSection && currentMouseSectionId) return;

    let scrollCurrent = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 100)) {
        scrollCurrent = section.getAttribute('id');
      }
    });

    if (window.scrollY < 100) {
      scrollCurrent = 'top';
    }

    let targetId = '';
    if (isMouseInSection && currentMouseSectionId) {
      targetId = currentMouseSectionId;
    } else if (currentMouseSectionId) {
      if (scrollCurrent === currentMouseSectionId || scrollCurrent === '') {
        targetId = currentMouseSectionId;
      } else {
        targetId = scrollCurrent;
        currentMouseSectionId = null;
      }
    } else {
      targetId = scrollCurrent;
    }

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      }
    });

    if (window.scrollY < 100 && targetId !== 'top') {
      navItems.forEach(item => item.classList.remove('active'));
      document.querySelector('.nav-item[data-target="top"]').classList.add('active');
      currentMouseSectionId = null;
    }
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // 鼠标移动时更新导航栏
  if (sideNav) {
    function getSectionAtMousePosition(mouseX, mouseY) {
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right &&
            mouseY >= rect.top && mouseY <= rect.bottom) {
          return section.getAttribute('id');
        }
      }
      return null;
    }

    function highlightNavItem(targetId) {
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === targetId) {
          item.classList.add('active');
        }
      });
    }

    document.addEventListener('mousemove', function(e) {
      const navRect = sideNav.getBoundingClientRect();
      const isMouseOnNav = e.clientX >= navRect.left &&
                          e.clientX <= navRect.right &&
                          e.clientY >= navRect.top &&
                          e.clientY <= navRect.bottom;

      if (isMouseOnNav) {
        sideNav.style.background = 'rgba(255, 255, 255, 0.95)';
        isMouseInSection = false;
      } else {
        const mouseY = e.clientY;
        const windowHeight = window.innerHeight;
        const ratio = mouseY / windowHeight;
        let opacity = 0.7 + (ratio * 0.25);
        opacity = Math.max(0.7, Math.min(0.95, opacity));
        sideNav.style.background = `rgba(255, 255, 255, ${opacity})`;

        const sectionId = getSectionAtMousePosition(e.clientX, e.clientY);
        if (sectionId) {
          isMouseInSection = true;
          currentMouseSectionId = sectionId;
          highlightNavItem(sectionId);
        } else {
          isMouseInSection = false;
        }
      }
    });

    document.addEventListener('mouseleave', function() {
      sideNav.style.background = 'rgba(255, 255, 255, 0.85)';
      isMouseInSection = false;
      currentMouseSectionId = null;
      updateActiveNav();
    });

    document.addEventListener('mouseenter', function(e) {
      const navRect = sideNav.getBoundingClientRect();
      const isMouseOnNav = e.clientX >= navRect.left &&
                          e.clientX <= navRect.right &&
                          e.clientY >= navRect.top &&
                          e.clientY <= navRect.bottom;

      if (isMouseOnNav) {
        sideNav.style.background = 'rgba(255, 255, 255, 0.95)';
        isMouseInSection = false;
      } else {
        const mouseY = e.clientY;
        const windowHeight = window.innerHeight;
        const ratio = mouseY / windowHeight;
        let opacity = 0.7 + (ratio * 0.25);
        opacity = Math.max(0.7, Math.min(0.95, opacity));
        sideNav.style.background = `rgba(255, 255, 255, ${opacity})`;

        const sectionId = getSectionAtMousePosition(e.clientX, e.clientY);
        if (sectionId) {
          isMouseInSection = true;
          currentMouseSectionId = sectionId;
          highlightNavItem(sectionId);
        } else {
          isMouseInSection = false;
        }
      }
    });
  }

// 汉堡菜单
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', function() {
    this.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    // 更新aria-expanded状态
    const isExpanded = mobileMenu.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);
  });

  // 点击外部关闭菜单
  document.addEventListener('click', function(e) {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
    }
  });

  // ESC键关闭菜单
  document.addEventListener('keydown', function(e) {
    if (e.key === Escape && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
    }
  });
}
  if (backToTop) {
    function showBackToTop() {
      if (window.scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }

    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', showBackToTop);
    showBackToTop();
  }

  // 添加滚动动画
  const animateElements = document.querySelectorAll('.hero-card, section');

  // 检测用户是否偏好减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 为每个元素添加动画类和延迟
  animateElements.forEach((element, index) => {
    if (!prefersReducedMotion) {
      element.classList.add('animate-on-scroll');
      // 为 section 添加错落延迟 (头部卡片除外)
      if (!element.classList.contains('hero-card')) {
        element.setAttribute('data-delay', String(Math.min(index, 6)));
      }
    } else {
      // 如果用户偏好减少动画，直接显示元素
      element.classList.add('visible');
    }
  });

  // IntersectionObserver 触发动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 如果元素已经动画过，先重置
        if (entry.target.classList.contains('visible')) {
          entry.target.classList.remove('visible');
          // 重置列表项动画
          const listItems = entry.target.querySelectorAll('.list-item');
          listItems.forEach(item => {
            item.classList.remove('animate-item');
          });
        }

        // 触发新动画
        entry.target.classList.add('visible');

        // 为列表项添加动画 - 使用 requestAnimationFrame 优化性能
        const listItems = entry.target.querySelectorAll('.list-item');
        if (listItems.length > 0) {
          requestAnimationFrame(() => {
            listItems.forEach((item, itemIndex) => {
              if (!prefersReducedMotion) {
                // 使用 setTimeout 创建错落效果
                setTimeout(() => {
                  item.classList.add('animate-item');
                }, itemIndex * 50); // 50ms 间隔
              } else {
                item.classList.add('animate-item');
              }
            });
          });
        }
      }
    });
  }, {
    threshold: 0.15,  // 增加阈值，确保元素更明显时触发
    rootMargin: '0px 0px -100px 0px'  // 增加底部边距，提前触发
  });

  // 清理 IntersectionObserver - 页面卸载时
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });

  animateElements.forEach(element => {
    observer.observe(element);
  });

  // 设置当前年份
  document.getElementById("year").textContent = new Date().getFullYear();
});

// 暗色模式检测
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// 监听暗色模式变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (e.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
});