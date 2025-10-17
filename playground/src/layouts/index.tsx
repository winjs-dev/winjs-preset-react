import { Link, Outlet } from 'winjs';
import styles from './index.module.less';

export default function Layout() {
  return (
    <div className={styles.navs}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li>
          <a href="https://github.com/winjs-dev/winjs">Github</a>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
