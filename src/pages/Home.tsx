import { Button } from "primereact/button";
import { Card } from "primereact/card";
import BCTooltip from "../components/BCTooltip";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const nav = useNavigate();
  const getStartedBtn = (url: string): JSX.Element => (
    <Button label="Get Started" onClick={() => nav(url)} />
  );
  const metronomeCard = () => {
    const header = <img src="images/metronome-image.png" />;
    const content = (
      <p>
        Practice your rhythm by choosing your own subdivision and beats per
        minute
      </p>
    );

    return (
      <Card title="Metronome" header={header} footer={getStartedBtn('/metronome')}>
        {content}
      </Card>
    );
  };

  const scalesCard = () => {
    const header = <img src="images/scale-image.png" />;
    const content = (
      <p>Learn your different scale modes applied to the fretboard.</p>
    );

    return (
      <Card title="Scales" header={header} footer={getStartedBtn('/scales')}>
        {content}
      </Card>
    );
  };

  const intervalsCard = () => {
    const header = <img src="images/interval-image.png" />;
    const content = (
      <p>Learn the different fretboard intervals and their shapes.</p>
    );

    return (
      <Card title="Intervals" header={header} footer={getStartedBtn('/intervals')}>
        {content}
      </Card>
    );
  };

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Don't be a baby, learn bass guitar with BASSCORE
          </h1>
          <div className="hero-subtitle">
            <p>
              Join these famous bassists who also got gud with BASSCORE:{' '}
              <BCTooltip target=".jaco" content="Definitely a lie but he for sure would have." mouseTrack mouseTrackLeft={10} />
              <span className="underline jaco">Jaco Pastorius</span>,{' '}
              <BCTooltip target=".flea" content="Also a lie. Honestly he probably wouldn't." mouseTrack mouseTrackLeft={10} />
              <span className="underline flea">Flea</span>,{' '}
              and{' '}
              <BCTooltip target=".cassen" content="Not famous but he made this thing." mouseTrack mouseTrackLeft={10} />
              <span className="underline cassen">Cassen Gerber</span>
            </p>
          </div>
        </div>
      </section>
      <section className="offerings-cards">
        {metronomeCard()}
        {scalesCard()}
        {intervalsCard()}
      </section>
    </div>
  );
};
