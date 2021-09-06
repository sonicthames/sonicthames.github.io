import { Button, Input, InputLabel, TextareaAutosize } from "@material-ui/core";
import React from "react";
import { Header } from "../common/Header";
import { commonStyles } from "../styles";

interface Props {}

/**
 * This is the Sound's technical sheet
 */
export const ContactPage = (_: Props) => (
  <div className={commonStyles.page}>
    <Header />
    <article className={commonStyles.article}>
      <div>
        <InputLabel htmlFor="name">Name</InputLabel>
        <Input id="name" />
      </div>
      <div>
        <InputLabel htmlFor="email">Email</InputLabel>
        <Input id="email" type="email" />
      </div>
      <div>
        <InputLabel htmlFor="message">Message</InputLabel>
        <TextareaAutosize name="message" />
      </div>
      <div>
        <Button color="secondary">Submit</Button>
      </div>
    </article>
  </div>
);
