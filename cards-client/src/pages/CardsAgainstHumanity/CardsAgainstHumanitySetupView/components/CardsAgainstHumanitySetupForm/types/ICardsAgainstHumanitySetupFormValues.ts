import { IGameSettings } from "./IGameSettings";
import { GameMode } from "./GameMode";
import { PackMode } from "./PackMode";
import { PackSortOptions } from "./PackSortOptions";

export interface ICardsAgainstHumanitySetupFormValues extends IGameSettings {
  gameMode: GameMode;
  packMode: PackMode;
  "packSettings.basePack": number;
  "packSettings.sortBy": PackSortOptions;
  "packSettings.selectedPacks": number[];
  "packSettings.filter": string;
}
