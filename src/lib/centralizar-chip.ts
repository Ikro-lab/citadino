/**
 * Rola uma linha de chips (rolagem horizontal) até o chip ficar no centro.
 * Mexe só no scroll da linha — `scrollIntoView` também rolaria a página.
 */
export function centralizarChip(chip: HTMLElement | null | undefined) {
  const linha = chip?.parentElement;
  if (!chip || !linha) return;
  const c = chip.getBoundingClientRect();
  const l = linha.getBoundingClientRect();
  linha.scrollLeft += c.left - l.left - (l.width - c.width) / 2;
}
