import type { Challenge, Response } from '../../engine/types';
import { Choice, Picture } from './Choice';
import { Hotspot } from './Hotspot';
import { Match } from './Match';
import { Sequence } from './Sequence';
import { Sort } from './Sort';
import { Spot } from './Spot';

interface Props {
  challenge: Challenge;
  response: Response;
  onChange: (r: Response) => void;
  revealed: boolean;
  seed: string;
}

/** Routes a challenge to its component. Add new challenge types here. */
export function ChallengeView({ challenge: c, response: r, onChange, revealed, seed }: Props) {
  const common = { onChange, revealed, seed } as const;
  switch (c.type) {
    case 'choice':
      return <Choice challenge={c} response={r as Extract<Response, { type: 'choice' }>} {...common} />;
    case 'picture':
      return <Picture challenge={c} response={r as Extract<Response, { type: 'picture' }>} {...common} />;
    case 'match':
      return <Match challenge={c} response={r as Extract<Response, { type: 'match' }>} {...common} />;
    case 'sequence':
      return <Sequence challenge={c} response={r as Extract<Response, { type: 'sequence' }>} {...common} />;
    case 'sort':
      return <Sort challenge={c} response={r as Extract<Response, { type: 'sort' }>} {...common} />;
    case 'hotspot':
      return <Hotspot challenge={c} response={r as Extract<Response, { type: 'hotspot' }>} {...common} />;
    case 'spot':
      return <Spot challenge={c} response={r as Extract<Response, { type: 'spot' }>} {...common} />;
  }
}
