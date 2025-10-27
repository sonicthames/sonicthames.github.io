import { useId } from "react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { makeCommonStyles } from "../styles"

export const ContactPage = () => {
  const deviceType = useDeviceType()
  const commonStyles = makeCommonStyles(deviceType)
  const uid = useId()
  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main} style={commonStyles.mainStyle}>
        <div
          className={cn(
            "flex mt-12 gap-6",
            deviceType === "mobile" ? "flex-col" : "flex-row [&>*]:flex-[50%]",
          )}
        >
          <div>
            <h1 className="text-2xl font-bold mb-4">Send us a message</h1>
            <div>
              Get in touch with us by sending us a message here. Let us know
              your opinion about the Sonic Thames Project. We value your
              feedback, input, suggestions and of course you positive feedback.
            </div>
          </div>
          <form
            className="flex flex-col gap-4"
            action="mailto:sonicthames@gmail.com"
            encType="multipart/form-data"
          >
            <input type="hidden" name="subject" value="Send us your thoughts" />
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id={`name-${uid}`}
                type="text"
                name="name"
                className="w-full px-3 py-2 border border-border rounded-md bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id={`email-${uid}`}
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-border rounded-md bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id={`body-${uid}`}
                name="body"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-accent"
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
