// 防抖函数 - 用于优化 scroll 事件性能
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 节流函数 - 用于优化 mousemove 事件性能
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

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

  // 公共函数：更新导航栏活动状态
  function updateNavActiveState(targetId) {
    if (!targetId) return;

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      }
    });
  }

  // 公共函数：平滑滚动
  function scrollToTarget(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

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
  }

  // 平滑滚动 - 侧边导航栏
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const targetId = this.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        scrollToTarget(targetId);
        updateNavActiveState(targetId);
        isMouseInSection = false;
        currentMouseSectionId = targetId;
      }
    });
  });

  // 平滑滚动 - 移动端菜单
  if (mobileMenu && hamburger) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          // 移动端滚动
          const scrollPosition = targetId === 'top' ? 0 : targetElement.offsetTop - 20;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
          // 关闭移动端菜单
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // 滚动时更新活动状态（防抖优化）
  const updateActiveNav = function() {
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

    updateNavActiveState(targetId);

    if (window.scrollY < 100 && targetId !== 'top') {
      const topNavItem = document.querySelector('.nav-item[data-target="top"]');
      if (topNavItem) {
        topNavItem.classList.add('active');
      }
      currentMouseSectionId = null;
    }
  };

  window.addEventListener('scroll', debounce(updateActiveNav, 10));
  updateActiveNav();

  // 鼠标移动时更新导航栏（仅桌面端）
  if (sideNav) {
    // 获取鼠标所在位置的 section
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

    // 更新侧边栏背景
    function updateSideNavBackground(isMouseOnNav, mouseY) {
      if (isMouseOnNav) {
        sideNav.style.background = 'rgba(255, 255, 255, 0.95)';
      } else {
        const windowHeight = window.innerHeight;
        const ratio = mouseY / windowHeight;
        let opacity = 0.7 + (ratio * 0.25);
        opacity = Math.max(0.7, Math.min(0.95, opacity));
        sideNav.style.background = `rgba(255, 255, 255, ${opacity})`;
      }
    }

    // 鼠标移动事件处理（节流优化）
    const handleMouseMove = throttle(function(e) {
      const navRect = sideNav.getBoundingClientRect();
      const isMouseOnNav = e.clientX >= navRect.left &&
                          e.clientX <= navRect.right &&
                          e.clientY >= navRect.top &&
                          e.clientY <= navRect.bottom;

      updateSideNavBackground(isMouseOnNav, e.clientY);

      if (!isMouseOnNav) {
        const sectionId = getSectionAtMousePosition(e.clientX, e.clientY);
        if (sectionId) {
          isMouseInSection = true;
          currentMouseSectionId = sectionId;
          updateNavActiveState(sectionId);
        } else {
          isMouseInSection = false;
        }
      }
    }, 50);

    document.addEventListener('mousemove', handleMouseMove);

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

      updateSideNavBackground(isMouseOnNav, e.clientY);

      if (!isMouseOnNav) {
        const sectionId = getSectionAtMousePosition(e.clientX, e.clientY);
        if (sectionId) {
          isMouseInSection = true;
          currentMouseSectionId = sectionId;
          updateNavActiveState(sectionId);
        }
      }
    });
  }

  // 汉堡菜单
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      const isExpanded = !mobileMenu.classList.contains('active');
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(isExpanded));
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function(e) {
      if (mobileMenu.classList.contains('active') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // ESC 键关闭菜单
    document.addEventListener('keydown', function(e) {
      if (e.key === "Escape" && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 返回顶部按钮
  if (backToTop) {
    const showBackToTop = debounce(function() {
      if (window.scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }, 10);

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
      // 为 section 添加错落延迟（头部卡片除外）
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

        // 为列表项添加动画
        const listItems = entry.target.querySelectorAll('.list-item');
        if (listItems.length > 0) {
          requestAnimationFrame(() => {
            listItems.forEach((item, itemIndex) => {
              if (!prefersReducedMotion) {
                // 使用 setTimeout 创建错落效果
                setTimeout(() => {
                  item.classList.add('animate-item');
                }, itemIndex * 50);
              } else {
                item.classList.add('animate-item');
              }
            });
          });
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  });

  animateElements.forEach(element => {
    observer.observe(element);
  });

  // 设置当前年份
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
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
