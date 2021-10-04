import { css } from "@emotion/css";
import React from "react";
import { Link } from "react-router-dom";
import { useDeviceType } from "../../theme/media";
import { spacingRem } from "../../theme/spacing";
import { PageHeader } from "../common/Header";
import { makeCommonStyles } from "../styles";

interface Props {}

/**
 */
export const AboutPage = (_: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main}>
        <div className={styles.content}>
          <h1>About</h1>
          <p>
            Sonic Thames has been Inspired by exploring the river upstream at
            the height of the pandemic.
          </p>
          <p>
            To be there, grab the whole moment and place it here – for you, all
            world to see.
          </p>
          <h4>{`Binaural 3D (use headphones)`}</h4>
          <p>
            {`Recording technique that offers a more natural and realistic sound
            experience when listened via headphones. It provides a sense of
            multidirectional perception as it happens in the real world.`}
          </p>
          <p>
            {`You have the feeling of being in the same space as the actual
            location, listening to the sounds coming from different directions,
            even from behind. Binaural allows for a better perception of space,
            precisely like being in there!`}
          </p>
          <p>
            Presented in three categories, the works are accessible online via
            an interactive map.
          </p>
          <p>
            {`Listen – This category is comprised of sound and image recorded at
            the same time, continually in a fixed position in space. The editing
            is kept to a bare minimum to represent the source faithfully.`}
          </p>
          <p>
            {`See - Sound and video could be recorded in different directions in a
            broader area, allowing the place to be represented in different
            directions or with more details for an improved sense of place. Some
            editing of the materials can be performed to compose the soundscape
            of the location.`}
          </p>
          <p>
            {`Feel - The third category is more dynamic than the ones above since
            they were recorded moving along a stretch of the riverside. Two
            different pieces are being produced that fit this category, a sound
            walk and a sound cycle. The result is an immersive experience with
            both the work you can see and hear and how it is experienced in one
            location.`}
          </p>
          <p>
            {`All work produced is being placed online at `}
            <Link to="/">sonicthames.org.uk</Link>
            {` and our `}
            <a href="https://www.youtube.com/channel/UCqkDGMVIu4slWH1z90XIdyQ">
              YouTube channel
            </a>
            {`. Two main uses can be derived from these platforms. On one side, the
            virtual visit and exploration from anywhere in the world. On the
            other side, the work can be accessed in person at the original
            recording location. This can be done directly by travelling to the
            designated areas and accessing the content via our interactive map
            or the YouTube channel.`}
          </p>
          <p>
            {`For the soundcycling, it is recommended that the mobile phone is
            placed on support when cycling. Since health and safety is an
            essential aspect of facilitating sound walks. A link for an online
            purchase will be suggested. The use of the phone holder reduces the
            risk of injuries derived by cycling with one hand on the handlebar.`}
          </p>
        </div>
      </main>
    </div>
  );
};

const styles = {
  content: css({
    marginTop: spacingRem("xl"),
    gap: spacingRem("l"),
  }),
};
