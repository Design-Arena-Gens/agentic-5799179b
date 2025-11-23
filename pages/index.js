import Head from "next/head";
import StoryExperience from "@/components/StoryExperience";

export default function Home() {
  return (
    <>
      <Head>
        <title>Room 213 — Midnight Guest</title>
        <meta
          name="description"
          content="Immerse yourself in a one-minute 2D horror animation of hotel room 213 with narration in chilling first person."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <header>
          <p className="tagline">2D HORROR EXPERIENCE</p>
          <h1>Room 213: Midnight Guest</h1>
          <p>
            A cinematic, first-person horror short crafted for a 9:16 frame. Press play, listen to the human-like narration,
            and let the room follow you home.
          </p>
        </header>
        <StoryExperience />
        <footer>
          <p>Built for vertical playback · 60 seconds · Original script &amp; sound design</p>
        </footer>
      </main>
      <style jsx>{`
        main {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 2.5rem 1.5rem 4rem;
        }

        header {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .tagline {
          letter-spacing: 0.4em;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: rgba(255, 150, 190, 0.65);
          margin-bottom: 0.75rem;
        }

        h1 {
          margin: 0;
          font-size: clamp(2.5rem, 5vw, 3.7rem);
          line-height: 1.08;
          text-shadow: 0 12px 30px rgba(255, 60, 130, 0.22);
        }

        header p {
          margin: 1rem auto 0;
          max-width: 540px;
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(235, 230, 255, 0.78);
        }

        footer {
          margin-top: auto;
          text-align: center;
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(200, 180, 220, 0.35);
        }

        @media (max-width: 600px) {
          main {
            padding: 1.8rem 1.2rem 3rem;
          }
        }
      `}</style>
    </>
  );
}
