export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "es";

export interface IDictionary {
  nav: { how: string; modes: string; download: string };
  hero: { tagline: string; title: string; subtitle: string; cta: string; secondary: string };
  how: {
    title: string;
    steps: { title: string; text: string }[];
    exampleTitle: string;
    secret: string;
    guess: string;
    result: string;
    pico: string;
    pala: string;
  };
  modes: {
    title: string;
    items: { name: string; text: string; badge?: string }[];
  };
  features: { title: string; items: { title: string; text: string }[] };
  waitlist: {
    title: string;
    text: string;
    placeholder: string;
    button: string;
    sending: string;
    success: string;
    error: string;
  };
  footer: { madeBy: string };
}

export const dictionaries: Record<Locale, IDictionary> = {
  es: {
    nav: { how: "Cómo se juega", modes: "Modos", download: "Descargar" },
    hero: {
      tagline: "Descifra el código",
      title: "Pico & Pala",
      subtitle:
        "El juego de deducción de números para dos jugadores. Adivina el número secreto de tu rival antes de que él adivine el tuyo.",
      cta: "Únete a la lista de espera",
      secondary: "Ver cómo se juega",
    },
    how: {
      title: "Cómo se juega",
      steps: [
        { title: "Elige tu número", text: "4 dígitos del 1 al 9, sin repetir." },
        { title: "Adivina", text: "Cada turno intentas descifrar el número de tu rival." },
        { title: "Lee las pistas", text: "Los Picos y las Palas te dicen qué tan cerca estás." },
        { title: "Gana con 4 Picos", text: "Tienes hasta 12 turnos para lograrlo." },
      ],
      exampleTitle: "Ejemplo",
      secret: "Secreto",
      guess: "Intento",
      result: "Resultado",
      pico: "Pico: dígito correcto en su posición",
      pala: "Pala: dígito correcto en otra posición",
    },
    modes: {
      title: "Tres formas de jugar",
      items: [
        { name: "Versus IA", text: "Juega sin conexión contra el bot en tres dificultades." },
        { name: "Sala privada", text: "Crea una sala con código y reta a un amigo.", badge: "Próximamente" },
        { name: "Sala global", text: "Enfréntate a jugadores de todo el mundo y sube en el ranking.", badge: "Próximamente" },
      ],
    },
    features: {
      title: "Hecho para jugar rápido",
      items: [
        { title: "Partidas de minutos", text: "Ideal para un rato libre." },
        { title: "Sin conexión", text: "Juega contra la IA donde estés." },
        { title: "Multilenguaje", text: "Disponible en español, inglés, portugués y francés." },
        { title: "Estadísticas", text: "Sigue tu progreso y tus rachas." },
      ],
    },
    waitlist: {
      title: "Sé de los primeros en jugar",
      text: "Déjanos tu correo y te avisamos cuando Pico & Pala salga en las tiendas.",
      placeholder: "tu@correo.com",
      button: "Avisarme",
      sending: "Enviando...",
      success: "¡Listo! Te avisaremos pronto.",
      error: "No pudimos registrarte. Inténtalo de nuevo.",
    },
    footer: { madeBy: "Hecho con amor por Auron Tale Games" },
  },
  en: {
    nav: { how: "How to play", modes: "Modes", download: "Download" },
    hero: {
      tagline: "Crack the code",
      title: "Pico & Pala",
      subtitle:
        "The two-player number deduction game. Guess your rival's secret number before they guess yours.",
      cta: "Join the waitlist",
      secondary: "See how to play",
    },
    how: {
      title: "How to play",
      steps: [
        { title: "Pick your number", text: "4 digits from 1 to 9, no repeats." },
        { title: "Guess", text: "Each turn you try to crack your rival's number." },
        { title: "Read the clues", text: "Picos and Palas tell you how close you are." },
        { title: "Win with 4 Picos", text: "You have up to 12 turns to do it." },
      ],
      exampleTitle: "Example",
      secret: "Secret",
      guess: "Guess",
      result: "Result",
      pico: "Pico: correct digit in the correct position",
      pala: "Pala: correct digit in another position",
    },
    modes: {
      title: "Three ways to play",
      items: [
        { name: "Versus AI", text: "Play offline against the bot on three difficulty levels." },
        { name: "Private room", text: "Create a room with a code and challenge a friend.", badge: "Coming soon" },
        { name: "Global room", text: "Face players from around the world and climb the ranking.", badge: "Coming soon" },
      ],
    },
    features: {
      title: "Built for quick games",
      items: [
        { title: "Minutes-long matches", text: "Perfect for a spare moment." },
        { title: "Offline", text: "Play against the AI anywhere." },
        { title: "Multilingual", text: "Available in Spanish, English, Portuguese and French." },
        { title: "Stats", text: "Track your progress and streaks." },
      ],
    },
    waitlist: {
      title: "Be among the first to play",
      text: "Leave your email and we'll let you know when Pico & Pala hits the stores.",
      placeholder: "you@email.com",
      button: "Notify me",
      sending: "Sending...",
      success: "Done! We'll be in touch soon.",
      error: "We couldn't sign you up. Please try again.",
    },
    footer: { madeBy: "Made with love by Auron Tale Games" },
  },
};
