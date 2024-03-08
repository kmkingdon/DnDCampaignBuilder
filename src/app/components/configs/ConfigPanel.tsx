import { useAppSelector } from "@/state/hook";
import { selectSelected } from "@/state/canvas.slice";
import Session from "./Session";
import CharacterPanel from "./character/CharacterPanel";



export default function ConfigPanel() {
    const selectedData = useAppSelector(selectSelected);

    if(selectedData === null){
      return null;
    } else {

      const {category} = selectedData;
      const isSession = category === 'session';
      // const isCharacter = category === 'character'

      if(isSession) {
        return <Session />
      }
      return <CharacterPanel/>
    }
  }