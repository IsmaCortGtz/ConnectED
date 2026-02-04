export const animationConfig = {
  // Contenedor principal
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.08,
      },
    },
  },

  // Header - animación original más invasiva
  header: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        damping: 15,
        stiffness: 100,
      },
    },
    exit: {
      x: '-60vw',
      y: '-60vh',
      transition: {
        duration: 0.6,
        ease: 'easeIn' as const,
      },
    },
  },

  // Overlay sheet that will slide diagonally on exit (thin rotated strip)
  overlay: {
    // start offscreen bottom-right
    hidden: { x: '120vw', y: '120vh' },
    // while mounted keep offscreen (so header is visible during loading)
    visible: { x: '120vw', y: '120vh' },
    // on exit slide across to offscreen top-left (diagonal wipe)
    exit: {
      x: '-120vw',
      y: '-120vh',
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
  },

  // Título - sutil
  title: {
    hidden: { x: -15, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.25,
        type: "tween" as const,
        ease: "easeOut" as const,
      },
    },
  },

  // Descripción - muy sutil
  description: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  },

  // Inputs - sutil
  input: {
    hidden: { y: 8, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut" as const,
      },
    },
  },

  // Input label - muy sutil
  inputLabel: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  },

  // Input field - muy sutil
  inputField: {
    hidden: { scale: 0.98 },
    visible: {
      scale: 1,
      transition: {
        duration: 0.15,
      },
    },
  },

  // Botón - sutil
  button: {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.25,
        type: "tween" as const,
        ease: "easeOut" as const,
      },
    },
    hover: {
      scale: 1.01,
      transition: { duration: 0.15 },
    },
    tap: {
      scale: 0.99,
      transition: { duration: 0.1 },
    },
  },

  // Link de registro - muy sutil
  link: {
    hidden: { opacity: 0, y: 3 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      x: 2,
      transition: { duration: 0.15 },
    },
  },

  // Efectos de interacción del botón
  buttonInteraction: {
    hover: {
      y: -1,
      transition: { duration: 0.15 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  },

  // Delays para labels e inputs
  delays: {
    emailLabel: 0.12,
    emailField: 0.15,
    passwordLabel: 0.16,
    passwordField: 0.19,
  },
};
