import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Ensure plugins are registered in case they aren't globally
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const steps = [
  {
    num: "01",
    title: "Consulta Inicial",
    desc: "Evaluamos tu salud dental con tecnología 3D de última generación para un diagnóstico preciso y sin sorpresas.",
    bgColor: "#f8f9fa",
    cardBg: "#ffffff",
    textColor: "#111"
  },
  {
    num: "02",
    title: "Plan Personalizado",
    desc: "Diseñamos un tratamiento a tu medida, explicando cada paso y asegurando tu total tranquilidad en el proceso.",
    bgColor: "#111111",
    cardBg: "#222222",
    textColor: "#ffffff"
  },
  {
    num: "03",
    title: "Tu Nueva Sonrisa",
    desc: "Ejecutamos el tratamiento con el máximo cuidado y precisión para que vuelvas a sonreír con confianza.",
    bgColor: "#e3f2fd",
    cardBg: "#ffffff",
    textColor: "#0d47a1"
  }
];

export default function StepWipe() {
  const container = useRef(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray('.step-panel') as HTMLElement[];
    
    // The first panel doesn't need to animate in, it's already visible.
    // The subsequent panels will wipe in from the bottom.
    panels.forEach((panel, i) => {
      if (i === 0) return;
      
      gsap.fromTo(panel, 
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: () => `top -${(i - 1) * window.innerHeight}px`,
            end: () => `top -${i * window.innerHeight}px`,
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    });
  }, { scope: container });

  return (
    <div 
      ref={container} 
      className="step-wipe-container" 
      style={{ height: `${steps.length * 100}vh`, position: 'relative' }}
    >
      <div 
        className="step-wipe-sticky" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          width: '100%', 
          overflow: 'hidden' 
        }}
      >
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="step-panel" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: step.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: index,
              // Initial clip path for panels after the first
              clipPath: index === 0 ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)'
            }}
          >
            <div 
              className="step-card"
              style={{
                backgroundColor: step.cardBg,
                color: step.textColor,
                padding: '4rem',
                borderRadius: '24px',
                maxWidth: '600px',
                width: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 600, opacity: 0.8 }}>
                Paso {step.num}
              </div>
              <h2 style={{ fontSize: '3rem', margin: 0, lineHeight: 1.1 }}>
                {step.title}
              </h2>
              <p style={{ fontSize: '1.25rem', opacity: 0.9, margin: 0, lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
