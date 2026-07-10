import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassCursor } from './components/GlassCursor'
import { AboutSection } from './components/AboutSection'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { IntroSplash } from './components/IntroSplash'
import { NameMarquee } from './components/NameMarquee'
import { Navbar } from './components/Navbar'
import { TaglineDivider } from './components/TaglineDivider'
import {
  fadeDown,
  fadeUp,
  staggerContainer,
} from './lib/motion'
import styles from './App.module.css'

function App() {
  const [showContent, setShowContent] = useState(false)

  return (
    <div className={styles.app}>
      <GlassCursor />
      <AnimatePresence mode="wait">
        {!showContent ? (
          <IntroSplash key="splash" onComplete={() => setShowContent(true)} />
        ) : (
          <motion.main
            key="content"
            className={styles.main}
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.14)}
          >
            <motion.div variants={fadeDown} className={styles.heroWrap}>
              <Navbar />
              <Hero />
            </motion.div>

            <motion.div variants={fadeUp}>
              <TaglineDivider />
            </motion.div>

            <motion.div variants={fadeUp}>
              <AboutSection />
            </motion.div>

            <motion.div variants={fadeUp}>
              <NameMarquee />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Footer />
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
