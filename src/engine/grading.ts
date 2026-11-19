import type { Challenge, Grade, Response } from './types';

export function emptyResponse(c: Challenge): Response {
  switch (c.type) {
    case 'choice':
    case 'picture':
    case 'hotspot':
      return { type: c.type, selected: null };
    case 'sequence':
      return { type: 'sequence', order: [] };
    case 'sort':
      return { type: 'sort', assign: {} };
    case 'spot':
      return { type: 'spot', selected: [] };
    case 'match':
      return { type: 'match', matched: [], wrong: 0 };
  }
}

/** Whether the learner has given enough of an answer to check it. */
export function isReady(c: Challenge, r: Response): boolean {
  if (c.type !== r.type) return false;
  switch (r.type) {
    case 'choice':
    case 'picture':
    case 'hotspot':
      return r.selected !== null;
    case 'sequence':
      return c.type === 'sequence' && r.order.length === c.steps.length;
    case 'sort':
      return c.type === 'sort' && c.items.every((i) => r.assign[i.id]);
    case 'spot':
      return r.selected.length > 0;
    case 'match':
      return c.type === 'match' && r.matched.length === c.pairs.length;
  }
}

/**
 * Match challenges can only finish once every pair is found, so they are
 * graded on whether any wrong pairing happened along the way. They are not
 * re-queued, because the learner has already worked out the answer.
 */
export function isRequeueable(c: Challenge): boolean {
  return c.type !== 'match';
}

export function grade(c: Challenge, r: Response): Grade {
  if (c.type !== r.type) throw new Error(`Response type ${r.type} does not match challenge ${c.type}`);

  switch (c.type) {
    case 'choice': {
      const sel = (r as Extract<Response, { type: 'choice' }>).selected;
      const correct = sel === c.answer;
      const opt = c.options.find((o) => o.id === sel);
      return { correct, note: correct ? undefined : opt?.why };
    }
    case 'picture': {
      const sel = (r as Extract<Response, { type: 'picture' }>).selected;
      const correct = sel === c.answer;
      const picked = c.options.find((o) => o.id === sel);
      return { correct, note: correct || !picked ? undefined : `That one is a ${picked.label.toLowerCase()}.` };
    }
    case 'hotspot': {
      const sel = (r as Extract<Response, { type: 'hotspot' }>).selected;
      const correct = sel === c.answer;
      const picked = c.regions.find((g) => g.id === sel);
      return { correct, note: correct || !picked ? undefined : `You tapped the ${picked.label.toLowerCase()}.` };
    }
    case 'sequence': {
      const order = (r as Extract<Response, { type: 'sequence' }>).order;
      const correct = order.length === c.steps.length && order.every((id, i) => id === c.steps[i].id);
      return { correct };
    }
    case 'sort': {
      const assign = (r as Extract<Response, { type: 'sort' }>).assign;
      const wrong = c.items.filter((i) => assign[i.id] !== i.bucket);
      return {
        correct: wrong.length === 0,
        note: wrong.length ? `${wrong.length} of ${c.items.length} landed in the wrong group.` : undefined,
      };
    }
    case 'spot': {
      const sel = new Set((r as Extract<Response, { type: 'spot' }>).selected);
      const wrongLines = c.lines.filter((l) => l.wrong);
      const missed = wrongLines.filter((l) => !sel.has(l.id)).length;
      const falseFlags = c.lines.filter((l) => !l.wrong && sel.has(l.id)).length;
      const correct = missed === 0 && falseFlags === 0;
      const parts: string[] = [];
      if (missed) parts.push(`missed ${missed}`);
      if (falseFlags) parts.push(`flagged ${falseFlags} that ${falseFlags === 1 ? 'was' : 'were'} fine`);
      return { correct, note: correct ? undefined : `You ${parts.join(' and ')}.` };
    }
    case 'match': {
      const wrong = (r as Extract<Response, { type: 'match' }>).wrong;
      return {
        correct: wrong === 0,
        note: wrong ? `${wrong} mismatched ${wrong === 1 ? 'try' : 'tries'} on the way there.` : undefined,
      };
    }
  }
}
