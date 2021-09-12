import { css } from "@emotion/css";
import { Button, TextField } from "@material-ui/core";
import React from "react";
import { useDeviceType } from "../../theme/media";
import { spaceRem } from "../../theme/spacing";
import { makeCommonStyles } from "../styles";

interface Props {}

/**
 */
export const ContactPage = (_: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <main className={commonStyles.main}>
        <div className={styles.content}>
          <div>
            <h1>Send us a message</h1>
            <div>
              Get in touch with us by sending us a message here. Let us know
              your opinion about the Sonic Thames Project. We value your
              feedback, input, suggestions and of course you positive feedback.
            </div>
          </div>
          <form
            className={styles.form}
            action="mailto:contact@sonicthames.org.uk"
            encType="multipart/form-data"
          >
            <input type="hidden" name="subject" value="Send us your thoughts" />
            <div>
              <TextField
                fullWidth
                label="Name"
                margin="dense"
                name="name"
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="Email"
                margin="dense"
                name="email"
                type="email"
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="Message"
                name="body"
                margin="dense"
                minRows={3}
                multiline={true}
                variant="outlined"
              />
            </div>
            <div>
              <Button type="submit" variant="outlined">
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const styles = {
  content: css({
    display: "flex",
    marginTop: spaceRem("xl"),
    gap: spaceRem("l"),
    "> *": css({
      flex: "50%",
    }),
  }),
  form: css({
    display: "flex",
    flexDirection: "column",
    gap: spaceRem(),
  }),
};
