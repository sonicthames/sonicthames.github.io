import { link } from "@theme/recipes/link.css"
import { text } from "@theme/recipes/text.css"
import type { SubmitEvent } from "react"
import { useId, useState } from "react"
import { H1 } from "@/components/Typography"
import { Button } from "@/components/ui"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { pageMain, pageMainVariants, pageRoot } from "../common/layout.css"
import { contactLayout, form, formInput, formLabel } from "./Page.css"

const CONTACT_EMAIL = "sonicthames@gmail.com"
const SUBJECT = "Send us your thoughts"

const field = (data: FormData, name: string) => {
  const value = data.get(name)
  return typeof value === "string" ? value.trim() : ""
}

// A mailto: form submission only carries subject and body, so the name and
// email have to be written into the body.
const composeMailto = (data: FormData) => {
  const body = `${field(data, "message")}\n\nFrom: ${field(data, "name")} <${field(data, "email")}>`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`
}

export const ContactPage = () => {
  const deviceType = useDeviceType()
  const uid = useId()
  const [mailto, setMailto] = useState<string | null>(null)

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const href = composeMailto(new FormData(event.currentTarget))
    setMailto(href)
    window.location.href = href
  }

  return (
    <div className={pageRoot}>
      <PageHeader />
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <div className={contactLayout}>
          <div>
            <H1>Send us a message</H1>
            <p className={text.body}>
              Get in touch with us by sending us a message here. Let us know
              your opinion about the Sonic Thames Project. We value your
              feedback, input, suggestions and of course your positive feedback.
            </p>
          </div>
          <form className={form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor={`name-${uid}`} className={formLabel}>
                Name
              </label>
              <input
                id={`name-${uid}`}
                type="text"
                name="name"
                autoComplete="name"
                required
                className={formInput}
              />
            </div>
            <div>
              <label htmlFor={`email-${uid}`} className={formLabel}>
                Email
              </label>
              <input
                id={`email-${uid}`}
                type="email"
                name="email"
                autoComplete="email"
                required
                className={formInput}
              />
            </div>
            <div>
              <label htmlFor={`body-${uid}`} className={formLabel}>
                Message
              </label>
              <textarea
                id={`body-${uid}`}
                name="message"
                rows={3}
                required
                className={formInput}
              />
            </div>
            <div>
              <Button type="submit" tone="cta">
                Send Message
              </Button>
            </div>
            <p role="status" className={text.body}>
              {mailto === null ? null : (
                <>
                  Your email app should open with the message. If it does not,{" "}
                  <a href={mailto} className={link()}>
                    open the message here
                  </a>{" "}
                  or write to {CONTACT_EMAIL}.
                </>
              )}
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
