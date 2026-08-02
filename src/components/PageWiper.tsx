import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Ensure plugins are registered in case they aren't globally
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface PageWiperProps {
  optimizedImages?: {
    clinica1: string;
    clinica2: string;
    clinica3: string;
    limpieza: string;
    ortodoncia: string;
    implantes: string;
    blanqueamiento: string;
    endodoncia: string;
    odontopediatria: string;
  };
}

export default function PageWiper({ optimizedImages }: PageWiperProps) {
  const container = useRef(null);

  useGSAP(() => {
    // Prevent browser from restoring scroll position on reload which causes jumping
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    let mm = gsap.matchMedia();

    // 1. Animate Hero text on load (independent of scroll)
    const panels = gsap.utils.toArray('.page-panel') as HTMLElement[];
    const heroTargets = panels[0].querySelectorAll('.reveal-target');
    gsap.from(heroTargets, {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.2
    });

    mm.add("(min-width: 901px)", () => {
      let lastLabel = "inicio";
      // 2. Master Scroll Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: () => `+=${(panels.length - 1) * 2000 + 1500}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const currentLabel = tl.currentLabel();
            if (currentLabel && currentLabel !== lastLabel) {
              lastLabel = currentLabel;
              window.dispatchEvent(new CustomEvent("updateActiveNav", { detail: currentLabel }));
            }
          }
        }
      });

      // Initial pause so the user can read the hero text before wiping begins
      tl.addLabel("inicio", 0);
      tl.to({}, { duration: 1.5 });

      panels.forEach((panel, i) => {
        if (i === 0) return; // Hero already handled

        const targets = panel.querySelectorAll('.reveal-target');

        // Wipe in the panel from the bottom
        tl.fromTo(panel,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 2, ease: "none" }
        );

        // Reveal the text with a stagger, slightly overlapping the end of the wipe
        if (targets.length > 0) {
          tl.from(targets, {
            y: 60,
            opacity: 0,
            duration: 1.5,
            stagger: 0.3,
            ease: "power2.out"
          }, "-=0.5");
        }

        const label = ["", "clinica", "servicios", "resultados", "testimonios", "reservar"][i];
        if (label) tl.addLabel(label, tl.duration());

        // Specific behavior for Section 3 (Services)
        if (i === 2) {
          const scrollContent = panel.querySelector('.services-scroll-content') as HTMLElement;
          if (scrollContent) {
            // Fake scroll the content up
            tl.to(scrollContent, {
              y: () => -(Math.max(0, scrollContent.scrollHeight - window.innerHeight)),
              ease: "none",
              duration: 4 // longer duration for smooth reading scroll
            });
          }
        }

        // Add a "reading pause" where scrolling does nothing visually
        tl.to({}, { duration: 1.5 });
      });

      const handleScroll = (e: Event) => {
        const customEvent = e as CustomEvent;
        const section = customEvent.detail;

        const labelTime = tl.labels[section];
        if (labelTime !== undefined) {
          const progress = labelTime / tl.duration();
          const st = tl.scrollTrigger;
          if (st) {
            const scrollPos = st.start + (st.end - st.start) * progress;
            window.scrollTo({ top: scrollPos, behavior: 'smooth' });
          }
        }
      };

      window.addEventListener('scrollToSection', handleScroll);
      return () => window.removeEventListener('scrollToSection', handleScroll);
    });

    mm.add("(max-width: 900px)", () => {
      const panels = gsap.utils.toArray('.page-panel') as HTMLElement[];

      panels.forEach((panel) => {
        const targets = panel.querySelectorAll('.reveal-target');
        
        if (targets.length > 0) {
          gsap.from(targets, {
            scrollTrigger: {
              trigger: panel,
              start: "top 85%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power2.out"
          });
        }
      });

      // Nav scroll-to-section handler for mobile (native scroll)
      const handleMobileScroll = (e: Event) => {
        const section = (e as CustomEvent).detail as string;
        const labels = ["inicio", "clinica", "servicios", "resultados", "testimonios", "reservar"];
        const index = labels.indexOf(section);
        
        if (index !== -1 && panels[index]) {
          const yOffset = -80; // Offset for navbar
          const element = panels[index];
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      };

      window.addEventListener('scrollToSection', handleMobileScroll);
      return () => window.removeEventListener('scrollToSection', handleMobileScroll);
    });
  }, { scope: container });

  // Styles for the panels
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  return (
    <>
      <style>{`
        .service-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
          background-color: #ffffff; /* White background for the letters */
          aspect-ratio: 1/1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .service-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 22px 45px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .service-card .card-image-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          -webkit-mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 420 1260' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='420' height='250' fill='black'/%3E%3Cg transform='translate(0, 200)'%3E%3Cpath fill='black' d='M0,0 L420,0 L420,235 L412,235 C 400,235 394,270 382,270 C 370,270 366,240 354,240 C 342,240 339,285 327,285 C 315,285 312,245 300,245 C 288,245 285,275 273,275 C 261,275 258,232 246,232 C 234,232 230,300 218,300 C 206,300 203,238 191,238 C 179,238 176,278 164,278 C 152,278 149,235 137,235 C 125,235 122,268 110,268 C 98,268 95,238 83,238 C 71,238 67,282 55,282 C 43,282 40,232 28,232 C 16,232 12,250 8,250 L0,250 Z'/%3E%3C/g%3E%3C/svg%3E");
          -webkit-mask-size: 100% 300%;
          -webkit-mask-position: 0% 0%;
          -webkit-mask-repeat: no-repeat;
          mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 420 1260' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='420' height='250' fill='black'/%3E%3Cg transform='translate(0, 200)'%3E%3Cpath fill='black' d='M0,0 L420,0 L420,235 L412,235 C 400,235 394,270 382,270 C 370,270 366,240 354,240 C 342,240 339,285 327,285 C 315,285 312,245 300,245 C 288,245 285,275 273,275 C 261,275 258,232 246,232 C 234,232 230,300 218,300 C 206,300 203,238 191,238 C 179,238 176,278 164,278 C 152,278 149,235 137,235 C 125,235 122,268 110,268 C 98,268 95,238 83,238 C 71,238 67,282 55,282 C 43,282 40,232 28,232 C 16,232 12,250 8,250 L0,250 Z'/%3E%3C/g%3E%3C/svg%3E");
          mask-size: 100% 300%;
          mask-position: 0% 0%;
          mask-repeat: no-repeat;
          transition: -webkit-mask-position 0.9s cubic-bezier(0.7, 0, 0.3, 1), mask-position 0.9s cubic-bezier(0.7, 0, 0.3, 1);
        }

        .service-card:hover .card-image-wrapper {
          -webkit-mask-position: 0% 100%;
          mask-position: 0% 100%;
        }

        .service-card .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.9s cubic-bezier(0.7, 0, 0.3, 1);
        }

        .service-card:hover .card-image {
          transform: translateY(-20px) scale(1.05);
        }

        .service-card .card-text {
          font-size: 0.95rem;
          color: #333; /* Dark text on white background */
          line-height: 1.5;
          font-weight: 500;
          text-align: center;
          margin: 0;
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.4s ease 0.2s;
          z-index: 1;
        }

        .service-card:hover .card-text {
          transform: scale(1);
          opacity: 1;
        }

        .service-card .card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background-color: #fff;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #075985;
          z-index: 3;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .service-card:hover .card-badge {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .bento-image-container {
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          background-color: #f4f6f5;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
        }
        .bento-image-container:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 22px 45px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .bento-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .bento-image-container:hover img {
          transform: scale(1.08);
        }

        .review-card {
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
          cursor: pointer;
        }
        .review-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.05);
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes float-badge {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating-badge {
          animation: float-badge 3s ease-in-out infinite;
        }

        @keyframes float-btn {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .floating-btn-1 {
          animation: float-btn 3.5s ease-in-out infinite;
        }
        .floating-btn-2 {
          animation: float-btn 3.5s ease-in-out infinite 0.5s;
        }

        .visit-section {
          background-color: #075985;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .visit-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 4rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 900px) {
          .visit-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 11rem 2rem 6rem 2rem;
            text-align: center;
          }
        }
        .visit-text h2 {
          color: #ffffff;
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        @media (max-width: 768px) {
          .visit-text h2 {
            font-size: 2.5rem;
          }
        }
        .visit-text p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.15rem;
          line-height: 1.6;
          max-width: 450px;
          margin-bottom: 3rem;
        }
        .specialists {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .avatars {
          display: flex;
          padding-left: 5px;
        }
        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 3px solid #075985;
          background-color: #ddd;
          background-size: cover;
          background-position: center;
          position: relative;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
        }
        .avatar:hover {
          transform: translateY(-8px);
          z-index: 10 !important;
        }
        .avatar-1 { background-image: url('https://randomuser.me/api/portraits/women/44.jpg'); z-index: 6; margin-left: 0; }
        .avatar-2 { background-image: url('https://randomuser.me/api/portraits/men/32.jpg'); margin-left: -15px; z-index: 5; }
        .avatar-3 { background-image: url('https://randomuser.me/api/portraits/women/68.jpg'); margin-left: -15px; z-index: 4; }
        .avatar-4 { background-image: url('https://randomuser.me/api/portraits/men/46.jpg'); margin-left: -15px; z-index: 3; }
        .avatar-5 { background-image: url('https://randomuser.me/api/portraits/women/33.jpg'); margin-left: -15px; z-index: 2; }
        .avatar-6 { background-image: url('https://randomuser.me/api/portraits/men/22.jpg'); margin-left: -15px; z-index: 1; }
        .specialists span {
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .visit-form-card {
          background: #ffffff;
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        @media (max-width: 768px) {
          .visit-form-card {
            padding: 2rem;
          }
        }
        .visit-form-card h3 {
          color: #075985;
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 2rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 500px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group:not(.form-row .form-group) {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          color: #666;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .form-group input, .form-group select {
          padding: 1rem 1.2rem;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          border-radius: 12px;
          font-size: 1rem;
          color: #334155;
          font-family: inherit;
          outline: none;
          transition: all 0.3s ease;
        }
        .form-group input:focus, .form-group select:focus {
          border-color: #0ea5e9;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
        }
        .form-group select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2em 1.2em;
          padding-right: 3rem;
          cursor: pointer;
        }
        .submit-btn {
          width: 100%;
          background-color: #075985;
          color: #fff;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        .form-footer {
          text-align: center;
          font-size: 0.8rem;
          color: #888;
          margin-top: 1rem;
        }

        /* Responsive Layout Classes */
        .page-panel {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .page-wiper-container {
          width: 100%;
          height: 100vh;
          position: relative;
        }

        .section-wrapper {
          width: 100%;
          height: 100%;
          padding: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-wrapper-col {
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          width: 100%;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 1.5rem;
          flex: 1;
          min-height: 0;
          width: 100%;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
          padding-bottom: 2rem;
        }
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          width: 100%;
        }

        /* Mobile specific styling */
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .page-wiper-container {
            height: auto !important;
            overflow: visible !important;
          }
          .page-panel {
            position: relative !important;
            height: auto !important;
            min-height: 100vh;
            clip-path: none !important;
          }
        }

        @media (max-width: 768px) {
          /* Sections: taller panels with top-aligned content like services */
          .page-panel {
            align-items: flex-start !important;
            justify-content: flex-start !important;
          }

          .section-wrapper {
            padding: 4rem 1.5rem 3rem 1.5rem;
            align-items: flex-start;
            justify-content: flex-start;
            text-align: center;
          }
          .section-wrapper-col {
            align-items: center;
          }
          .services-scroll-content {
            padding: 4rem 1.5rem 3rem 1.5rem !important;
            text-align: center;
          }
          
          /* Hero */
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
          .hero-grid > div:first-child {
            align-items: center;
          }
          .hero-grid h1 { font-size: 2rem !important; line-height: 1.1 !important; }


          /* About grid: center + smaller images */
          .about-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            text-align: center;
          }
          .about-grid .bento-image-container {
            grid-column: 1 / -1 !important;
            grid-row: auto !important;
            height: 160px;
          }

          /* Center section headings */
          .section-wrapper h2,
          .section-wrapper h3,
          .section-wrapper p,
          .services-scroll-content h2,
          .services-scroll-content h3,
          .services-scroll-content p {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
          }

          /* Service cards — bigger, single column */
          .services-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
            max-width: 400px !important;
            margin: 0 auto;
          }
          .service-card {
            aspect-ratio: 1 / 1 !important;
            padding: 1.5rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .service-card .card-badge {
            font-size: 0.85rem !important;
            padding: 0.4rem 1rem !important;
            top: 14px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }

          /* Testimonials & FAQ */
          .testimonials-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }

          /* Visit section center */
          .visit-text {
            text-align: center;
          }
          .visit-text p {
            margin-left: auto;
            margin-right: auto;
          }
          .specialists {
            justify-content: center;
            flex-wrap: wrap;
          }

          /* ── Unified Typography for Accessibility ── */
          /* h1 */
          .page-panel h1 {
            font-size: 2rem !important;
            line-height: 1.15 !important;
          }
          /* h2 — all section titles */
          .page-panel h2,
          .visit-text h2 {
            font-size: 1.75rem !important;
            line-height: 1.2 !important;
          }
          /* h3 — subtitles */
          .page-panel h3,
          .visit-form-card h3 {
            font-size: 1.1rem !important;
            line-height: 1.3 !important;
          }
          /* Body text — all paragraphs */
          .page-panel p,
          .visit-text p,
          .visit-form-card .form-footer {
            font-size: 1rem !important;
            line-height: 1.6 !important;
          }
          /* Labels and small text */
          .form-group label {
            font-size: 0.9rem !important;
          }
          .form-group input,
          .form-group select {
            font-size: 1rem !important;
          }
          /* Review cards */
          .review-card p {
            font-size: 0.95rem !important;
          }
          /* FAQ answers */
          .faq-grid p {
            font-size: 0.95rem !important;
          }
          /* Buttons */
          .page-panel button,
          .submit-btn {
            font-size: 0.95rem !important;
          }
          /* Service card text */
          .service-card .card-text {
            font-size: 1rem !important;
            line-height: 1.5 !important;
            text-align: center !important;
          }
          .service-card .card-badge {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
      <div ref={container} className="page-wiper-container">

        {/* SECTION 1: HERO */}
        <section className="page-panel" style={{ ...panelStyle, zIndex: 1, clipPath: 'inset(0% 0 0 0)', backgroundColor: '#ffffff' }}>
          <div className="section-wrapper">

            <div className="hero-grid">
              {/* Left Column */}
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1 className="reveal-target" style={{ fontSize: '3.5rem', color: '#075985', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15, fontWeight: 800 }}>
                  Tu Sonrisa,<br /><span style={{ color: '#0ea5e9' }}>Nuestra Pasión</span>
                </h1>
                <p className="reveal-target" style={{ fontSize: '1.15rem', color: '#555', margin: 0, maxWidth: '500px', lineHeight: 1.6 }}>
                  Combinamos tecnología odontológica de vanguardia con un trato humano y empático para transformar tu experiencia dental. Descubre un espacio donde tu salud y comodidad son nuestra máxima prioridad, garantizando resultados impecables en cada visita.
                </p>

                <div className="reveal-target" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="floating-btn-1" style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: '#075985',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px 0 rgba(7,89,133,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0c4a6e'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#075985'; }}
                  >
                    Agenda tu Consulta
                  </button>
                  <button className="floating-btn-2" style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: '#075985',
                    border: '2px solid #075985',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    Ver Especialidades
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="reveal-target" style={{ position: 'relative', width: '100%', height: '500px' }}>
                <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800" alt="Familia en el dentista" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />

                {/* Floating Badge */}
                <div className="floating-badge" style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-20px',
                  backgroundColor: '#ffffff',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  zIndex: 10
                }}>
                  <div style={{ backgroundColor: '#e0f2fe', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Calidad Certificada</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Estándares Internacionales</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: ABOUT */}
        <section className="page-panel" style={{ ...panelStyle, zIndex: 2, clipPath: 'inset(100% 0 0 0)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="section-wrapper section-wrapper-col">

            <div className="reveal-target" style={{ textAlign: 'left', marginBottom: '2rem', flexShrink: 0 }}>
              <h2 style={{ fontSize: '2.5rem', color: '#075985', margin: '0.5rem 0', letterSpacing: '-0.02em' }}>
                Tecnología avanzada y un trato cercano <br/> para cuidar de tu salud dental.
              </h2>
              <p style={{ fontSize: '1rem', color: '#555', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
                Un espacio diseñado para tu tranquilidad. Contamos con los mejores especialistas y la tecnología más avanzada para garantizar tratamientos sin dolor y resultados perfectos.
              </p>
            </div>

            <div className="reveal-target about-grid">
              <div className="bento-image-container" style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}>
                <img src={optimizedImages?.clinica1 || "/images/clinica1.jpg"} alt="Instalaciones 1" />
              </div>
              <div className="bento-image-container" style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
                <img src={optimizedImages?.clinica2 || "/images/clinica2.jpg"} alt="Instalaciones 2" />
              </div>
              <div className="bento-image-container" style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
                <img src={optimizedImages?.clinica3 || "/images/clinica3.jpg"} alt="Instalaciones 3" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SERVICES (NORMAL SCROLL) */}
        <section className="page-panel" style={{ ...panelStyle, zIndex: 3, clipPath: 'inset(100% 0 0 0)', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div className="services-scroll-content" style={{ width: '100%', padding: '4rem 4rem 10rem 4rem', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto' }}>

            <div className="reveal-target" style={{ textAlign: 'left', marginBottom: '2rem', flexShrink: 0 }}>
              <h2 style={{ fontSize: '2.5rem', color: '#075985', margin: '0.5rem 0', letterSpacing: '-0.02em' }}>
                Especialidades
              </h2>
              <h3 style={{ fontSize: '1.25rem', color: '#075985', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                Todo lo que tu sonrisa necesita, en un solo lugar
              </h3>
              <p style={{ fontSize: '1rem', color: '#555', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
                Desde el mantenimiento diario hasta tratamientos de alta precisión, con la misma atención en cada etapa.
              </p>
            </div>

            <div className="reveal-target services-grid">
              <div className="service-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={optimizedImages?.limpieza || "/images/limpieza_dental.png"} alt="Limpieza dental" />
                </div>
                <p className="card-text">Profilaxis profesional para eliminar placa y sarro, y prevenir enfermedades de encías.</p>
                <div className="card-badge">Limpieza dental</div>
              </div>

              <div className="service-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={optimizedImages?.ortodoncia || "/images/ortodoncia.png"} alt="Ortodoncia" />
                </div>
                <p className="card-text">Brackets tradicionales y alineadores transparentes para corregir la posición de tu arco dental.</p>
                <div className="card-badge">Ortodoncia</div>
              </div>

              <div className="service-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={optimizedImages?.implantes || "/images/implantes.png"} alt="Implantes" />
                </div>
                <p className="card-text">Reemplazo de piezas dentales con materiales biocompatibles y planificación 3D.</p>
                <div className="card-badge">Implantes</div>
              </div>

              <div className="service-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={optimizedImages?.blanqueamiento || "/images/blanqueamiento.png"} alt="Blanqueamiento" />
                </div>
                <p className="card-text">Aclarado dental seguro y progresivo, adaptado a la sensibilidad de cada paciente.</p>
                <div className="card-badge">Blanqueamiento</div>
              </div>

              <div className="service-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={optimizedImages?.endodoncia || "/images/endodoncia.png"} alt="Endodoncia" />
                </div>
                <p className="card-text">Tratamiento de conducto sin dolor, con tecnología rotatoria de última generación.</p>
                <div className="card-badge">Endodoncia</div>
              </div>

              <div className="service-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={optimizedImages?.odontopediatria || "/images/odontopediatria.png"} alt="Odontopediatría" />
                </div>
                <p className="card-text">Atención especializada y en confianza para las primeras visitas de los más pequeños.</p>
                <div className="card-badge">Odontopediatría</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: RESULTADOS REALES */}
        <section className="page-panel" style={{ ...panelStyle, zIndex: 4, clipPath: 'inset(100% 0 0 0)', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafa' }}>
          <div className="section-wrapper section-wrapper-col">

            <div className="reveal-target" style={{ textAlign: 'left', marginBottom: '2rem', flexShrink: 0 }}>
              <h2 style={{ fontSize: '2.5rem', color: '#075985', margin: '0.5rem 0', letterSpacing: '-0.02em' }}>
                Lo que dicen nuestros pacientes
              </h2>
              <p style={{ fontSize: '1rem', color: '#555', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
                La mejor prueba de nuestro trabajo es la satisfacción de nuestros pacientes. Esto es lo que opinan sobre su experiencia en la clínica.
              </p>
            </div>

            <div className="reveal-target no-scrollbar testimonials-grid">
              {[
                { name: 'Laura M.', initial: 'L', color: '#E91E63', stars: 5, time: 'Hace 2 semanas', text: 'Excelente atención, muy profesionales. Me hice un blanqueamiento y el resultado fue increíble, sin dolor ni sensibilidad.' },
                { name: 'Carlos R.', initial: 'C', color: '#3F51B5', stars: 5, time: 'Hace 1 mes', text: 'La mejor clínica dental a la que he ido. El equipo es muy amable y las instalaciones son de primera. Totalmente recomendados.' },
                { name: 'Ana P.', initial: 'A', color: '#009688', stars: 5, time: 'Hace 3 meses', text: 'Fui por una limpieza y salí encantada. Te explican todo con detalle y te hacen sentir muy cómoda. Volveré sin duda.' },
                { name: 'Diego F.', initial: 'D', color: '#FF9800', stars: 5, time: 'Hace 4 meses', text: 'Trato inmejorable y mucha puntualidad. El tratamiento de ortodoncia me está yendo genial, ya noto los cambios.' },
                { name: 'Marta G.', initial: 'M', color: '#9C27B0', stars: 4, time: 'Hace 5 meses', text: 'Muy buena experiencia. Me pusieron un implante y aunque iba con miedo, no me dolió nada. La atención es de 10.' },
                { name: 'Sergio L.', initial: 'S', color: '#4CAF50', stars: 5, time: 'Hace 6 meses', text: 'Llevé a mi hijo para su primera revisión y la odontopediatra fue un amor. Tienen mucha paciencia con los niños.' }
              ].map((review, idx) => (
                <div key={idx} className="review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: review.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {review.initial}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#075985', fontSize: '0.95rem' }}>{review.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#777' }}>{review.time}</div>
                      </div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#FBBC04', letterSpacing: '2px', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {review.stars === 5 ? '★★★★★' : '★★★★☆'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 1.5 }}>
                      "{review.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ */}
        <section className="page-panel" style={{ ...panelStyle, zIndex: 5, clipPath: 'inset(100% 0 0 0)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="section-wrapper section-wrapper-col">

            <div className="reveal-target" style={{ textAlign: 'left', marginBottom: '2rem', flexShrink: 0 }}>
              <h2 style={{ fontSize: '2.5rem', color: '#075985', margin: '0.5rem 0', letterSpacing: '-0.02em' }}>
                Preguntas Frecuentes
              </h2>
              <p style={{ fontSize: '1rem', color: '#555', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
                Resolvemos tus inquietudes para que vengas a tu cita con total tranquilidad.
              </p>
            </div>

            <div className="reveal-target no-scrollbar faq-grid">
              {[
                { q: '¿Duele el blanqueamiento dental?', a: 'No, utilizamos técnicas modernas de luz fría que minimizan la sensibilidad dental durante y después del tratamiento.' },
                { q: '¿Cuánto dura un tratamiento de ortodoncia?', a: 'Depende del caso clínico, pero con ortodoncia invisible los plazos suelen reducirse a entre 6 y 18 meses.' },
                { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos todas las tarjetas de crédito, débito, transferencias y ofrecemos financiamiento sin intereses a 12 meses.' },
                { q: '¿A qué edad debe ser la primera visita del niño?', a: 'Recomendamos la primera revisión cuando sale el primer diente de leche, o a más tardar al cumplir el primer año.' },
                { q: '¿Es doloroso ponerse un implante?', a: 'En absoluto. El procedimiento se realiza con anestesia local y la recuperación suele ser rápida y sin molestias severas.' },
                { q: '¿Cada cuánto debo hacerme una limpieza?', a: 'Lo ideal es realizar una profilaxis profesional cada 6 a 8 meses para mantener encías sanas y prevenir sarro.' },
              ].map((faq, idx) => (
                <div key={idx} className="review-card">
                  <h3 style={{ fontSize: '1.15rem', color: '#075985', margin: 0, fontWeight: 600 }}>{faq.q}</h3>
                  <p style={{ fontSize: '0.95rem', color: '#555', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* SECTION 6: VISIT / RESERVAR */}
        <section className="page-panel" style={{ ...panelStyle, zIndex: 6, clipPath: 'inset(100% 0 0 0)', backgroundColor: '#075985' }}>
          <div className="w-full h-full flex justify-center items-center bg-sky-900 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 pt-[25%] lg:pt-16 pb-16 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center text-center lg:text-left">
              
              <div className="text-white flex flex-col items-center lg:items-start">
                <h2 className="reveal-target text-[2.5rem] lg:text-[3.5rem] font-bold leading-[1.1] mb-6 tracking-tight text-white mt-0">
                  ¿Listo para transformar<br />tu sonrisa?
                </h2>
                <p className="reveal-target text-white/90 text-[1.15rem] leading-relaxed max-w-[450px] mb-12">
                  Agenda una cita de valoración hoy mismo y descubre por qué somos líderes en odontología avanzada.
                </p>

                <div className="specialists reveal-target flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <div className="flex pl-2">
                    <div className="w-11 h-11 rounded-full border-[3px] border-sky-900 bg-gray-300 bg-cover bg-center z-[6] hover:-translate-y-2 transition-transform cursor-pointer" style={{backgroundImage: "url('https://randomuser.me/api/portraits/women/44.jpg')"}}></div>
                    <div className="w-11 h-11 rounded-full border-[3px] border-sky-900 bg-gray-300 bg-cover bg-center -ml-[15px] z-[5] hover:-translate-y-2 transition-transform cursor-pointer" style={{backgroundImage: "url('https://randomuser.me/api/portraits/men/32.jpg')"}}></div>
                    <div className="w-11 h-11 rounded-full border-[3px] border-sky-900 bg-gray-300 bg-cover bg-center -ml-[15px] z-[4] hover:-translate-y-2 transition-transform cursor-pointer" style={{backgroundImage: "url('https://randomuser.me/api/portraits/women/68.jpg')"}}></div>
                    <div className="w-11 h-11 rounded-full border-[3px] border-sky-900 bg-gray-300 bg-cover bg-center -ml-[15px] z-[3] hover:-translate-y-2 transition-transform cursor-pointer" style={{backgroundImage: "url('https://randomuser.me/api/portraits/men/46.jpg')"}}></div>
                    <div className="w-11 h-11 rounded-full border-[3px] border-sky-900 bg-gray-300 bg-cover bg-center -ml-[15px] z-[2] hover:-translate-y-2 transition-transform cursor-pointer" style={{backgroundImage: "url('https://randomuser.me/api/portraits/women/33.jpg')"}}></div>
                    <div className="w-11 h-11 rounded-full border-[3px] border-sky-900 bg-gray-300 bg-cover bg-center -ml-[15px] z-[1] hover:-translate-y-2 transition-transform cursor-pointer" style={{backgroundImage: "url('https://randomuser.me/api/portraits/men/22.jpg')"}}></div>
                  </div>
                  <span className="text-white font-semibold text-[0.95rem]">Más de 20 especialistas listos para atenderte.</span>
                </div>
              </div>

              <div className="reveal-target bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.2)] w-full mx-auto max-w-[500px] lg:max-w-none text-left">
                <h3 className="text-sky-900 text-2xl font-bold mt-0 mb-8 text-center lg:text-left">Reserva Rápida</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-[0.85rem] font-semibold">Nombre Completo</label>
                    <input type="text" placeholder="Tu nombre" className="p-4 border border-slate-200 bg-slate-50 rounded-xl text-base text-slate-700 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all w-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-[0.85rem] font-semibold">Teléfono</label>
                    <input type="tel" placeholder="+1 234 567" className="p-4 border border-slate-200 bg-slate-50 rounded-xl text-base text-slate-700 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all w-full" />
                  </div>
                </div>

                <div className="relative flex flex-col gap-2 mb-8">
                  <label className="text-gray-500 text-[0.85rem] font-semibold">Especialidad de Interés</label>
                  <div className="relative w-full">
                    <select className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl text-base text-slate-700 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all appearance-none pr-12 cursor-pointer">
                      <option>Limpieza Dental</option>
                      <option>Ortodoncia</option>
                      <option>Implantes</option>
                      <option>Blanqueamiento</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-sky-900 text-white border-none p-4 rounded-xl text-base font-bold cursor-pointer mt-2 floating-btn-1">ENVIAR SOLICITUD</button>
                <div className="text-center text-[0.8rem] text-gray-500 mt-4">Nos pondremos en contacto contigo en menos de 2 horas.</div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
