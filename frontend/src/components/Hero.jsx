import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardPreview from './DashboardPreview';

const defaultShaderSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}
void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=vec3(0);
	float bg=clouds(vec2(st.x+T*.5,-st.y));
	uv*=1.-.3*(sin(T*.2)*.5+.5);
	for (float i=1.; i<12.; i++) {
		uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
		float b=noise(i+p+bg*1.731);
		col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
		col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
	}
	O=vec4(col,1);
}`;

const useShaderBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const rendererRef = useRef(null);
  const pointersRef = useRef(null);

  class WebGLRenderer {
    constructor(canvas, scale) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext('webgl2');
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      this.shaderSource = defaultShaderSource;
      this.mouseMove = [0, 0];
      this.mouseCoords = [0, 0];
      this.pointerCoords = [0, 0];
      this.nbrOfPointers = 0;
      this.program = null;
      this.vs = null;
      this.fs = null;
      this.buffer = null;
      this.vertexSrc = `#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}`;
      this.vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
    }
    updateShader(source) { this.reset(); this.shaderSource = source; this.setup(); this.init(); }
    updateMove(deltas) { this.mouseMove = deltas; }
    updateMouse(coords) { this.mouseCoords = coords; }
    updatePointerCoords(coords) { this.pointerCoords = coords; }
    updatePointerCount(nbr) { this.nbrOfPointers = nbr; }
    updateScale(scale) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }
    compile(shader, source) {
      const gl = this.gl;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
    }
    test(source) {
      let result = null;
      const gl = this.gl;
      const shader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) result = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      return result;
    }
    reset() {
      const gl = this.gl;
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
        if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
        gl.deleteProgram(this.program);
      }
    }
    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER);
      this.fs = gl.createShader(gl.FRAGMENT_SHADER);
      this.compile(this.vs, this.vertexSrc);
      this.compile(this.fs, this.shaderSource);
      this.program = gl.createProgram();
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);
    }
    init() {
      const gl = this.gl;
      const program = this.program;
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      program.resolution = gl.getUniformLocation(program, 'resolution');
      program.time = gl.getUniformLocation(program, 'time');
      program.move = gl.getUniformLocation(program, 'move');
      program.touch = gl.getUniformLocation(program, 'touch');
      program.pointerCount = gl.getUniformLocation(program, 'pointerCount');
      program.pointers = gl.getUniformLocation(program, 'pointers');
    }
    render(now = 0) {
      const gl = this.gl;
      const program = this.program;
      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.uniform2f(program.resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(program.time, now * 1e-3);
      gl.uniform2f(program.move, ...this.mouseMove);
      gl.uniform2f(program.touch, ...this.mouseCoords);
      gl.uniform1i(program.pointerCount, this.nbrOfPointers);
      gl.uniform2fv(program.pointers, this.pointerCoords);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  class PointerHandler {
    constructor(element, scale) {
      this.scale = scale;
      this.active = false;
      this.pointers = new Map();
      this.lastCoords = [0, 0];
      this.moves = [0, 0];
      const map = (element, scale, x, y) => [x * scale, element.height - y * scale];
      
      element.addEventListener('pointerdown', (e) => {
        this.active = true;
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
      });
      element.addEventListener('pointerup', (e) => {
        if (this.count === 1) this.lastCoords = this.first;
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });
      element.addEventListener('pointerleave', (e) => {
        if (this.count === 1) this.lastCoords = this.first;
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });
      element.addEventListener('pointermove', (e) => {
        if (!this.active) return;
        this.lastCoords = [e.clientX, e.clientY];
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
        this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
      });
    }
    getScale() { return this.scale; }
    get count() { return this.pointers.size; }
    get move() { return this.moves; }
    get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]; }
    get first() { return this.pointers.values().next().value || this.lastCoords; }
  }

  const resize = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.min(1.5, window.devicePixelRatio); // Cap rendering to save performance online
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (rendererRef.current) rendererRef.current.updateScale(dpr);
  };

  const loop = (now) => {
    if (!rendererRef.current || !pointersRef.current) return;
    rendererRef.current.updateMouse(pointersRef.current.first);
    rendererRef.current.updatePointerCount(pointersRef.current.count);
    rendererRef.current.updatePointerCoords(pointersRef.current.coords);
    rendererRef.current.updateMove(pointersRef.current.move);
    rendererRef.current.render(now);
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.min(1.5, window.devicePixelRatio);
    
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    rendererRef.current.setup();
    rendererRef.current.init();
    resize();
    
    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }
    
    loop(0);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) rendererRef.current.reset();
    };
  }, []);

  return canvasRef;
};

// Merged Component: Integrating shader with original content structure
export default function Hero() {
  const canvasRef = useShaderBackground();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });

  // Hero text: fades out + lifts + blurs as user scrolls past (premium depth)
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const textBlur = useTransform(scrollYProgress, [0, 0.35], [0, 10]);
  // Canvas: subtle vertical parallax shift
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  // Dashboard preview: gentle scale-down for depth
  const dashScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const dashOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);
  const dashY = useTransform(scrollYProgress, [0, 0.5], [0, 30]);

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] flex items-center overflow-hidden bg-black">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
      
      {/* WebGL Canvas Background */}
      <motion.div className="absolute inset-0" style={{ y: canvasY }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover touch-none opacity-80"
          style={{ background: 'black' }}
        />
      </motion.div>
      
      {/* Dark overlay to ensure text remains readable over shader */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0" />

      {/* Hero Content Overlay */}
      <div className="container-lg pt-28 pb-20 md:pt-36 md:pb-28 grid lg:grid-cols-[1fr_380px] gap-16 lg:gap-24 items-center z-10">
        
        {/* Vector Text & Action Area */}
        <motion.div 
          className="relative z-10 text-center lg:text-left will-change-transform" 
          style={{ opacity: textOpacity, y: textY, filter: textBlur.get ? undefined : 'none' }}
        >
          <div className="mb-8 inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500/10 backdrop-blur-md border border-orange-300/30 rounded-full text-sm animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-100 font-medium tracking-wide">Now in public beta</span>
          </div>

          <div className="space-y-2 mb-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-orange-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent animate-fade-in-up animation-delay-200" style={{ lineHeight: '1.1' }}>
              Subscriptions,
            </h1>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-200" style={{ lineHeight: '1.2' }}>
              finally under control.
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-orange-100/90 font-light leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10 animate-fade-in-up animation-delay-400">
            A single dashboard to track every recurring charge, surface hidden costs, and reclaim wasted spend — automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-400">
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black rounded-full font-semibold text-[15px] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25">
              Start for free
            </Link>
            <button className="px-8 py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-300/30 text-orange-100 rounded-full font-semibold text-[15px] transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              See how it works
            </button>
          </div>
        </motion.div>

        {/* Floating Dashboard Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ scale: dashScale, opacity: dashOpacity, y: dashY }}
          className="flex justify-center lg:justify-end z-10 shrink-0 mx-auto w-full max-w-[380px] drop-shadow-2xl hover:opacity-100 transition-opacity will-change-transform"
        >
          <DashboardPreview />
        </motion.div>

      </div>
    </section>
  );
}
