'use client';

import { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function ShaderBackground({ children, className = '' }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader - colorful wave distortion
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      
      // Color palette matching the theme (chart-1 to chart-5 in hex: #91c5ff, #3a81f6, #2563ef, #1a4eda, #1f3fad)
      vec3 palette(float t) {
        vec3 a = vec3(0.569, 0.773, 1.0);    // #91c5ff - chart-1
        vec3 b = vec3(0.227, 0.506, 0.965);  // #3a81f6 - chart-2
        vec3 c = vec3(0.145, 0.388, 0.937);  // #2563ef - chart-3
        vec3 d = vec3(0.102, 0.306, 0.855);  // #1a4eda - chart-4
        vec3 e = vec3(0.122, 0.247, 0.678);  // #1f3fad - chart-5
        
        float phase = fract(t * 4.0);
        if (phase < 0.25) return mix(a, b, phase * 4.0);
        if (phase < 0.5) return mix(b, c, (phase - 0.25) * 4.0);
        if (phase < 0.75) return mix(c, d, (phase - 0.5) * 4.0);
        return mix(d, e, (phase - 0.75) * 4.0);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 uv0 = uv;
        vec3 finalColor = vec3(0.0);
        
        // Create wave distortion
        float wave1 = sin(uv.x * 10.0 + time * 0.5) * 0.02;
        float wave2 = sin(uv.y * 8.0 + time * 0.3) * 0.02;
        float wave3 = sin((uv.x + uv.y) * 6.0 + time * 0.4) * 0.015;
        
        uv += wave1 + wave2 + wave3;
        
        // Create flowing layers
        for (float i = 0.0; i < 3.0; i++) {
          uv = fract(uv * 1.5) - 0.5;
          
          float d = length(uv) * exp(-length(uv0));
          
          vec3 col = palette(length(uv0) + i * 0.2 + time * 0.1);
          
          d = sin(d * 8.0 + time * 0.5) / 8.0;
          d = abs(d);
          d = pow(0.01 / d, 1.2);
          
          finalColor += col * d * 0.15;
        }
        
        // Add subtle gradient overlay for depth
        float gradient = 1.0 - uv0.y * 0.3;
        finalColor *= gradient;
        
        // Blend with background color for readability
        vec3 bgColor = vec3(1.0, 1.0, 1.0); // White for light mode
        finalColor = mix(bgColor, finalColor, 0.6);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const glContext = gl;

    // Compile shader
    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error('Shader compile error:', glContext.getShaderInfoLog(shader));
        glContext.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, glContext.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, glContext.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = glContext.createProgram();
    if (!program) return;
    glContext.attachShader(program, vertexShader);
    glContext.attachShader(program, fragmentShader);
    glContext.linkProgram(program);
    if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
      console.error('Program link error:', glContext.getProgramInfoLog(program));
      return;
    }
    glContext.useProgram(program);

    // Create buffer
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer);
    glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);

    // Get attribute/uniform locations
    const positionLocation = glContext.getAttribLocation(program, 'position');
    const resolutionLocation = glContext.getUniformLocation(program, 'resolution');
    const timeLocation = glContext.getUniformLocation(program, 'time');

    glContext.enableVertexAttribArray(positionLocation);
    glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      glContext.viewport(0, 0, canvas.width, canvas.height);
      glContext.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    // Animation loop
    const render = () => {
      const time = (Date.now() - startTimeRef.current) / 1000;
      glContext.uniform1f(timeLocation, time);
      glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    render();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      glContext.deleteProgram(program);
      glContext.deleteShader(vertexShader);
      glContext.deleteShader(fragmentShader);
      if (buffer) glContext.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
