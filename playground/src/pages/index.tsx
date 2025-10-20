import Smileurl, { ReactComponent as SvgSmile } from '../../smile.svg';
import winjsJpeg from '../assets/winjs.jpeg';

export default function HomePage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  return (
    <div>
      <h2>Hi! Welcome to WinJS!</h2>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <p>
        <img src={winjsJpeg} width="388" />
      </p>
      <p>
        <img src={Smileurl} alt="smile" />
        <SvgSmile />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
    </div>
  );
}
