import { create } from "zustand";

const STORAGE_KEY = "talkstream-theme";
const DEFAULT_THEME = "dark";

export const THEMES = [
  "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro",
  "cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel",
  "fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business",
  "acid","lemonade","night","coffee","winter","dim","nord","sunset",
];

export const THEME_META = {
  light:     { label:"Light",     emoji:"☀️",  dark:false },
  dark:      { label:"Dark",      emoji:"🌙",  dark:true  },
  cupcake:   { label:"Cupcake",   emoji:"🧁",  dark:false },
  bumblebee: { label:"Bumblebee", emoji:"🐝",  dark:false },
  emerald:   { label:"Emerald",   emoji:"💚",  dark:false },
  corporate: { label:"Corporate", emoji:"🏢",  dark:false },
  synthwave: { label:"Synthwave", emoji:"🌆",  dark:true  },
  retro:     { label:"Retro",     emoji:"📺",  dark:false },
  cyberpunk: { label:"Cyberpunk", emoji:"🤖",  dark:false },
  valentine: { label:"Valentine", emoji:"💖",  dark:false },
  halloween: { label:"Halloween", emoji:"🎃",  dark:true  },
  garden:    { label:"Garden",    emoji:"🌸",  dark:false },
  forest:    { label:"Forest",    emoji:"🌲",  dark:true  },
  aqua:      { label:"Aqua",      emoji:"💧",  dark:true  },
  lofi:      { label:"Lo-Fi",     emoji:"🎵",  dark:false },
  pastel:    { label:"Pastel",    emoji:"🎨",  dark:false },
  fantasy:   { label:"Fantasy",   emoji:"🧝",  dark:false },
  wireframe: { label:"Wireframe", emoji:"📐",  dark:false },
  black:     { label:"Black",     emoji:"🖤",  dark:true  },
  luxury:    { label:"Luxury",    emoji:"👑",  dark:true  },
  dracula:   { label:"Dracula",   emoji:"🧛",  dark:true  },
  cmyk:      { label:"CMYK",      emoji:"🖨️",  dark:false },
  autumn:    { label:"Autumn",    emoji:"🍂",  dark:false },
  business:  { label:"Business",  emoji:"💼",  dark:true  },
  acid:      { label:"Acid",      emoji:"🧪",  dark:false },
  lemonade:  { label:"Lemonade",  emoji:"🍋",  dark:false },
  night:     { label:"Night",     emoji:"🌃",  dark:true  },
  coffee:    { label:"Coffee",    emoji:"☕",  dark:true  },
  winter:    { label:"Winter",    emoji:"❄️",  dark:false },
  dim:       { label:"Dim",       emoji:"🔅",  dark:true  },
  nord:      { label:"Nord",      emoji:"🏔️",  dark:false },
  sunset:    { label:"Sunset",    emoji:"🌅",  dark:false },
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
};

const savedTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
applyTheme(savedTheme);

export const useThemeStore = create((set) => ({
  theme: savedTheme,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
