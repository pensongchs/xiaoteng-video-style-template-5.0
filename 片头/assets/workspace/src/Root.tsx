import {Composition} from "remotion";
import {Opening} from "./Opening";
import {openingConfig} from "./openingConfig";
import {EpisodeOpening} from "./EpisodeOpening";
import {episodeOpeningConfig} from "./episodeOpeningConfig";

export const RemotionRoot = () => {
  return (<>
    <Composition
      id="Opening"
      component={Opening}
      durationInFrames={openingConfig.durationInFrames}
      fps={openingConfig.fps}
      width={1920}
      height={1080}
    />
    <Composition id="EpisodeOpening" component={EpisodeOpening} durationInFrames={episodeOpeningConfig.durationInFrames} fps={50} width={1920} height={1080}/>
  </>);
};
