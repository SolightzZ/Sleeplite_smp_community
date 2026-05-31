import { menu } from "../ui/main-menu.js";

export function RUNREPORT({ source }) {
  if (source && source.isValid) {
    menu(source);
  }
}
