/**
 * config
 * @Author: liwb (lwbhtml@163.com)
 * @Date: 2025-09-26 16:09
 * @LastEditTime: 2025-09-26 16:09
 * @Description: config
 */
import Config from '@winner-fed/bundler-webpack/compiled/webpack-5-chain';
import type { IApi } from 'win';
import { addSVGRules } from './svgRules';

export async function getConfig(config: Config, api: IApi) {
  // asset
  await addSVGRules({ api, config });
}
