import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const nav = useNavigate();
  const metronomeCard = () => {
    const header = <img src="images/metronome-image.png" />;
    const footer = (
      <Button label="Get Started" onClick={() => nav("/metronome")} />
    );
    const content = (
      <p>
        Practice your rhythm by choosing your own subdivision and beats per
        minute
      </p>
    );

    return (
      <Card title="Metronome" header={header} footer={footer}>
        {content}
      </Card>
    );
  };

  const scalesCard = () => {
    const header = <img src="images/scale-image.png" />;
    const footer = (
      <Button label="Get Started" onClick={() => nav("/scales")} />
    );
    const content = (
      <p>Learn your different scale modes applied to the fretboard.</p>
    );

    return (
      <Card title="Scales" header={header} footer={footer}>
        {content}
      </Card>
    );
  };

  const intervalsCard = () => {
    const header = <img src="images/interval-image.png" />;
    const footer = (
      <Button label="Get Started" onClick={() => nav("/intervals")} />
    );
    const content = (
      <p>Learn the different fretboard intervals and their shapes.</p>
    );

    return (
      <Card title="Intervals" header={header} footer={footer}>
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
            <p className="hero-subtitle-text">
              Join these famous bassists who also got gud with BASSCORE:
            </p>
            <ul className="hero-list">
              <li>
                <Tooltip
                  target=".jaco"
                  content="Definitely a lie but he for sure would have."
                  mouseTrack
                  mouseTrackLeft={10}
                />
                <p className="underline jaco">Jaco Pastorius,</p>
              </li>
              <li>
                <Tooltip
                  target=".flea"
                  content="Also a lie. Honestly he probably wouldn't."
                  mouseTrack
                  mouseTrackLeft={10}
                />
                <p className="underline flea">Flea,</p>
              </li>
              <li>
                <span className='li-one-line'>
                  <p>and&nbsp;</p>
                  <Tooltip
                    target=".cassen"
                    content="Not famous but he made this thing."
                    mouseTrack
                    mouseTrackLeft={10}
                  />
                  <p className="underline cassen">Cassen Gerber</p>
                </span>
              </li>
            </ul>
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
