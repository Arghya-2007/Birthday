import gsap from '@/animations/gsap';
import { JSX, useEffect, useRef, memo } from 'react';

// ─── Utility Functions (hot path – no allocations) ─────────────────────────
function lerp(a: number, b: number, n: number): number {
  return (1 - n) * a + n * b;
}

// Reusable point object to avoid GC pressure on every mouse event
const _point = { x: 0, y: 0 };

function getLocalPointerPos(e: MouseEvent | TouchEvent, rect: DOMRect): { x: number; y: number } {
  let clientX = 0,
    clientY = 0;
  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  _point.x = clientX - rect.left;
  _point.y = clientY - rect.top;
  return _point;
}

function getMouseDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

// ─── Debounce helper for resize ────────────────────────────────────────────
// MEMORY FIX: Track the actual window listener so it can be removed when all
// callbacks are gone (previously it was added once and leaked forever).
let _resizeTimer: ReturnType<typeof setTimeout> | null = null;
const _resizeCallbacks: Set<() => void> = new Set();
let _resizeListener: (() => void) | null = null;

function registerResize(cb: () => void) {
  _resizeCallbacks.add(cb);
  if (_resizeCallbacks.size === 1 && !_resizeListener) {
    _resizeListener = () => {
      if (_resizeTimer) clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => {
        _resizeCallbacks.forEach((fn) => fn());
      }, 150);
    };
    window.addEventListener('resize', _resizeListener, { passive: true });
  }
}

function unregisterResize(cb: () => void) {
  _resizeCallbacks.delete(cb);
  // MEMORY FIX: remove the global resize listener when no more callbacks
  if (_resizeCallbacks.size === 0 && _resizeListener) {
    window.removeEventListener('resize', _resizeListener);
    _resizeListener = null;
    if (_resizeTimer) {
      clearTimeout(_resizeTimer);
      _resizeTimer = null;
    }
  }
}

class ImageItem {
  public DOM: { el: HTMLDivElement; inner: HTMLDivElement | null } = {
    el: null as unknown as HTMLDivElement,
    inner: null
  };
  public defaultStyle: gsap.TweenVars = { scale: 1, x: 0, y: 0, opacity: 0 };
  public rect: DOMRect | null = null;
  private _resizeCb: () => void;

  constructor(DOM_el: HTMLDivElement) {
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector('.content__img-inner');
    this.getRect();
    this._resizeCb = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    registerResize(this._resizeCb);
  }

  destroy() {
    unregisterResize(this._resizeCb);
  }

  private getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }
}

// ─── Base mixin: IntersectionObserver-gated rAF loop ───────────────────────
// All variants share the same rAF + IO pattern. When the container scrolls
// offscreen the render loop pauses entirely — zero CPU while invisible.
function setupVisibilityGating(
  container: HTMLDivElement,
  startLoop: () => void,
  stopLoop: () => void
): IntersectionObserver {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      });
    },
    { threshold: 0 }
  );
  io.observe(container);
  return io;
}

// Cache container rect – updated only when the user actually scrolls or
// the container resizes instead of on every single mouse event.
// MEMORY FIX: returns a cleanup function to remove the scroll listener.
function cachedRect(container: HTMLDivElement): { get: () => DOMRect; destroy: () => void } {
  let _rect = container.getBoundingClientRect();
  let _dirty = true;

  const markDirty = () => { _dirty = true; };
  // Use passive listeners to avoid scroll-blocking
  window.addEventListener('scroll', markDirty, { passive: true });
  registerResize(markDirty);

  return {
    get() {
      if (_dirty) {
        _rect = container.getBoundingClientRect();
        _dirty = false;
      }
      return _rect;
    },
    destroy() {
      window.removeEventListener('scroll', markDirty);
      unregisterResize(markDirty);
    },
  };
}

// ─── Destroyable interface for all variants ─────────────────────────────────
interface Destroyable {
  destroy(): void;
}

class ImageTrailVariant1 implements Destroyable {
  private container: HTMLDivElement;
  private DOM: { el: HTMLDivElement };
  private images: ImageItem[];
  private imagesTotal: number;
  private imgPosition: number;
  private zIndexVal: number;
  private activeImagesCount: number;
  private isIdle: boolean;
  private threshold: number;
  private mousePos: { x: number; y: number };
  private lastMousePos: { x: number; y: number };
  private cacheMousePos: { x: number; y: number };
  private _rafId: number = 0;
  private _running: boolean = false;
  private _io: IntersectionObserver | null = null;
  private _rectCache: ReturnType<typeof cachedRect> | null = null;
  private _handlePointerMove: (ev: MouseEvent | TouchEvent) => void;
  private _initRender: ((ev: MouseEvent | TouchEvent) => void) | null;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll('.content__img')].map(img => new ImageItem(img as HTMLDivElement));
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    this._rectCache = cachedRect(container);

    this._handlePointerMove = (ev: MouseEvent | TouchEvent) => {
      const pos = getLocalPointerPos(ev, this._rectCache!.get());
      this.mousePos.x = pos.x;
      this.mousePos.y = pos.y;
    };
    container.addEventListener('mousemove', this._handlePointerMove as EventListener, { passive: true });
    container.addEventListener('touchmove', this._handlePointerMove as EventListener, { passive: true });

    this._initRender = (ev: MouseEvent | TouchEvent) => {
      const pos = getLocalPointerPos(ev, this._rectCache!.get());
      this.mousePos.x = pos.x;
      this.mousePos.y = pos.y;
      this.cacheMousePos = { ...this.mousePos };
      this._startLoop();
      container.removeEventListener('mousemove', this._initRender as EventListener);
      container.removeEventListener('touchmove', this._initRender as EventListener);
      this._initRender = null;
    };
    container.addEventListener('mousemove', this._initRender as EventListener, { passive: true });
    container.addEventListener('touchmove', this._initRender as EventListener, { passive: true });

    this._io = setupVisibilityGating(
      container,
      () => this._startLoop(),
      () => this._stopLoop()
    );
  }

  destroy() {
    this._stopLoop();
    this._io?.disconnect();
    this._rectCache?.destroy();
    this.container.removeEventListener('mousemove', this._handlePointerMove as EventListener);
    this.container.removeEventListener('touchmove', this._handlePointerMove as EventListener);
    if (this._initRender) {
      this.container.removeEventListener('mousemove', this._initRender as EventListener);
      this.container.removeEventListener('touchmove', this._initRender as EventListener);
    }
    this.images.forEach(img => {
      gsap.killTweensOf(img.DOM.el);
      img.destroy();
    });
  }

  private _startLoop() {
    if (this._running) return;
    this._running = true;
    this._rafId = requestAnimationFrame(() => this.render());
  }

  private _stopLoop() {
    this._running = false;
    cancelAnimationFrame(this._rafId);
  }

  private render() {
    if (!this._running) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos.x = this.mousePos.x;
      this.lastMousePos.y = this.mousePos.y;
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
    this._rafId = requestAnimationFrame(() => this.render());
  }

  private showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3',
          opacity: 0,
          scale: 0.2
        },
        0.4
      );
  }

  private onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }

  private onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }
}

// ─── Variant 2–8 base: shared rAF + visibility gating + cleanup ────────────
// MEMORY FIX: All variants now extend a common base that provides:
//  - IntersectionObserver-gated rAF (stops when offscreen)
//  - Proper destroy() that cleans up all listeners, observers, tweens
//  - Event listener references stored for removal

abstract class ImageTrailBase implements Destroyable {
  protected container: HTMLDivElement;
  protected DOM: { el: HTMLDivElement };
  protected images: ImageItem[];
  protected imagesTotal: number;
  protected imgPosition: number;
  protected zIndexVal: number;
  protected activeImagesCount: number;
  protected isIdle: boolean;
  protected threshold: number;
  protected mousePos: { x: number; y: number };
  protected lastMousePos: { x: number; y: number };
  protected cacheMousePos: { x: number; y: number };
  private _rafId: number = 0;
  private _running: boolean = false;
  private _io: IntersectionObserver | null = null;
  private _handlePointerMove: (ev: Event) => void;
  private _initRender: ((ev: Event) => void) | null;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll('.content__img')].map(img => new ImageItem(img as HTMLDivElement));
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    this._handlePointerMove = (ev: Event) => {
      const rect = container.getBoundingClientRect();
      const pos = getLocalPointerPos(ev as MouseEvent | TouchEvent, rect);
      this.mousePos.x = pos.x;
      this.mousePos.y = pos.y;
    };
    container.addEventListener('mousemove', this._handlePointerMove, { passive: true });
    container.addEventListener('touchmove', this._handlePointerMove, { passive: true });

    this._initRender = (ev: Event) => {
      const rect = container.getBoundingClientRect();
      const pos = getLocalPointerPos(ev as MouseEvent | TouchEvent, rect);
      this.mousePos.x = pos.x;
      this.mousePos.y = pos.y;
      this.cacheMousePos = { ...this.mousePos };
      this._startLoop();
      container.removeEventListener('mousemove', this._initRender!);
      container.removeEventListener('touchmove', this._initRender!);
      this._initRender = null;
    };
    container.addEventListener('mousemove', this._initRender, { passive: true });
    container.addEventListener('touchmove', this._initRender, { passive: true });

    // MEMORY FIX: All variants now get visibility gating
    this._io = setupVisibilityGating(
      container,
      () => this._startLoop(),
      () => this._stopLoop()
    );
  }

  destroy() {
    this._stopLoop();
    this._io?.disconnect();
    this.container.removeEventListener('mousemove', this._handlePointerMove);
    this.container.removeEventListener('touchmove', this._handlePointerMove);
    if (this._initRender) {
      this.container.removeEventListener('mousemove', this._initRender);
      this.container.removeEventListener('touchmove', this._initRender);
    }
    this.images.forEach(img => {
      gsap.killTweensOf(img.DOM.el);
      if (img.DOM.inner) gsap.killTweensOf(img.DOM.inner);
      img.destroy();
    });
  }

  private _startLoop() {
    if (this._running) return;
    this._running = true;
    this._rafId = requestAnimationFrame(() => this._renderLoop());
  }

  private _stopLoop() {
    this._running = false;
    cancelAnimationFrame(this._rafId);
  }

  private _renderLoop() {
    if (!this._running) return;
    this.render();
    this._rafId = requestAnimationFrame(() => this._renderLoop());
  }

  protected abstract render(): void;

  protected onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }

  protected onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }
}

class ImageTrailVariant2 extends ImageTrailBase {
  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
  }

  private showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        { scale: 2.8, filter: 'brightness(250%)' },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          filter: 'brightness(100%)'
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power2',
          opacity: 0,
          scale: 0.2
        },
        0.45
      );
  }
}

class ImageTrailVariant3 extends ImageTrailBase {
  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
  }

  private showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          xPercent: 0,
          yPercent: 0,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        { scale: 1.2 },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.6,
          ease: 'power2',
          opacity: 0,
          scale: 0.2,
          xPercent: () => gsap.utils.random(-30, 30),
          yPercent: -200
        },
        0.6
      );
  }
}

class ImageTrailVariant4 extends ImageTrailBase {
  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
  }

  private showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }
    dx *= distance / 100;
    dy *= distance / 100;

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2,
          filter: `brightness(${Math.max((400 * distance) / 100, 100)}%) contrast(${Math.max(
            (400 * distance) / 100,
            100
          )}%)`
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          filter: 'brightness(100%) contrast(100%)'
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3',
          opacity: 0
        },
        0.4
      )
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: 'power4',
          x: `+=${dx * 110}`,
          y: `+=${dy * 110}`
        },
        0.05
      );
  }
}

class ImageTrailVariant5 extends ImageTrailBase {
  private lastAngle: number = 0;

  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
  }

  private showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    if (angle > 90 && angle <= 270) angle += 180;
    const isMovingClockwise = angle >= this.lastAngle;
    this.lastAngle = angle;
    const startAngle = isMovingClockwise ? angle - 10 : angle + 10;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }
    dx *= distance / 150;
    dy *= distance / 150;

    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          filter: 'brightness(80%)',
          scale: 0.1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
          rotation: startAngle
        },
        {
          duration: 1,
          ease: 'power2',
          scale: 1,
          filter: 'brightness(100%)',
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2 + dx * 70,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2 + dy * 70,
          rotation: this.lastAngle
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'expo',
          opacity: 0
        },
        0.5
      )
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: 'power4',
          x: `+=${dx * 120}`,
          y: `+=${dy * 120}`
        },
        0.05
      );
  }
}

class ImageTrailVariant6 extends ImageTrailBase {
  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
  }

  private mapSpeedToSize(speed: number, minSize: number, maxSize: number) {
    const maxSpeed = 200;
    return minSize + (maxSize - minSize) * Math.min(speed / maxSpeed, 1);
  }

  private mapSpeedToBrightness(speed: number, minB: number, maxB: number) {
    const maxSpeed = 70;
    return minB + (maxB - minB) * Math.min(speed / maxSpeed, 1);
  }

  private mapSpeedToBlur(speed: number, minBlur: number, maxBlur: number) {
    const maxSpeed = 90;
    return minBlur + (maxBlur - minBlur) * Math.min(speed / maxSpeed, 1);
  }

  private mapSpeedToGrayscale(speed: number, minG: number, maxG: number) {
    const maxSpeed = 90;
    return minG + (maxG - minG) * Math.min(speed / maxSpeed, 1);
  }

  private showNextImage() {
    const dx = this.mousePos.x - this.cacheMousePos.x;
    const dy = this.mousePos.y - this.cacheMousePos.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    const scaleFactor = this.mapSpeedToSize(speed, 0.3, 2);
    const brightnessValue = this.mapSpeedToBrightness(speed, 0, 1.3);
    const blurValue = this.mapSpeedToBlur(speed, 20, 0);
    const grayscaleValue = this.mapSpeedToGrayscale(speed, 600, 0);

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2
        },
        {
          duration: 0.8,
          ease: 'power3',
          scale: scaleFactor,
          filter: `grayscale(${grayscaleValue * 100}%) brightness(${brightnessValue * 100}%) blur(${blurValue}px)`,
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        { scale: 2 },
        {
          duration: 0.8,
          ease: 'power3',
          scale: 1
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3.in',
          opacity: 0,
          scale: 0.2
        },
        0.45
      );
  }
}

function getNewPosition(position: number, offset: number, arr: ImageItem[]) {
  const realOffset = Math.abs(offset) % arr.length;
  if (position - realOffset >= 0) {
    return position - realOffset;
  } else {
    return arr.length - (realOffset - position);
  }
}

class ImageTrailVariant7 extends ImageTrailBase {
  private visibleImagesCount: number;
  private visibleImagesTotal: number;

  constructor(container: HTMLDivElement) {
    super(container);
    this.visibleImagesCount = 0;
    this.visibleImagesTotal = 9;
    this.visibleImagesTotal = Math.min(this.visibleImagesTotal, this.imagesTotal - 1);
  }

  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
  }

  private showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    ++this.visibleImagesCount;

    gsap.killTweensOf(img.DOM.el);
    const scaleValue = gsap.utils.random(0.5, 1.6);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          scale: scaleValue - Math.max(gsap.utils.random(0.2, 0.6), 0),
          rotationZ: 0,
          opacity: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2
        },
        {
          duration: 0.4,
          ease: 'power3',
          scale: scaleValue,
          rotationZ: gsap.utils.random(-3, 3),
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2
        },
        0
      );

    if (this.visibleImagesCount >= this.visibleImagesTotal) {
      const lastInQueue = getNewPosition(this.imgPosition, this.visibleImagesTotal, this.images);
      const oldImg = this.images[lastInQueue];
      gsap.to(oldImg.DOM.el, {
        duration: 0.4,
        ease: 'power4',
        opacity: 0,
        scale: 1.3,
        onComplete: () => {
          if (this.activeImagesCount === 0) {
            this.isIdle = true;
          }
        }
      });
    }
  }
}

class ImageTrailVariant8 extends ImageTrailBase {
  private rotation: { x: number; y: number } = { x: 0, y: 0 };
  private cachedRotation: { x: number; y: number } = { x: 0, y: 0 };
  private zValue: number = 0;
  private cachedZValue: number = 0;

  protected render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
  }

  private showNextImage() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relX = this.mousePos.x - centerX;
    const relY = this.mousePos.y - centerY;

    this.rotation.x = -(relY / centerY) * 30;
    this.rotation.y = (relX / centerX) * 30;
    this.cachedRotation = { ...this.rotation };

    const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const proportion = distanceFromCenter / maxDistance;
    this.zValue = proportion * 1200 - 600;
    this.cachedZValue = this.zValue;
    const normalizedZ = (this.zValue + 600) / 1200;
    const brightness = 0.2 + normalizedZ * 2.3;

    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .set(this.DOM.el, { perspective: 1000 }, 0)
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          z: 0,
          scale: 1 + this.cachedZValue / 1000,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
          rotationX: this.cachedRotation.x,
          rotationY: this.cachedRotation.y,
          filter: `brightness(${brightness})`
        },
        {
          duration: 1,
          ease: 'expo',
          scale: 1 + this.zValue / 1000,
          x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
          y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
          rotationX: this.rotation.x,
          rotationY: this.rotation.y
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power2',
          opacity: 0,
          z: -800
        },
        0.3
      );
  }
}

type ImageTrailConstructor =
  | typeof ImageTrailVariant1
  | typeof ImageTrailVariant2
  | typeof ImageTrailVariant3
  | typeof ImageTrailVariant4
  | typeof ImageTrailVariant5
  | typeof ImageTrailVariant6
  | typeof ImageTrailVariant7
  | typeof ImageTrailVariant8;

const variantMap: Record<number, ImageTrailConstructor> = {
  1: ImageTrailVariant1,
  2: ImageTrailVariant2,
  3: ImageTrailVariant3,
  4: ImageTrailVariant4,
  5: ImageTrailVariant5,
  6: ImageTrailVariant6,
  7: ImageTrailVariant7,
  8: ImageTrailVariant8
};

interface ImageTrailProps {
  items?: string[];
  variant?: number;
}

const ImageTrail = memo(function ImageTrail({ items = [], variant = 1 }: ImageTrailProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const Cls = variantMap[variant] || variantMap[1];
    // MEMORY FIX: store instance and call destroy() on cleanup
    const instance = new Cls(containerRef.current);
    return () => {
      instance.destroy();
    };
  }, [variant, items]);

  return (
    <div
      className="w-full h-full relative z-[100] rounded-lg bg-transparent overflow-visible"
      ref={containerRef}
      style={{
        // CSS containment: tells browser this subtree is independent of
        // the rest of the DOM, enabling compositor isolation and avoiding
        // unnecessary layout/paint recalculations from parent.
        contain: 'layout style',
      }}
    >
      {items.map((url) => (
        <div
          className="content__img w-[190px] aspect-[1.1] rounded-[15px] absolute top-0 left-0 opacity-0 overflow-hidden"
          key={url}
          style={{
            willChange: 'transform, opacity',
            // Promote each trail image to its own GPU layer from the start
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <div
            className="content__img-inner bg-center bg-cover w-[calc(100%+20px)] h-[calc(100%+20px)] absolute top-[-10px] left-[-10px]"
            style={{
              backgroundImage: `url(${url})`,
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>
      ))}
    </div>
  );
});

export default ImageTrail;
