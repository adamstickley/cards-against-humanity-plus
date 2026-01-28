import {
  faBlockQuestion,
  faCardClub,
  faCardDiamond,
  faCardHeart,
  faCards,
  faCardsBlank,
  faCardSpade,
  faClub,
  faDiamond,
  faDice,
  faDiceD10,
  faDiceD12,
  faDiceD20,
  faDiceD4,
  faDiceD6,
  faDiceD8,
  faGameBoard,
  faGamepadModern,
  faHeart,
  faPuzzle,
  faPuzzlePiece,
  faRing,
  faScroll,
  faSpade,
  faTreasureChest,
} from "@fortawesome/pro-solid-svg-icons";

export const useGameIcons = () => {
  const playingCards = [faCardClub, faCardDiamond, faCardHeart, faCardSpade];
  const playingCardType = [faClub, faDiamond, faHeart, faSpade];
  const genericCards = [faCards, faCardsBlank];
  const dice = [
    faDice,
    faDiceD4,
    faDiceD6,
    faDiceD8,
    faDiceD10,
    faDiceD12,
    faDiceD20,
  ];
  const gamePieces = [faGameBoard, faGamepadModern, faPuzzle, faPuzzlePiece];
  const gameProps = [faScroll, faRing, faTreasureChest, faBlockQuestion];

  return [
    ...playingCards,
    ...playingCardType,
    ...genericCards,
    ...dice,
    ...gamePieces,
    ...gameProps,
  ];
};
