import { Positions } from './positions.enum';

export const API_VERSION = `https://ddragon.leagueoflegends.com/api/versions.js`;

export const API_CHAMPION_LIST = (version) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/data/th_TH/champion.json`;

export const API_RUNE = (name: string, position: Positions) =>
  `https://th.op.gg/champion/ajax/statistics/runeList/championId=${name}&position=${position.toUpperCase()}`;
