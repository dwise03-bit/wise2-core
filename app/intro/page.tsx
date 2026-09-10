const sparks = Array.from({ length: 18 }, (_, index) => index);
const formingSparks = Array.from({ length: 48 }, (_, index) => index);

export default function IntroPage() {
  return (
    <main className="intro" aria-label="WISE² introduction">
      <div className="intro-portal" aria-hidden="true" />
      <div className="intro-grain" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />

      <div className="intro-sparks" aria-hidden="true">
        {sparks.map((spark) => <i key={spark} style={{ "--spark": spark } as React.CSSProperties} />)}
      </div>

      <div className="intro-content">
        <p className="intro-kicker">A living system awakens</p>
        <div className="intro-mark" aria-label="WISE squared">
          <span className="intro-forming-sparks" aria-hidden="true">
            {formingSparks.map((spark) => <i key={spark} style={{ "--particle": spark } as React.CSSProperties} />)}
          </span>
          <span className="intro-mark-w">W</span><sup>2</sup>
        </div>
        <p className="intro-statement">Two minds. One vision.<br />Infinite possibility.</p>
        <a className="intro-enter" href="/">
          <span>Enter WISE²</span><b aria-hidden="true">↗</b>
        </a>
      </div>

      <p className="intro-caption">Strategy / Creative / Systems / Future</p>
      <a className="intro-skip" href="/">Skip intro</a>
    </main>
  );
}
