import { useEffect, useState } from 'react';

export const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting) {
            setVisibleSections(prev => {
              if (prev.has(sectionId)) {
                return prev;
              }
              const newSet = new Set(prev);
              newSet.add(sectionId);
              return newSet;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return { visibleSections };
};

export const useStaggeredAnimation = (delay: number = 0.1) => {
  return {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * delay,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };
};
