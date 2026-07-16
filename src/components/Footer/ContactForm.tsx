import { useState, type FormEvent, type RefObject } from 'react'
import { motion } from 'framer-motion'
import { WEB3FORMS_ACCESS_KEY } from './constants'
import styles from './Footer.module.css'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

const springBounce = { type: 'spring' as const, stiffness: 420, damping: 14 }

type ContactFormProps = {
  nameInputRef?: RefObject<HTMLInputElement | null>
}

export function ContactForm({ nameInputRef }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus('error')
      setErrorMessage('Could not send message. Please try again later.')
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          subject: 'New message from MIRVÉ portfolio',
        }),
      })

      const result = (await response.json()) as { success?: boolean; message?: string }

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'Something went wrong.')
      }

      setStatus('success')
      form.reset()
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not send message.',
      )
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <motion.div
        className={styles.field}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ ...springBounce, delay: 0.05 }}
      >
        <label htmlFor="contact-name" className={styles.label}>
          Name
        </label>
        <input
          ref={nameInputRef}
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={styles.input}
          placeholder="Your name"
        />
      </motion.div>

      <motion.div
        className={styles.field}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ ...springBounce, delay: 0.1 }}
      >
        <label htmlFor="contact-email" className={styles.label}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={styles.input}
          placeholder="you@email.com"
        />
      </motion.div>

      <motion.div
        className={styles.field}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ ...springBounce, delay: 0.15 }}
      >
        <label htmlFor="contact-message" className={styles.label}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          className={styles.textarea}
          placeholder="Tell me about your project…"
        />
      </motion.div>

      <motion.button
        type="submit"
        className={styles.submit}
        disabled={status === 'sending'}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={springBounce}
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </motion.button>

      {status === 'success' && (
        <motion.p
          className={styles.formFeedback}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springBounce}
          role="status"
        >
          Message sent — I&apos;ll get back to you soon.
        </motion.p>
      )}

      {status === 'error' && (
        <motion.p
          className={`${styles.formFeedback} ${styles.formError}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springBounce}
          role="alert"
        >
          {errorMessage}
        </motion.p>
      )}
    </form>
  )
}
