import {
  faFire,
  faFloppyDisk,
  faHandSparkles,
  faHandWave,
  faHome,
  faRocketLaunch,
  faSearch,
} from "@fortawesome/pro-solid-svg-icons";
import { faStar } from "@fortawesome/pro-regular-svg-icons";

export const useCommonIcons = () => {
  const uiIcons = [faHome, faFloppyDisk, faSearch];
  const handIcons = [faHandSparkles, faHandWave];
  const funIcons = [faFire, faRocketLaunch, faStar];
  return [...uiIcons, ...handIcons, ...funIcons];
};
