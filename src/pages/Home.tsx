import { Button } from "primereact/button";
import { Card } from "primereact/card";
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
    const content = <p>Learn the different fretboard intervals and their shapes.</p>;

    return (
      <Card title="Intervals" header={header} footer={footer}>
        {content}
      </Card>
    );
  };

  return (
    <div className="home-container">
      BASSCORE Home Page
      <div className="offerings-cards">
        {metronomeCard()}
        {scalesCard()}
        {intervalsCard()}
      </div>
    </div>
  );
};
