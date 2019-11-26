import { Position } from '../../position';
import { Token } from '../../token';

export function firstToken(
  ...tokens: (undefined | null | Token | (undefined | null | Token)[])[]
): Token | undefined {
  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (!Array.isArray(token)) {
      return token;
    }

    for (const t of token) {
      if (t) {
        return t;
      }
    }
  }

  return undefined;
}

export function lastToken(
  ...tokens: (undefined | null | Token | (undefined | null | Token)[])[]
): Token | undefined {
  for (let i = tokens.length - 1; i--; i > 0) {
    const token = tokens[i];
    if (!token) {
      continue;
    }

    if (!Array.isArray(token)) {
      return token;
    }

    for (let j = token.length - 1; j--; j < 0) {
      const t = token[j];
      if (t) {
        return t;
      }
    }
  }

  return undefined;
}

export function firstPosition(
  ...tokens: (undefined | null | Token | (undefined | null | Token)[])[]
): Position {
  return firstToken(...tokens)?.begin || [0, 0];
}
