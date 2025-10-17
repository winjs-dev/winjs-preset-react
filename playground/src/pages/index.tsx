import Smileurl, { ReactComponent as SvgSmile } from '../../smile.svg';
import winjsJpeg from '../assets/winjs.jpeg';

export default function HomePage() {
  return (
    <div>
      <h2>Hi! Welcome to WinJS!</h2>
      <p>
        <img src={winjsJpeg} width="388" />
      </p>
      <p>
        <img src={Smileurl} alt="" />
        <SvgSmile />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
    </div>
  );
}
