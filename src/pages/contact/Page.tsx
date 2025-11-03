import { useId } from "react"
import { Button } from "@/components/ui"
import {
  contactLayout,
  contactLayoutVariants,
  form,
  formInput,
  formLabel,
  formTitle,
} from "@/ui/components/contact.css"
import { pageMain, pageMainVariants, pageRoot } from "@/ui/components/page.css"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"

export const ContactPage = () => {
  const deviceType = useDeviceType()
  const uid = useId()
  return (
    <div className={pageRoot}>
      <PageHeader />
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <div
          className={`${contactLayout} ${contactLayoutVariants[deviceType]}`}
        >
          <div>
            <h1 className={formTitle}>Send us a message</h1>
            <div>
              Get in touch with us by sending us a message here. Let us know
              your opinion about the Sonic Thames Project. We value your
              feedback, input, suggestions and of course you positive feedback.
            </div>
          </div>
          <form
            className={form}
            action="mailto:sonicthames@gmail.com"
            encType="multipart/form-data"
          >
            <input type="hidden" name="subject" value="Send us your thoughts" />
            <div>
              <label htmlFor="name" className={formLabel}>
                Name
              </label>
              <input
                id={`name-${uid}`}
                type="text"
                name="name"
                className={formInput}
              />
            </div>
            <div>
              <label htmlFor="email" className={formLabel}>
                Email
              </label>
              <input
                id={`email-${uid}`}
                type="email"
                name="email"
                className={formInput}
              />
            </div>
            <div>
              <label htmlFor="body" className={formLabel}>
                Message
              </label>
              <textarea
                id={`body-${uid}`}
                name="body"
                rows={3}
                className={formInput}
              />
            </div>
            <div>
              <Button type="submit" variant="ghost">
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
