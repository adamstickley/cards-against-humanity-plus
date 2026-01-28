import { library } from "@fortawesome/fontawesome-svg-core";
import { useCommonIcons } from "./icons";

export const useFontAwesomeIcons = () => {
  library.add(...useCommonIcons());
};
